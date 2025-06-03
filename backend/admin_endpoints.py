# LiftLink Admin Panel and Moderation Endpoints
# Critical security administration features

from server import *

# ============ ADMIN AUTHENTICATION ============

async def verify_admin_user(current_user: dict = Depends(get_current_user)):
    """Verify user has admin privileges"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ============ KYC VERIFICATION ENDPOINTS ============

@app.get("/api/admin/kyc/pending")
async def get_pending_kyc_verifications(
    admin_user: dict = Depends(verify_admin_user),
    limit: int = Query(50, le=100)
):
    """Get pending KYC documents for manual review"""
    
    pending_docs = []
    async for doc in db.kyc_documents.find({
        "verification_status": "pending"
    }).sort("created_at", 1).limit(limit):
        
        # Get user info
        user = await db.users.find_one({"user_id": doc["user_id"]})
        
        doc_data = serialize_doc(doc)
        doc_data["user_name"] = user["name"] if user else "Unknown"
        doc_data["user_email"] = user["email"] if user else "Unknown"
        doc_data["user_role"] = user.get("role", "user") if user else "user"
        
        # Don't include encrypted document data in list view
        doc_data.pop("document_data", None)
        
        pending_docs.append(doc_data)
    
    return {"pending_documents": pending_docs}

@app.get("/api/admin/kyc/document/{document_id}")
async def get_kyc_document_details(
    document_id: str,
    admin_user: dict = Depends(verify_admin_user)
):
    """Get KYC document details for review"""
    
    doc = await db.kyc_documents.find_one({"document_id": document_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get user info
    user = await db.users.find_one({"user_id": doc["user_id"]})
    
    # Decrypt document data for admin review
    try:
        decrypted_data = cipher_suite.decrypt(base64.b64decode(doc["document_data"]))
        doc["document_data"] = base64.b64encode(decrypted_data).decode()
    except:
        doc["document_data"] = None
    
    # Get user's other documents for cross-reference
    other_docs = []
    async for other_doc in db.kyc_documents.find({
        "user_id": doc["user_id"],
        "document_id": {"$ne": document_id}
    }):
        other_docs.append({
            "document_id": other_doc["document_id"],
            "document_type": other_doc["document_type"],
            "verification_status": other_doc["verification_status"],
            "created_at": other_doc["created_at"]
        })
    
    return {
        "document": serialize_doc(doc),
        "user_info": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "user"),
            "created_at": user.get("created_at")
        } if user else None,
        "other_documents": other_docs
    }

@app.post("/api/admin/kyc/verify/{document_id}")
async def verify_kyc_document(
    document_id: str,
    action_data: AdminActionRequest,
    admin_user: dict = Depends(verify_admin_user)
):
    """Approve or reject KYC document"""
    
    doc = await db.kyc_documents.find_one({"document_id": document_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if action_data.action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")
    
    # Update document status
    update_data = {
        "verification_status": "verified" if action_data.action == "approve" else "rejected",
        "verification_notes": action_data.reason,
        "verified_by": admin_user["user_id"],
        "verified_at": datetime.utcnow()
    }
    
    await db.kyc_documents.update_one(
        {"document_id": document_id},
        {"$set": update_data}
    )
    
    # Update user verification status if all required documents are verified
    if action_data.action == "approve":
        await check_and_update_user_verification_status(doc["user_id"])
    
    # Log admin action
    await log_security_event(
        f"kyc_document_{action_data.action}",
        doc["user_id"],
        {
            "document_id": document_id,
            "document_type": doc["document_type"],
            "admin_id": admin_user["user_id"],
            "reason": action_data.reason
        },
        "INFO"
    )
    
    # Create notification for user
    notification = NotificationModel(
        notification_id=str(uuid.uuid4()),
        user_id=doc["user_id"],
        title=f"Document {'Verified' if action_data.action == 'approve' else 'Rejected'}",
        message=f"Your {doc['document_type']} has been {update_data['verification_status']}. {action_data.reason}",
        notification_type="kyc_update"
    )
    await db.notifications.insert_one(notification.dict())
    
    return {"message": f"Document {action_data.action}d successfully"}

async def check_and_update_user_verification_status(user_id: str):
    """Check if user has all required documents verified and update status"""
    
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        return
    
    # Define required documents
    required_docs = ["government_id", "selfie"]
    if user.get("role") == "trainer":
        required_docs.append("certification")
    
    # Check verification status
    verified_docs = []
    async for doc in db.kyc_documents.find({
        "user_id": user_id,
        "verification_status": "verified"
    }):
        verified_docs.append(doc["document_type"])
    
    # Update user verification status
    if all(doc_type in verified_docs for doc_type in required_docs):
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"id_verified": True, "id_verification_status": "verified"}}
        )
        
        # Award verification bonus
        if user.get("role") == "trainer":
            await award_coins(user_id, 1000, "trainer_verification_complete")
        else:
            await award_coins(user_id, 500, "user_verification_complete")

# ============ MANUAL REVIEW QUEUE ============

@app.get("/api/admin/review-queue")
async def get_manual_review_queue(
    admin_user: dict = Depends(verify_admin_user),
    status: str = Query("pending"),
    priority: str = Query(None)
):
    """Get manual review tasks for admin"""
    
    query = {"status": status}
    if priority:
        query["priority"] = priority
    
    tasks = []
    async for task in db.manual_review_tasks.find(query).sort("created_at", 1):
        # Get user info
        user = await db.users.find_one({"user_id": task["user_id"]})
        
        task_data = serialize_doc(task)
        task_data["user_name"] = user["name"] if user else "Unknown"
        task_data["user_email"] = user["email"] if user else "Unknown"
        task_data["user_role"] = user.get("role", "user") if user else "user"
        
        tasks.append(task_data)
    
    return {"review_tasks": tasks}

@app.get("/api/admin/review-task/{task_id}")
async def get_review_task_details(
    task_id: str,
    admin_user: dict = Depends(verify_admin_user)
):
    """Get detailed information for a review task"""
    
    task = await db.manual_review_tasks.find_one({"task_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Review task not found")
    
    # Get user info and related data
    user = await db.users.find_one({"user_id": task["user_id"]})
    
    # Get related security events
    security_events = []
    async for event in db.security_events.find({
        "user_id": task["user_id"]
    }).sort("timestamp", -1).limit(10):
        security_events.append(serialize_doc(event))
    
    # Get user behavior history
    behaviors = []
    async for behavior in db.user_behaviors.find({
        "user_id": task["user_id"]
    }).sort("created_at", -1).limit(20):
        behaviors.append(serialize_doc(behavior))
    
    # Get recent messages if task relates to messaging
    recent_messages = []
    if "message" in task["reason"]:
        async for msg in db.messages.find({
            "$or": [
                {"sender_id": task["user_id"]},
                {"recipient_id": task["user_id"]}
            ],
            "is_flagged": True
        }).sort("created_at", -1).limit(10):
            recent_messages.append(serialize_doc(msg))
    
    return {
        "task": serialize_doc(task),
        "user_info": serialize_doc(user) if user else None,
        "security_events": security_events,
        "behavior_history": behaviors,
        "flagged_messages": recent_messages
    }

@app.post("/api/admin/review-task/{task_id}/resolve")
async def resolve_review_task(
    task_id: str,
    action_data: AdminActionRequest,
    admin_user: dict = Depends(verify_admin_user)
):
    """Resolve a manual review task"""
    
    task = await db.manual_review_tasks.find_one({"task_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Review task not found")
    
    # Update task status
    resolution_data = {
        "status": "resolved",
        "assigned_admin": admin_user["user_id"],
        "resolution": {
            "action": action_data.action,
            "reason": action_data.reason,
            "details": action_data.details,
            "resolved_at": datetime.utcnow()
        }
    }
    
    await db.manual_review_tasks.update_one(
        {"task_id": task_id},
        {"$set": resolution_data}
    )
    
    # Take action based on admin decision
    if action_data.action == "ban":
        await ban_user(task["user_id"], action_data.reason, admin_user["user_id"])
    elif action_data.action == "restrict":
        await restrict_user(task["user_id"], action_data.reason, admin_user["user_id"])
    elif action_data.action == "warn":
        await warn_user(task["user_id"], action_data.reason, admin_user["user_id"])
    
    # Log admin action
    await log_security_event(
        f"manual_review_{action_data.action}",
        task["user_id"],
        {
            "task_id": task_id,
            "admin_id": admin_user["user_id"],
            "action": action_data.action,
            "reason": action_data.reason
        },
        "INFO"
    )
    
    return {"message": f"Task resolved with action: {action_data.action}"}

# ============ USER MODERATION ACTIONS ============

async def ban_user(user_id: str, reason: str, admin_id: str):
    """Ban a user account"""
    
    await db.users.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "account_status": "banned",
                "ban_reason": reason,
                "banned_by": admin_id,
                "banned_at": datetime.utcnow()
            }
        }
    )
    
    # Create notification
    notification = NotificationModel(
        notification_id=str(uuid.uuid4()),
        user_id=user_id,
        title="Account Suspended",
        message=f"Your account has been suspended. Reason: {reason}",
        notification_type="account_action"
    )
    await db.notifications.insert_one(notification.dict())

async def restrict_user(user_id: str, reason: str, admin_id: str):
    """Restrict user account (limited functionality)"""
    
    await db.users.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "account_status": "restricted",
                "restriction_reason": reason,
                "restricted_by": admin_id,
                "restricted_at": datetime.utcnow()
            }
        }
    )
    
    # Create notification
    notification = NotificationModel(
        notification_id=str(uuid.uuid4()),
        user_id=user_id,
        title="Account Restricted",
        message=f"Your account has been restricted. Reason: {reason}",
        notification_type="account_action"
    )
    await db.notifications.insert_one(notification.dict())

async def warn_user(user_id: str, reason: str, admin_id: str):
    """Issue warning to user"""
    
    # Create warning record
    warning = {
        "warning_id": str(uuid.uuid4()),
        "user_id": user_id,
        "reason": reason,
        "issued_by": admin_id,
        "issued_at": datetime.utcnow()
    }
    await db.user_warnings.insert_one(warning)
    
    # Create notification
    notification = NotificationModel(
        notification_id=str(uuid.uuid4()),
        user_id=user_id,
        title="Warning Issued",
        message=f"You have received a warning. Reason: {reason}",
        notification_type="account_action"
    )
    await db.notifications.insert_one(notification.dict())

# ============ SECURITY ANALYTICS ============

@app.get("/api/admin/security/analytics")
async def get_security_analytics(
    admin_user: dict = Depends(verify_admin_user),
    days: int = Query(7, le=30)
):
    """Get security analytics dashboard data"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Security events summary
    events_pipeline = [
        {"$match": {"timestamp": {"$gte": start_date}}},
        {"$group": {
            "_id": "$event_type",
            "count": {"$sum": 1},
            "high_severity": {"$sum": {"$cond": [{"$in": ["$severity", ["HIGH", "CRITICAL"]]}, 1, 0]}}
        }},
        {"$sort": {"count": -1}}
    ]
    
    security_events = await db.security_events.aggregate(events_pipeline).to_list(None)
    
    # High-risk users
    risk_pipeline = [
        {"$match": {"created_at": {"$gte": start_date}}},
        {"$group": {
            "_id": "$user_id",
            "total_risk": {"$sum": "$risk_score"},
            "behavior_count": {"$sum": 1}
        }},
        {"$match": {"total_risk": {"$gte": 50}}},
        {"$sort": {"total_risk": -1}},
        {"$limit": 10}
    ]
    
    high_risk_users = await db.user_behaviors.aggregate(risk_pipeline).to_list(None)
    
    # Get user names for high-risk users
    for user_data in high_risk_users:
        user = await db.users.find_one({"user_id": user_data["_id"]})
        user_data["user_name"] = user["name"] if user else "Unknown"
        user_data["user_email"] = user["email"] if user else "Unknown"
    
    # Pending reviews count
    pending_kyc = await db.kyc_documents.count_documents({"verification_status": "pending"})
    pending_reviews = await db.manual_review_tasks.count_documents({"status": "pending"})
    pending_reports = await db.reports.count_documents({"status": "pending"})
    
    # Recent flagged messages
    flagged_messages = await db.messages.count_documents({
        "is_flagged": True,
        "created_at": {"$gte": start_date}
    })
    
    return {
        "period_days": days,
        "security_events": security_events,
        "high_risk_users": high_risk_users,
        "pending_items": {
            "kyc_documents": pending_kyc,
            "manual_reviews": pending_reviews,
            "reports": pending_reports
        },
        "flagged_messages": flagged_messages,
        "summary": {
            "total_events": sum(event["count"] for event in security_events),
            "critical_events": sum(event["high_severity"] for event in security_events),
            "total_high_risk_users": len(high_risk_users)
        }
    }

# ============ REPORTS MANAGEMENT ============

@app.get("/api/admin/reports")
async def get_reports(
    admin_user: dict = Depends(verify_admin_user),
    status: str = Query("pending"),
    priority: str = Query(None)
):
    """Get user reports for admin review"""
    
    query = {"status": status}
    if priority:
        query["priority"] = priority
    
    reports = []
    async for report in db.reports.find(query).sort("created_at", 1):
        # Get reporter and reported user info
        reporter = await db.users.find_one({"user_id": report["reporter_id"]})
        reported_user = await db.users.find_one({"user_id": report["reported_user_id"]})
        
        report_data = serialize_doc(report)
        report_data["reporter_name"] = reporter["name"] if reporter else "Unknown"
        report_data["reported_user_name"] = reported_user["name"] if reported_user else "Unknown"
        report_data["reported_user_email"] = reported_user["email"] if reported_user else "Unknown"
        
        reports.append(report_data)
    
    return {"reports": reports}

@app.post("/api/admin/reports/{report_id}/resolve")
async def resolve_report(
    report_id: str,
    action_data: AdminActionRequest,
    admin_user: dict = Depends(verify_admin_user)
):
    """Resolve a user report"""
    
    report = await db.reports.find_one({"report_id": report_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Update report status
    await db.reports.update_one(
        {"report_id": report_id},
        {
            "$set": {
                "status": "resolved",
                "assigned_admin": admin_user["user_id"],
                "resolved_at": datetime.utcnow(),
                "resolution": action_data.reason
            }
        }
    )
    
    # Take action if needed
    if action_data.action in ["ban", "restrict", "warn"]:
        if action_data.action == "ban":
            await ban_user(report["reported_user_id"], action_data.reason, admin_user["user_id"])
        elif action_data.action == "restrict":
            await restrict_user(report["reported_user_id"], action_data.reason, admin_user["user_id"])
        elif action_data.action == "warn":
            await warn_user(report["reported_user_id"], action_data.reason, admin_user["user_id"])
    
    # Notify reporter
    notification = NotificationModel(
        notification_id=str(uuid.uuid4()),
        user_id=report["reporter_id"],
        title="Report Update",
        message=f"Your report has been reviewed. Action taken: {action_data.action}",
        notification_type="report_update"
    )
    await db.notifications.insert_one(notification.dict())
    
    return {"message": "Report resolved successfully"}

# ============ AUDIT LOGS ============

@app.get("/api/admin/audit-logs")
async def get_audit_logs(
    admin_user: dict = Depends(verify_admin_user),
    event_type: str = Query(None),
    user_id: str = Query(None),
    days: int = Query(7, le=30)
):
    """Get security audit logs"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = {"timestamp": {"$gte": start_date}}
    if event_type:
        query["event_type"] = event_type
    if user_id:
        query["user_id"] = user_id
    
    logs = []
    async for log in db.security_events.find(query).sort("timestamp", -1).limit(500):
        # Get user name if available
        if log.get("user_id"):
            user = await db.users.find_one({"user_id": log["user_id"]})
            log["user_name"] = user["name"] if user else "Unknown"
        
        logs.append(serialize_doc(log))
    
    return {"audit_logs": logs}

# ============ SYSTEM HEALTH ============

@app.get("/api/admin/system/health")
async def get_system_health(admin_user: dict = Depends(verify_admin_user)):
    """Get system health metrics"""
    
    # Database collection counts
    users_count = await db.users.count_documents({})
    trainers_count = await db.trainers.count_documents({})
    messages_count = await db.messages.count_documents({})
    bookings_count = await db.bookings.count_documents({})
    
    # Security metrics
    banned_users = await db.users.count_documents({"account_status": "banned"})
    restricted_users = await db.users.count_documents({"account_status": "restricted"})
    pending_kyc = await db.kyc_documents.count_documents({"verification_status": "pending"})
    
    # Recent activity (last 24 hours)
    yesterday = datetime.utcnow() - timedelta(days=1)
    new_users_today = await db.users.count_documents({"created_at": {"$gte": yesterday}})
    new_bookings_today = await db.bookings.count_documents({"created_at": {"$gte": yesterday}})
    messages_today = await db.messages.count_documents({"created_at": {"$gte": yesterday}})
    
    return {
        "database_metrics": {
            "total_users": users_count,
            "total_trainers": trainers_count,
            "total_messages": messages_count,
            "total_bookings": bookings_count
        },
        "security_metrics": {
            "banned_users": banned_users,
            "restricted_users": restricted_users,
            "pending_kyc_documents": pending_kyc
        },
        "daily_activity": {
            "new_users": new_users_today,
            "new_bookings": new_bookings_today,
            "messages_sent": messages_today
        },
        "system_status": "healthy"  # In production, add more health checks
    }
