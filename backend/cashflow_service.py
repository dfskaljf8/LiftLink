"""
LiftLink Cash Flow & Revenue Tracking Service
Tracks all money flow: revenue, payouts, trainer earnings, analytics
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from uuid import uuid4
from enum import Enum
from motor.motor_asyncio import AsyncIOMotorDatabase
import stripe
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')


class TransactionType(str, Enum):
    """Types of financial transactions"""
    PAYMENT = "payment"  # Client pays for session
    PAYOUT = "payout"  # Platform pays trainer
    REFUND = "refund"  # Refund to client
    SUBSCRIPTION = "subscription"  # Recurring payment
    TIP = "tip"  # Client tip to trainer
    BONUS = "bonus"  # Platform bonus to trainer


class TransactionStatus(str, Enum):
    """Status of transactions"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class CashFlowService:
    """
    Comprehensive cash flow tracking for LiftLink
    Tracks revenue, expenses, trainer earnings, and provides analytics
    """
    
    def __init__(self, db: AsyncIOMotorDatabase = None):
        self.db = db
    
    def set_db(self, db: AsyncIOMotorDatabase):
        """Set database connection"""
        self.db = db
    
    # ==================== TRANSACTION RECORDING ====================
    
    async def record_transaction(
        self,
        transaction_type: TransactionType,
        amount: float,
        currency: str = "USD",
        from_user_id: str = None,
        to_user_id: str = None,
        session_id: str = None,
        stripe_payment_intent_id: str = None,
        stripe_transfer_id: str = None,
        metadata: Dict = None
    ) -> Dict:
        """Record a financial transaction"""
        if not self.db:
            return {"error": "Database not connected"}
        
        transaction = {
            "id": str(uuid4()),
            "type": transaction_type.value,
            "amount": amount,
            "currency": currency.upper(),
            "from_user_id": from_user_id,
            "to_user_id": to_user_id,
            "session_id": session_id,
            "stripe_payment_intent_id": stripe_payment_intent_id,
            "stripe_transfer_id": stripe_transfer_id,
            "status": TransactionStatus.COMPLETED.value,
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        
        await self.db.transactions.insert_one({**transaction, "_id": transaction["id"]})
        
        # Update running totals
        await self._update_totals(transaction)
        
        return transaction
    
    async def _update_totals(self, transaction: Dict):
        """Update running totals after a transaction"""
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        month = datetime.now(timezone.utc).strftime("%Y-%m")
        
        # Update daily totals
        if transaction["type"] == TransactionType.PAYMENT.value:
            await self.db.revenue_totals.update_one(
                {"date": today},
                {
                    "$inc": {
                        "total_revenue": transaction["amount"],
                        "transaction_count": 1
                    },
                    "$setOnInsert": {"created_at": datetime.now(timezone.utc).isoformat()}
                },
                upsert=True
            )
            
            # Update monthly totals
            await self.db.monthly_revenue.update_one(
                {"month": month},
                {
                    "$inc": {
                        "total_revenue": transaction["amount"],
                        "transaction_count": 1
                    }
                },
                upsert=True
            )
        
        # Update trainer earnings if applicable
        if transaction["to_user_id"] and transaction["type"] in [
            TransactionType.PAYMENT.value, 
            TransactionType.TIP.value
        ]:
            await self.db.trainer_earnings.update_one(
                {"trainer_id": transaction["to_user_id"], "month": month},
                {
                    "$inc": {
                        "total_earned": transaction["amount"],
                        "session_count": 1 if transaction["session_id"] else 0
                    },
                    "$setOnInsert": {"created_at": datetime.now(timezone.utc).isoformat()}
                },
                upsert=True
            )
    
    # ==================== STRIPE BALANCE ====================
    
    async def get_stripe_balance(self) -> Dict:
        """Get current Stripe account balance"""
        try:
            balance = stripe.Balance.retrieve()
            
            available = sum(b.amount for b in balance.available) / 100
            pending = sum(b.amount for b in balance.pending) / 100
            
            return {
                "available": available,
                "pending": pending,
                "total": available + pending,
                "currency": balance.available[0].currency.upper() if balance.available else "USD",
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        except Exception as e:
            print(f"❌ Stripe balance error: {e}")
            return {"error": str(e)}
    
    # ==================== REVENUE ANALYTICS ====================
    
    async def get_dashboard_stats(self) -> Dict:
        """Get comprehensive dashboard statistics"""
        if not self.db:
            return {"error": "Database not connected"}
        
        now = datetime.now(timezone.utc)
        today = now.strftime("%Y-%m-%d")
        this_month = now.strftime("%Y-%m")
        last_month = (now.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")
        week_ago = (now - timedelta(days=7)).isoformat()
        
        # Get Stripe balance
        stripe_balance = await self.get_stripe_balance()
        
        # Today's revenue
        today_stats = await self.db.revenue_totals.find_one(
            {"date": today}, {"_id": 0}
        ) or {"total_revenue": 0, "transaction_count": 0}
        
        # This month's revenue
        month_stats = await self.db.monthly_revenue.find_one(
            {"month": this_month}, {"_id": 0}
        ) or {"total_revenue": 0, "transaction_count": 0}
        
        # Last month's revenue (for comparison)
        last_month_stats = await self.db.monthly_revenue.find_one(
            {"month": last_month}, {"_id": 0}
        ) or {"total_revenue": 0, "transaction_count": 0}
        
        # Week's transactions
        week_transactions = await self.db.transactions.count_documents({
            "created_at": {"$gte": week_ago},
            "type": TransactionType.PAYMENT.value
        })
        
        # Calculate growth
        month_growth = 0
        if last_month_stats["total_revenue"] > 0:
            month_growth = ((month_stats["total_revenue"] - last_month_stats["total_revenue"]) 
                          / last_month_stats["total_revenue"]) * 100
        
        # Total all-time revenue
        all_time = await self.db.transactions.aggregate([
            {"$match": {"type": TransactionType.PAYMENT.value, "status": TransactionStatus.COMPLETED.value}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
        ]).to_list(1)
        
        all_time_stats = all_time[0] if all_time else {"total": 0, "count": 0}
        
        # Active trainers this month
        active_trainers = await self.db.trainer_earnings.count_documents({
            "month": this_month,
            "total_earned": {"$gt": 0}
        })
        
        return {
            "stripe_balance": stripe_balance,
            "today": {
                "revenue": today_stats["total_revenue"],
                "transactions": today_stats["transaction_count"]
            },
            "this_month": {
                "revenue": month_stats["total_revenue"],
                "transactions": month_stats["transaction_count"],
                "growth_percent": round(month_growth, 1)
            },
            "last_month": {
                "revenue": last_month_stats["total_revenue"],
                "transactions": last_month_stats["transaction_count"]
            },
            "this_week": {
                "transactions": week_transactions
            },
            "all_time": {
                "revenue": all_time_stats.get("total", 0),
                "transactions": all_time_stats.get("count", 0)
            },
            "active_trainers": active_trainers,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    
    async def get_revenue_chart(self, period: str = "30d") -> Dict:
        """Get revenue data for charts"""
        if not self.db:
            return {"error": "Database not connected"}
        
        now = datetime.now(timezone.utc)
        
        if period == "7d":
            days = 7
        elif period == "30d":
            days = 30
        elif period == "90d":
            days = 90
        else:
            days = 30
        
        start_date = (now - timedelta(days=days)).strftime("%Y-%m-%d")
        
        # Get daily revenue
        daily_revenue = await self.db.revenue_totals.find(
            {"date": {"$gte": start_date}},
            {"_id": 0}
        ).sort("date", 1).to_list(days + 1)
        
        # Fill in missing days with 0
        date_map = {r["date"]: r["total_revenue"] for r in daily_revenue}
        
        chart_data = []
        for i in range(days + 1):
            date = (now - timedelta(days=days - i)).strftime("%Y-%m-%d")
            chart_data.append({
                "date": date,
                "revenue": date_map.get(date, 0)
            })
        
        return {
            "period": period,
            "data": chart_data,
            "total": sum(d["revenue"] for d in chart_data)
        }
    
    # ==================== TRANSACTION HISTORY ====================
    
    async def get_transactions(
        self,
        limit: int = 50,
        offset: int = 0,
        transaction_type: str = None,
        status: str = None,
        from_date: str = None,
        to_date: str = None,
        user_id: str = None
    ) -> Dict:
        """Get transaction history with filters"""
        if not self.db:
            return {"error": "Database not connected"}
        
        query = {}
        
        if transaction_type:
            query["type"] = transaction_type
        
        if status:
            query["status"] = status
        
        if from_date:
            query["created_at"] = {"$gte": from_date}
        
        if to_date:
            if "created_at" in query:
                query["created_at"]["$lte"] = to_date
            else:
                query["created_at"] = {"$lte": to_date}
        
        if user_id:
            query["$or"] = [
                {"from_user_id": user_id},
                {"to_user_id": user_id}
            ]
        
        total = await self.db.transactions.count_documents(query)
        
        transactions = await self.db.transactions.find(
            query, {"_id": 0}
        ).sort("created_at", -1).skip(offset).limit(limit).to_list(limit)
        
        # Enrich with user names
        for tx in transactions:
            if tx.get("from_user_id"):
                user = await self.db.users.find_one(
                    {"id": tx["from_user_id"]}, {"_id": 0, "name": 1}
                )
                tx["from_user_name"] = user.get("name") if user else "Unknown"
            
            if tx.get("to_user_id"):
                user = await self.db.users.find_one(
                    {"id": tx["to_user_id"]}, {"_id": 0, "name": 1}
                )
                tx["to_user_name"] = user.get("name") if user else "Unknown"
        
        return {
            "transactions": transactions,
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total
        }
    
    # ==================== TRAINER EARNINGS ====================
    
    async def get_trainer_earnings(
        self,
        trainer_id: str,
        period: str = "all"
    ) -> Dict:
        """Get earnings for a specific trainer"""
        if not self.db:
            return {"error": "Database not connected"}
        
        now = datetime.now(timezone.utc)
        this_month = now.strftime("%Y-%m")
        
        # Get monthly breakdown
        earnings = await self.db.trainer_earnings.find(
            {"trainer_id": trainer_id},
            {"_id": 0}
        ).sort("month", -1).limit(12).to_list(12)
        
        # Calculate totals
        total_earned = sum(e.get("total_earned", 0) for e in earnings)
        total_sessions = sum(e.get("session_count", 0) for e in earnings)
        
        # This month
        this_month_data = next(
            (e for e in earnings if e["month"] == this_month), 
            {"total_earned": 0, "session_count": 0}
        )
        
        # Get pending payouts
        pending_transactions = await self.db.transactions.find({
            "to_user_id": trainer_id,
            "status": TransactionStatus.PENDING.value
        }, {"_id": 0}).to_list(100)
        
        pending_amount = sum(t.get("amount", 0) for t in pending_transactions)
        
        # Get recent transactions
        recent_transactions = await self.db.transactions.find({
            "to_user_id": trainer_id
        }, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
        
        return {
            "trainer_id": trainer_id,
            "total_earned": total_earned,
            "total_sessions": total_sessions,
            "this_month": {
                "earned": this_month_data.get("total_earned", 0),
                "sessions": this_month_data.get("session_count", 0)
            },
            "pending_payout": pending_amount,
            "monthly_breakdown": earnings,
            "recent_transactions": recent_transactions,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    
    async def get_top_trainers(self, limit: int = 10, month: str = None) -> List[Dict]:
        """Get top earning trainers"""
        if not self.db:
            return []
        
        if not month:
            month = datetime.now(timezone.utc).strftime("%Y-%m")
        
        top_trainers = await self.db.trainer_earnings.find(
            {"month": month},
            {"_id": 0}
        ).sort("total_earned", -1).limit(limit).to_list(limit)
        
        # Enrich with trainer info
        for trainer in top_trainers:
            user = await self.db.users.find_one(
                {"id": trainer["trainer_id"]},
                {"_id": 0, "name": 1, "profile_image": 1}
            )
            if user:
                trainer["name"] = user.get("name", "Unknown")
                trainer["profile_image"] = user.get("profile_image")
        
        return top_trainers
    
    # ==================== PAYOUTS ====================
    
    async def get_payout_summary(self) -> Dict:
        """Get summary of payouts"""
        if not self.db:
            return {"error": "Database not connected"}
        
        now = datetime.now(timezone.utc)
        this_month = now.strftime("%Y-%m")
        
        # Total payouts this month
        month_payouts = await self.db.transactions.aggregate([
            {
                "$match": {
                    "type": TransactionType.PAYOUT.value,
                    "created_at": {"$regex": f"^{this_month}"}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }
            }
        ]).to_list(1)
        
        month_payout_stats = month_payouts[0] if month_payouts else {"total": 0, "count": 0}
        
        # Pending payouts
        pending = await self.db.transactions.aggregate([
            {
                "$match": {
                    "type": TransactionType.PAYOUT.value,
                    "status": TransactionStatus.PENDING.value
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }
            }
        ]).to_list(1)
        
        pending_stats = pending[0] if pending else {"total": 0, "count": 0}
        
        return {
            "this_month": {
                "total_paid": month_payout_stats.get("total", 0),
                "payout_count": month_payout_stats.get("count", 0)
            },
            "pending": {
                "total_pending": pending_stats.get("total", 0),
                "pending_count": pending_stats.get("count", 0)
            },
            "generated_at": datetime.now(timezone.utc).isoformat()
        }


# Singleton instance
cash_flow_service = CashFlowService()
