# LiftLink Security and Safety Endpoints
# This file contains critical security features for user protection

from server import *

# ============ KYC AND DOCUMENT VERIFICATION ENDPOINTS ============

@app.post("/api/kyc/upload-document")
async def upload_kyc_document(
    upload_data: KYCDocumentUpload,
    current_user: dict = Depends(get_current_user),
    request: Request = None
):
    """Upload KYC documents for verification (ID, certifications, selfie)"""
    
    # Rate limiting for document uploads
    client_ip = get_client_ip(request)
    if not check_rate_limit(f"doc_upload_{client_ip}", 5, 60):  # 5 uploads per hour
        raise HTTPException(status_code=429, detail="Too many document uploads. Please try again later.")
    
    # Encrypt document data
    encrypted_data = cipher_suite.encrypt(upload_data.document_data.encode())
    
    # Create KYC document record
    kyc_document = KYCDocumentModel(
        user_id=current_user["user_id"],
        document_type=upload_data.document_type,
        document_data=base64.b64encode(encrypted_data).decode()
    )
    
    await db.kyc_documents.insert_one(kyc_document.dict())
    
    # Log security event
    await log_security_event(
        "kyc_document_uploaded",
        current_user["user_id"],
        {"document_type": upload_data.document_type},
        "INFO"
    )
    
    # If this is a selfie with existing ID, trigger face verification
    if upload_data.document_type == "selfie":
        # Check if user has uploaded ID
        id_doc = await db.kyc_documents.find_one({
            "user_id": current_user["user_id"],
            "document_type": "government_id",
            "verification_status": {"$in": ["pending", "verified"]}
        })
        
        if id_doc:
            # Decrypt both documents for face verification
            id_data = cipher_suite.decrypt(base64.b64decode(id_doc["document_data"]))
            selfie_data = cipher_suite.decrypt(encrypted_data)
            
            # Verify face match
            face_match = verify_face_match(id_data, selfie_data)
            
            if not face_match:
                await log_security_event(
                    "face_verification_failed",
                    current_user["user_id"],
                    {"id_document_id": id_doc["document_id"], "selfie_document_id": kyc_document.document_id},
                    "HIGH"
                )
            else:
                await log_security_event(
                    "face_verification_passed",
                    current_user["user_id"],
                    {"id_document_id": id_doc["document_id"], "selfie_document_id": kyc_document.document_id},
                    "INFO"
                )
    
    # Create manual review task for high-risk documents
    if upload_data.document_type in ["government_id", "certification"]:
        await create_manual_review_task(
            current_user["user_id"],
            f"{upload_data.document_type}_verification",
            {"document_id": kyc_document.document_id}
        )
    
    return {"document_id": kyc_document.document_id, "message": "Document uploaded successfully. Under review."}

@app.get("/api/kyc/status")
async def get_kyc_status(current_user: dict = Depends(get_current_user)):
    """Get user's KYC verification status"""
    
    documents = []
    async for doc in db.kyc_documents.find({"user_id": current_user["user_id"]}):
        documents.append({
            "document_id": doc["document_id"],
            "document_type": doc["document_type"],
            "verification_status": doc["verification_status"],
            "created_at": doc["created_at"],
            "verified_at": doc.get("verified_at"),
            "verification_notes": doc.get("verification_notes")
        })
    
    # Determine overall KYC status
    required_docs = ["government_id", "selfie"]
    if current_user.get("role") == "trainer":
        required_docs.append("certification")
    
    verified_docs = [doc for doc in documents if doc["verification_status"] == "verified"]
    verified_types = [doc["document_type"] for doc in verified_docs]
    
    kyc_status = "incomplete"
    if all(doc_type in verified_types for doc_type in required_docs):
        kyc_status = "verified"
    elif any(doc["verification_status"] == "rejected" for doc in documents):
        kyc_status = "rejected"
    elif any(doc["verification_status"] == "pending" for doc in documents):
        kyc_status = "under_review"
    
    return {
        "kyc_status": kyc_status,
        "documents": documents,
        "required_documents": required_docs
    }

# ============ MESSAGING SYSTEM WITH ENCRYPTION ============

@app.post("/api/messages/send")
async def send_message(
    message_data: MessageRequest,
    current_user: dict = Depends(get_current_user),
    request: Request = None
):
    """Send encrypted message with AI content analysis"""
    
    # Rate limiting for messages
    client_ip = get_client_ip(request)
    if not check_rate_limit(f"msg_{current_user['user_id']}", SECURITY_CONFIG["MAX_MESSAGES_PER_MINUTE"]):
        raise HTTPException(status_code=429, detail="Message rate limit exceeded")
    
    # Verify recipient exists
    recipient = await db.users.find_one({"user_id": message_data.recipient_id})
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # AI content analysis for suspicious patterns
    content_analysis = is_suspicious_content(message_data.content)
    
    # Get recipient's public key for encryption
    recipient_keys = await db.user_encryption_keys.find_one({"user_id": message_data.recipient_id})
    if not recipient_keys:
        # Generate keys for recipient if they don't exist
        private_key, public_key = generate_encryption_keypair()
        await db.user_encryption_keys.insert_one({
            "user_id": message_data.recipient_id,
            "private_key": private_key,
            "public_key": public_key,
            "created_at": datetime.utcnow()
        })
        recipient_keys = {"public_key": public_key}
    
    # Encrypt message content
    encrypted_content = encrypt_message(message_data.content, recipient_keys["public_key"])
    
    # Create message record
    message = MessageModel(
        sender_id=current_user["user_id"],
        recipient_id=message_data.recipient_id,
        content=encrypted_content,
        message_type=message_data.message_type,
        suspicion_score=content_analysis["suspicion_score"],
        suspicion_flags=content_analysis["flags"],
        is_flagged=content_analysis["is_suspicious"]
    )
    
    await db.messages.insert_one(message.dict())
    
    # Log suspicious content
    if content_analysis["is_suspicious"]:
        await log_security_event(
            "suspicious_message_sent",
            current_user["user_id"],
            {
                "recipient_id": message_data.recipient_id,
                "suspicion_score": content_analysis["suspicion_score"],
                "flags": content_analysis["flags"],
                "message_id": message.message_id
            },
            "HIGH"
        )
    
    # Track user behavior patterns
    await track_user_behavior(current_user["user_id"], "message_sent", {
        "recipient_id": message_data.recipient_id,
        "suspicion_score": content_analysis["suspicion_score"]
    })
    
    return {"message_id": message.message_id, "status": "sent"}

@app.get("/api/messages/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Get user's message conversations"""
    
    # Get unique conversation partners
    conversations = []
    
    # Find all messages where user is sender or recipient
    pipeline = [
        {
            "$match": {
                "$or": [
                    {"sender_id": current_user["user_id"]},
                    {"recipient_id": current_user["user_id"]}
                ]
            }
        },
        {
            "$addFields": {
                "other_user_id": {
                    "$cond": {
                        "if": {"$eq": ["$sender_id", current_user["user_id"]]},
                        "then": "$recipient_id",
                        "else": "$sender_id"
                    }
                }
            }
        },
        {
            "$group": {
                "_id": "$other_user_id",
                "last_message_id": {"$last": "$message_id"},
                "last_message_time": {"$last": "$created_at"},
                "unread_count": {
                    "$sum": {
                        "$cond": [
                            {
                                "$and": [
                                    {"$eq": ["$recipient_id", current_user["user_id"]]},
                                    {"$eq": ["$is_read", False]}
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {"$sort": {"last_message_time": -1}}
    ]
    
    async for conv in db.messages.aggregate(pipeline):
        # Get other user info
        other_user = await db.users.find_one({"user_id": conv["_id"]})
        if other_user:
            conversations.append({
                "user_id": conv["_id"],
                "user_name": other_user["name"],
                "user_role": other_user.get("role", "user"),
                "last_message_time": conv["last_message_time"],
                "unread_count": conv["unread_count"]
            })
    
    return {"conversations": conversations}

@app.get("/api/messages/conversation/{other_user_id}")
async def get_conversation_messages(
    other_user_id: str,
    limit: int = Query(50, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get messages in a conversation (decrypted for current user)"""
    
    # Get user's private key for decryption
    user_keys = await db.user_encryption_keys.find_one({"user_id": current_user["user_id"]})
    if not user_keys:
        raise HTTPException(status_code=400, detail="Encryption keys not found")
    
    # Get messages in conversation
    messages = []
    async for msg in db.messages.find({
        "$or": [
            {"sender_id": current_user["user_id"], "recipient_id": other_user_id},
            {"sender_id": other_user_id, "recipient_id": current_user["user_id"]}
        ]
    }).sort("created_at", -1).limit(limit):
        
        # Decrypt content if user is recipient
        decrypted_content = msg["content"]
        if msg["recipient_id"] == current_user["user_id"]:
            try:
                decrypted_content = decrypt_message(msg["content"], user_keys["private_key"])
            except:
                decrypted_content = "[Decryption failed]"
        
        messages.append({
            "message_id": msg["message_id"],
            "sender_id": msg["sender_id"],
            "content": decrypted_content,
            "message_type": msg["message_type"],
            "is_read": msg["is_read"],
            "created_at": msg["created_at"],
            "is_flagged": msg.get("is_flagged", False)
        })
    
    # Mark messages as read
    await db.messages.update_many(
        {
            "sender_id": other_user_id,
            "recipient_id": current_user["user_id"],
            "is_read": False
        },
        {"$set": {"is_read": True}}
    )
    
    return {"messages": list(reversed(messages))}

# ============ REVIEW AND RATING SYSTEM ============

@app.post("/api/reviews/create")
async def create_review(
    review_data: ReviewRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a review for a trainer"""
    
    # Verify trainer exists
    trainer = await db.trainers.find_one({"trainer_id": review_data.trainer_id})
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    # Check if user has had sessions with this trainer
    has_session = await db.bookings.find_one({
        "user_id": current_user["user_id"],
        "trainer_id": review_data.trainer_id,
        "status": "completed"
    })
    
    # Check for suspicious review content
    content_analysis = is_suspicious_content(review_data.review_text)
    
    review = ReviewModel(
        user_id=current_user["user_id"],
        trainer_id=review_data.trainer_id,
        rating=review_data.rating,
        review_text=review_data.review_text,
        session_id=review_data.session_id,
        is_verified_client=bool(has_session),
        moderation_status="approved" if not content_analysis["is_suspicious"] else "pending"
    )
    
    await db.reviews.insert_one(review.dict())
    
    # Update trainer's average rating
    await update_trainer_rating(review_data.trainer_id)
    
    # Log suspicious reviews
    if content_analysis["is_suspicious"]:
        await log_security_event(
            "suspicious_review_posted",
            current_user["user_id"],
            {
                "trainer_id": review_data.trainer_id,
                "review_id": review.review_id,
                "flags": content_analysis["flags"]
            },
            "MEDIUM"
        )
    
    return {"review_id": review.review_id, "message": "Review submitted successfully"}

async def update_trainer_rating(trainer_id: str):
    """Update trainer's average rating"""
    pipeline = [
        {"$match": {"trainer_id": trainer_id, "moderation_status": "approved"}},
        {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}, "total_reviews": {"$sum": 1}}}
    ]
    
    result = await db.reviews.aggregate(pipeline).to_list(1)
    if result:
        await db.trainers.update_one(
            {"trainer_id": trainer_id},
            {
                "$set": {
                    "average_rating": round(result[0]["avg_rating"], 2),
                    "total_reviews": result[0]["total_reviews"]
                }
            }
        )

@app.get("/api/reviews/trainer/{trainer_id}")
async def get_trainer_reviews(
    trainer_id: str,
    limit: int = Query(20, le=50)
):
    """Get reviews for a trainer"""
    
    reviews = []
    async for review in db.reviews.find({
        "trainer_id": trainer_id,
        "moderation_status": "approved"
    }).sort("created_at", -1).limit(limit):
        
        # Get reviewer info (anonymized)
        reviewer = await db.users.find_one({"user_id": review["user_id"]})
        review_data = serialize_doc(review)
        review_data["reviewer_name"] = reviewer["name"][:1] + "***" if reviewer else "Anonymous"
        review_data["is_verified_client"] = review.get("is_verified_client", False)
        
        # Remove sensitive fields
        review_data.pop("user_id", None)
        
        reviews.append(review_data)
    
    return {"reviews": reviews}

# ============ REPORTING AND MODERATION SYSTEM ============

@app.post("/api/reports/create")
async def create_report(
    report_data: ReportRequest,
    current_user: dict = Depends(get_current_user)
):
    """Report a user for inappropriate behavior"""
    
    # Verify reported user exists
    reported_user = await db.users.find_one({"user_id": report_data.reported_user_id})
    if not reported_user:
        raise HTTPException(status_code=404, detail="Reported user not found")
    
    # Determine priority based on reason
    priority_map = {
        "harassment": "high",
        "inappropriate_content": "medium",
        "fake_profile": "high",
        "scam": "critical",
        "safety_concern": "critical",
        "grooming": "critical"
    }
    
    priority = priority_map.get(report_data.reason, "medium")
    
    report = ReportModel(
        reporter_id=current_user["user_id"],
        reported_user_id=report_data.reported_user_id,
        reason=report_data.reason,
        description=report_data.description,
        evidence=report_data.evidence,
        priority=priority
    )
    
    await db.reports.insert_one(report.dict())
    
    # Log security event
    await log_security_event(
        "user_reported",
        current_user["user_id"],
        {
            "reported_user_id": report_data.reported_user_id,
            "reason": report_data.reason,
            "priority": priority,
            "report_id": report.report_id
        },
        "HIGH" if priority in ["high", "critical"] else "MEDIUM"
    )
    
    # Auto-create manual review task for high/critical priority
    if priority in ["high", "critical"]:
        await create_manual_review_task(
            report_data.reported_user_id,
            f"reported_{report_data.reason}",
            {
                "report_id": report.report_id,
                "reporter_id": current_user["user_id"],
                "description": report_data.description
            }
        )
    
    return {"report_id": report.report_id, "message": "Report submitted successfully"}

# ============ BEHAVIOR TRACKING SYSTEM ============

async def track_user_behavior(user_id: str, behavior_type: str, details: Dict[str, Any]):
    """Track user behavior for security analysis"""
    
    risk_score = 0
    
    # Calculate risk scores based on behavior
    if behavior_type == "rapid_registration":
        risk_score = 50
    elif behavior_type == "location_mismatch":
        risk_score = 30
    elif behavior_type == "suspicious_messaging":
        risk_score = details.get("suspicion_score", 0)
    elif behavior_type == "message_sent":
        risk_score = min(details.get("suspicion_score", 0), 25)
    
    if risk_score > 0:
        behavior = UserBehaviorModel(
            user_id=user_id,
            behavior_type=behavior_type,
            risk_score=risk_score,
            details=details
        )
        
        await db.user_behaviors.insert_one(behavior.dict())
        
        # Check if user's cumulative risk score is concerning
        await check_user_risk_profile(user_id)

async def check_user_risk_profile(user_id: str):
    """Check user's overall risk profile and take action if needed"""
    
    # Calculate risk score from last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    pipeline = [
        {"$match": {"user_id": user_id, "created_at": {"$gte": week_ago}}},
        {"$group": {"_id": None, "total_risk": {"$sum": "$risk_score"}}}
    ]
    
    result = await db.user_behaviors.aggregate(pipeline).to_list(1)
    total_risk = result[0]["total_risk"] if result else 0
    
    # Take action based on risk level
    if total_risk > 100:
        await log_security_event(
            "high_risk_user_detected",
            user_id,
            {"total_risk_score": total_risk, "period": "7_days"},
            "CRITICAL"
        )
        
        # Flag for immediate manual review
        await create_manual_review_task(
            user_id,
            "high_risk_behavior",
            {"total_risk_score": total_risk}
        )
        
        # Temporarily restrict account
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"account_status": "restricted", "restriction_reason": "security_review"}}
        )

# ============ TREE PROGRESSION SYSTEM ============

async def update_tree_progression(user_id: str, points_earned: int, milestone: str = None):
    """Update user's tree progression"""
    
    # Get current progression
    progression = await db.tree_progressions.find_one({"user_id": user_id})
    if not progression:
        progression = TreeProgressionModel(user_id=user_id).dict()
        await db.tree_progressions.insert_one(progression)
    
    # Add points
    new_points = progression["progress_points"] + points_earned
    current_stage = progression["current_stage"]
    
    # Check for stage upgrade
    for stage_name, stage_info in TREE_STAGES.items():
        if new_points >= stage_info["required_points"] and stage_name != current_stage:
            # Check if this is a higher stage
            current_stage_points = TREE_STAGES[current_stage]["required_points"]
            if stage_info["required_points"] > current_stage_points:
                current_stage = stage_name
                
                # Award bonus coins for stage upgrade
                await award_coins(user_id, 500, f"tree_upgrade_{stage_name}")
                
                # Create social activity
                activity = SocialActivityModel(
                    activity_id=str(uuid.uuid4()),
                    user_id=user_id,
                    activity_type="tree_upgrade",
                    title=f"Evolved to {stage_info['name']}!",
                    description=f"🎉 {stage_info['description']}",
                    metadata={"stage": stage_name, "points": new_points}
                )
                await db.social_activities.insert_one(activity.dict())
    
    # Add milestone if provided
    milestones = progression.get("milestones_completed", [])
    if milestone and milestone not in milestones:
        milestones.append(milestone)
    
    # Update progression
    await db.tree_progressions.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "progress_points": new_points,
                "current_stage": current_stage,
                "milestones_completed": milestones
            }
        },
        upsert=True
    )
    
    return {
        "current_stage": current_stage,
        "stage_info": TREE_STAGES[current_stage],
        "progress_points": new_points,
        "milestone_added": milestone
    }

@app.get("/api/tree/progression/{user_id}")
async def get_tree_progression(user_id: str):
    """Get user's tree progression status"""
    
    progression = await db.tree_progressions.find_one({"user_id": user_id})
    if not progression:
        # Initialize new progression
        await update_tree_progression(user_id, 0)
        progression = await db.tree_progressions.find_one({"user_id": user_id})
    
    current_stage = progression["current_stage"]
    stage_info = TREE_STAGES[current_stage]
    
    # Find next stage
    next_stage = None
    stages_list = list(TREE_STAGES.keys())
    current_index = stages_list.index(current_stage)
    if current_index < len(stages_list) - 1:
        next_stage_name = stages_list[current_index + 1]
        next_stage = TREE_STAGES[next_stage_name]
        next_stage["name"] = next_stage_name
    
    return {
        "current_stage": {
            "name": current_stage,
            **stage_info
        },
        "next_stage": next_stage,
        "progress_points": progression["progress_points"],
        "milestones_completed": progression.get("milestones_completed", []),
        "progress_to_next": (
            (progression["progress_points"] - stage_info["required_points"]) / 
            (next_stage["required_points"] - stage_info["required_points"]) * 100
        ) if next_stage else 100
    }
