"""
Document verification service for age and certification verification
"""
import os
import base64
import uuid
from datetime import datetime, date
from typing import Dict, Optional, List
import logging
import re

class VerificationService:
    def __init__(self):
        self.verification_storage = {}  # In production, use proper file storage
        
    def process_government_id(self, image_data: str, user_id: str, user_email: str) -> Dict:
        """Process government ID for age verification"""
        try:
            # In production, integrate with ID verification service like Jumio, Onfido, etc.
            # For now, we'll simulate the verification process
            
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Store the document (in production, use cloud storage)
            doc_id = f"gov_id_{user_id}_{uuid.uuid4().hex[:8]}"
            self.verification_storage[doc_id] = {
                "type": "government_id",
                "user_id": user_id,
                "user_email": user_email,
                "image_data": image_data,
                "uploaded_at": datetime.now().isoformat(),
                "status": "pending"
            }
            
            # Simulate ID verification logic
            verification_result = self._simulate_id_verification(image_data, user_email)
            
            print(f"🆔 GOVERNMENT ID VERIFICATION - User: {user_email}")
            print(f"   Document ID: {doc_id}")
            print(f"   Status: {verification_result['status']}")
            print(f"   Age: {verification_result.get('age', 'Unknown')}")
            print(f"   Valid: {verification_result.get('age_verified', False)}")
            
            return {
                "document_id": doc_id,
                "status": verification_result["status"],
                "age_verified": verification_result.get("age_verified", False),
                "age": verification_result.get("age"),
                "rejection_reason": verification_result.get("rejection_reason"),
                "processed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Government ID verification failed: {e}")
            return {
                "document_id": None,
                "status": "error",
                "age_verified": False,
                "rejection_reason": "Processing error occurred",
                "processed_at": datetime.now().isoformat()
            }
    
    def process_fitness_certification(self, image_data: str, cert_type: str, user_id: str, user_email: str) -> Dict:
        """Process fitness certification for trainers"""
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Store the certification document
            doc_id = f"cert_{cert_type}_{user_id}_{uuid.uuid4().hex[:8]}"
            self.verification_storage[doc_id] = {
                "type": "fitness_certification",
                "cert_type": cert_type,
                "user_id": user_id,
                "user_email": user_email,
                "image_data": image_data,
                "uploaded_at": datetime.now().isoformat(),
                "status": "pending"
            }
            
            # Simulate certification verification logic
            verification_result = self._simulate_certification_verification(image_data, cert_type, user_email)
            
            print(f"🏋️ FITNESS CERTIFICATION VERIFICATION - User: {user_email}")
            print(f"   Document ID: {doc_id}")
            print(f"   Certification Type: {cert_type}")
            print(f"   Status: {verification_result['status']}")
            print(f"   Valid: {verification_result.get('cert_verified', False)}")
            
            return {
                "document_id": doc_id,
                "cert_type": cert_type,
                "status": verification_result["status"],
                "cert_verified": verification_result.get("cert_verified", False),
                "expiry_date": verification_result.get("expiry_date"),
                "rejection_reason": verification_result.get("rejection_reason"),
                "processed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Certification verification failed: {e}")
            return {
                "document_id": None,
                "cert_type": cert_type,
                "status": "error",
                "cert_verified": False,
                "rejection_reason": "Processing error occurred",
                "processed_at": datetime.now().isoformat()
            }
    
    def _simulate_id_verification(self, image_data: str, user_email: str) -> Dict:
        """Simulate government ID verification (replace with real verification service)"""
        
        # Simulate different verification outcomes based on email
        if "test" in user_email.lower():
            # Test users - simulate various scenarios
            if "minor" in user_email.lower():
                return {
                    "status": "rejected",
                    "age": 16,
                    "age_verified": False,
                    "rejection_reason": "User is under 18 years old"
                }
            elif "invalid" in user_email.lower():
                return {
                    "status": "rejected",
                    "age_verified": False,
                    "rejection_reason": "Document is not a valid government ID"
                }
            elif "expired" in user_email.lower():
                return {
                    "status": "rejected",
                    "age_verified": False,
                    "rejection_reason": "Document has expired"
                }
            else:
                # Valid test user
                return {
                    "status": "approved",
                    "age": 25,
                    "age_verified": True
                }
        else:
            # For real users, simulate approval (in production, use real verification)
            return {
                "status": "approved",
                "age": 24,
                "age_verified": True
            }
    
    def _simulate_certification_verification(self, image_data: str, cert_type: str, user_email: str) -> Dict:
        """Simulate fitness certification verification"""
        
        valid_cert_types = ["NASM", "ACSM", "ACE", "NSCA", "ISSA", "NCSF"]
        
        if cert_type.upper() not in valid_cert_types:
            return {
                "status": "rejected",
                "cert_verified": False,
                "rejection_reason": f"Certification type '{cert_type}' is not recognized"
            }
        
        # Simulate different verification outcomes
        if "test" in user_email.lower():
            if "invalid" in user_email.lower():
                return {
                    "status": "rejected",
                    "cert_verified": False,
                    "rejection_reason": "Certification document is not valid or authentic"
                }
            elif "expired" in user_email.lower():
                return {
                    "status": "rejected",
                    "cert_verified": False,
                    "rejection_reason": "Certification has expired"
                }
            else:
                # Valid test certification
                return {
                    "status": "approved",
                    "cert_verified": True,
                    "expiry_date": "2026-12-31"
                }
        else:
            # For real users, simulate approval
            return {
                "status": "approved",
                "cert_verified": True,
                "expiry_date": "2026-06-30"
            }
    
    def get_verification_status(self, user_id: str) -> Dict:
        """Get overall verification status for a user"""
        # In production, query database for user's verification documents
        user_docs = [doc for doc in self.verification_storage.values() if doc["user_id"] == user_id]
        
        id_verification = None
        cert_verification = None
        
        for doc in user_docs:
            if doc["type"] == "government_id":
                id_verification = doc
            elif doc["type"] == "fitness_certification":
                cert_verification = doc
        
        return {
            "user_id": user_id,
            "id_verification": id_verification,
            "cert_verification": cert_verification,
            "overall_status": self._calculate_overall_status(id_verification, cert_verification)
        }
    
    def _calculate_overall_status(self, id_verification: Optional[Dict], cert_verification: Optional[Dict]) -> str:
        """Calculate overall verification status"""
        if not id_verification:
            return "id_required"
        
        if id_verification["status"] != "approved":
            return "id_rejected"
        
        # If user is a trainer, they also need certification
        if cert_verification is not None:
            if cert_verification["status"] != "approved":
                return "cert_rejected"
            return "fully_verified"
        
        # For trainees, only ID verification is needed
        return "age_verified"

# Global verification service instance
verification_service = VerificationService()