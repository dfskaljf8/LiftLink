# Enhanced Age & ID Verification Service
# Real certification verification with OCR and validation

import cv2
import pytesseract
import PyPDF2
import pdf2image
import numpy as np
from PIL import Image
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from fuzzywuzzy import fuzz
import base64
import io
import logging
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class CertificationInfo:
    """Extracted certification information"""
    cert_type: str
    cert_number: str
    holder_name: str
    issue_date: Optional[datetime]
    expiry_date: Optional[datetime]
    issuing_authority: str
    confidence_score: float
    
class VerificationProgress:
    """Track multi-step verification progress"""
    
    STEPS = {
        "role_selection": 1,
        "id_upload": 2, 
        "selfie_capture": 3,
        "certification_upload": 4,  # Trainer only
        "verification_complete": 5
    }
    
    def __init__(self, user_id: str, role: str):
        self.user_id = user_id
        self.role = role
        self.completed_steps = set()
        self.current_step = 1
        self.verification_data = {}
        
    def complete_step(self, step: str, data: Dict = None):
        """Mark a step as completed and advance"""
        if step in self.STEPS:
            self.completed_steps.add(step)
            self.current_step = max(self.current_step, self.STEPS[step] + 1)
            
            if data:
                self.verification_data[step] = data
                
    def get_next_step(self) -> str:
        """Get the next required step"""
        for step, step_num in self.STEPS.items():
            if step not in self.completed_steps:
                # Skip certification for trainees
                if step == "certification_upload" and self.role == "trainee":
                    continue
                return step
        return "verification_complete"
        
    def is_complete(self) -> bool:
        """Check if verification is complete"""
        required_steps = ["role_selection", "id_upload", "selfie_capture"]
        if self.role == "trainer":
            required_steps.append("certification_upload")
            
        return all(step in self.completed_steps for step in required_steps)

class CertificationValidator:
    """Real certification validation using OCR and pattern matching"""
    
    # Known certification authorities and their patterns
    CERT_AUTHORITIES = {
        "NASM": {
            "name": "National Academy of Sports Medicine",
            "cert_patterns": [
                r"NASM[- ]?(?:CPT|CES|PES|CNC|WLS)",
                r"Certified Personal Trainer",
                r"National Academy of Sports Medicine"
            ],
            "number_pattern": r"[A-Z0-9]{6,12}",
            "website": "nasm.org"
        },
        "ACE": {
            "name": "American Council on Exercise", 
            "cert_patterns": [
                r"ACE[- ]?(?:CPT|GEI|MS|HFS)",
                r"American Council on Exercise",
                r"Personal Trainer Certification"
            ],
            "number_pattern": r"[A-Z0-9]{6,10}",
            "website": "acefitness.org"
        },
        "ISSA": {
            "name": "International Sports Sciences Association",
            "cert_patterns": [
                r"ISSA[- ]?(?:CPT|CFT|CES|CFN)",
                r"International Sports Sciences Association",
                r"Certified Fitness Trainer"
            ],
            "number_pattern": r"[A-Z0-9]{8,15}",
            "website": "issaonline.com"
        },
        "ACSM": {
            "name": "American College of Sports Medicine",
            "cert_patterns": [
                r"ACSM[- ]?(?:CPT|EP|CEP|GEI)",
                r"American College of Sports Medicine",
                r"Exercise Physiologist"
            ],
            "number_pattern": r"[A-Z0-9]{6,12}",
            "website": "acsm.org"
        },
        "CSCS": {
            "name": "Certified Strength and Conditioning Specialist",
            "cert_patterns": [
                r"CSCS",
                r"Strength and Conditioning Specialist",
                r"National Strength and Conditioning Association"
            ],
            "number_pattern": r"[A-Z0-9]{6,10}",
            "website": "nsca.com"
        }
    }
    
    def __init__(self):
        # Configure tesseract for better OCR
        self.tesseract_config = '--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,: /-'
        
    def preprocess_image(self, image_data: bytes) -> np.ndarray:
        """Preprocess image for better OCR accuracy"""
        try:
            # Convert to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to OpenCV format
            opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Convert to grayscale
            gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
            
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Apply adaptive threshold for better text extraction
            thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            
            # Remove noise with morphological operations
            kernel = np.ones((1, 1), np.uint8)
            cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            
            return cleaned
            
        except Exception as e:
            logger.error(f"Image preprocessing error: {e}")
            return None
    
    def extract_text_from_pdf(self, pdf_data: bytes) -> str:
        """Extract text from PDF certification"""
        try:
            # Try text extraction first
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_data))
            text = ""
            
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            # If no text found, convert to images and OCR
            if len(text.strip()) < 50:
                images = pdf2image.convert_from_bytes(pdf_data)
                text = ""
                
                for image in images:
                    # Convert PIL image to bytes for preprocessing
                    img_byte_arr = io.BytesIO()
                    image.save(img_byte_arr, format='PNG')
                    img_bytes = img_byte_arr.getvalue()
                    
                    processed_img = self.preprocess_image(img_bytes)
                    if processed_img is not None:
                        ocr_text = pytesseract.image_to_string(processed_img, config=self.tesseract_config)
                        text += ocr_text + "\n"
            
            return text
            
        except Exception as e:
            logger.error(f"PDF text extraction error: {e}")
            return ""
    
    def extract_text_from_image(self, image_data: bytes) -> str:
        """Extract text from image certification"""
        try:
            processed_img = self.preprocess_image(image_data)
            if processed_img is None:
                return ""
                
            text = pytesseract.image_to_string(processed_img, config=self.tesseract_config)
            return text
            
        except Exception as e:
            logger.error(f"Image OCR error: {e}")
            return ""
    
    def parse_certification_info(self, text: str, filename: str = "") -> CertificationInfo:
        """Parse certification information from extracted text"""
        text = text.upper().replace('\n', ' ').replace('\r', ' ')
        
        # Find certification type
        cert_type = "UNKNOWN"
        issuing_authority = "UNKNOWN"
        confidence_score = 0.0
        
        for cert_code, cert_info in self.CERT_AUTHORITIES.items():
            for pattern in cert_info["cert_patterns"]:
                if re.search(pattern, text, re.IGNORECASE):
                    cert_type = cert_code
                    issuing_authority = cert_info["name"]
                    confidence_score += 30.0
                    break
            if cert_type != "UNKNOWN":
                break
        
        # Extract certification number
        cert_number = "NOT_FOUND"
        if cert_type in self.CERT_AUTHORITIES:
            number_pattern = self.CERT_AUTHORITIES[cert_type]["number_pattern"]
            number_matches = re.findall(number_pattern, text)
            if number_matches:
                cert_number = number_matches[0]
                confidence_score += 25.0
        
        # Extract holder name (look for common name patterns)
        holder_name = "NOT_FOUND"
        name_patterns = [
            r"(?:CERTIFIED TO|AWARDED TO|THIS CERTIFIES THAT|NAME[:|\s])\s*([A-Z\s]{3,50})",
            r"([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\s*(?:HAS|IS|COMPLETED)",
        ]
        
        for pattern in name_patterns:
            name_match = re.search(pattern, text)
            if name_match:
                holder_name = name_match.group(1).strip()
                confidence_score += 20.0
                break
        
        # Extract dates
        issue_date = None
        expiry_date = None
        
        date_patterns = [
            r"(?:ISSUED|CERTIFIED|AWARDED).*?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"(?:ISSUE DATE|DATE OF ISSUE).*?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"(?:EXPIRES|EXPIRY|VALID UNTIL).*?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
        ]
        
        for pattern in date_patterns:
            date_match = re.search(pattern, text)
            if date_match:
                try:
                    date_str = date_match.group(1)
                    parsed_date = datetime.strptime(date_str.replace('-', '/'), '%m/%d/%Y')
                    
                    if "EXPIR" in pattern:
                        expiry_date = parsed_date
                    else:
                        issue_date = parsed_date
                    
                    confidence_score += 15.0
                except:
                    pass
        
        # Additional validation checks
        if len(text) > 100:
            confidence_score += 10.0
            
        # Check for authority website or contact info
        for cert_code, cert_info in self.CERT_AUTHORITIES.items():
            if cert_info["website"].replace(".", "") in text.replace(".", ""):
                confidence_score += 10.0
        
        return CertificationInfo(
            cert_type=cert_type,
            cert_number=cert_number,
            holder_name=holder_name,
            issue_date=issue_date,
            expiry_date=expiry_date,
            issuing_authority=issuing_authority,
            confidence_score=min(confidence_score, 100.0)
        )
    
    def validate_certification(self, file_data: bytes, filename: str, expected_name: str = None) -> Dict[str, Any]:
        """Validate a certification file and return detailed results"""
        
        # Determine file type and extract text
        file_lower = filename.lower()
        if file_lower.endswith('.pdf'):
            extracted_text = self.extract_text_from_pdf(file_data)
        elif file_lower.endswith(('.jpg', '.jpeg', '.png')):
            extracted_text = self.extract_text_from_image(file_data)
        else:
            return {
                "valid": False,
                "error": "Unsupported file type. Please upload PDF, JPG, or PNG files.",
                "confidence_score": 0.0
            }
        
        if not extracted_text or len(extracted_text.strip()) < 10:
            return {
                "valid": False,
                "error": "Could not extract text from certification. Please ensure the file is clear and readable.",
                "confidence_score": 0.0
            }
        
        # Parse certification information
        cert_info = self.parse_certification_info(extracted_text, filename)
        
        # Validation logic
        errors = []
        warnings = []
        
        # Check if certification type was identified
        if cert_info.cert_type == "UNKNOWN":
            errors.append("Certification type not recognized. Please upload a valid fitness certification from NASM, ACE, ISSA, ACSM, or CSCS.")
        
        # Check if certification number was found
        if cert_info.cert_number == "NOT_FOUND":
            errors.append("Certification number not found. Please ensure the certification number is clearly visible.")
        
        # Check if holder name was found and matches expected name
        if cert_info.holder_name == "NOT_FOUND":
            warnings.append("Holder name not clearly identified. Please ensure your name is visible on the certification.")
        elif expected_name:
            # Use fuzzy matching for name comparison
            name_similarity = fuzz.ratio(cert_info.holder_name.lower(), expected_name.lower())
            if name_similarity < 60:
                errors.append(f"Name on certification ({cert_info.holder_name}) does not match your profile name ({expected_name}).")
        
        # Check expiry date
        if cert_info.expiry_date:
            if cert_info.expiry_date < datetime.now():
                errors.append(f"Certification expired on {cert_info.expiry_date.strftime('%m/%d/%Y')}. Please upload a current certification.")
        else:
            warnings.append("Expiry date not found. Please ensure expiry date is visible on certification.")
        
        # Check confidence score
        if cert_info.confidence_score < 50.0:
            errors.append("Certification quality is too low. Please upload a clear, high-resolution image or PDF.")
        
        # Determine if valid
        is_valid = len(errors) == 0 and cert_info.confidence_score >= 50.0
        
        return {
            "valid": is_valid,
            "certification_info": {
                "type": cert_info.cert_type,
                "number": cert_info.cert_number,
                "holder_name": cert_info.holder_name,
                "issue_date": cert_info.issue_date.isoformat() if cert_info.issue_date else None,
                "expiry_date": cert_info.expiry_date.isoformat() if cert_info.expiry_date else None,
                "issuing_authority": cert_info.issuing_authority
            },
            "confidence_score": cert_info.confidence_score,
            "errors": errors,
            "warnings": warnings,
            "extracted_text": extracted_text[:500],  # First 500 chars for debugging
        }

class IDVerificationService:
    """Mock ID verification service with age validation"""
    
    def validate_id_document(self, file_data: bytes, filename: str, date_of_birth: str) -> Dict[str, Any]:
        """Mock ID validation with age verification"""
        
        # Validate file type
        allowed_types = ['.jpg', '.jpeg', '.png', '.pdf']
        if not any(filename.lower().endswith(ext) for ext in allowed_types):
            return {
                "valid": False,
                "error": "Invalid file type. Please upload JPG, PNG, or PDF files only.",
                "age_verified": False
            }
        
        # Validate date of birth and calculate age
        try:
            birth_date = datetime.strptime(date_of_birth, "%Y-%m-%d")
            today = datetime.now()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            
            if age < 18:
                return {
                    "valid": False,
                    "error": f"You must be 18 or older to use this platform. Current age: {age}",
                    "age_verified": False,
                    "age": age
                }
            
            # Mock validation - in real implementation, this would use document verification API
            mock_extracted_data = {
                "date_of_birth": date_of_birth,
                "age": age,
                "document_type": "drivers_license" if "license" in filename.lower() else "id_card",
                "verification_score": 95.0
            }
            
            return {
                "valid": True,
                "age_verified": True,
                "age": age,
                "extracted_data": mock_extracted_data,
                "verification_score": 95.0
            }
            
        except ValueError:
            return {
                "valid": False,
                "error": "Invalid date format. Please use YYYY-MM-DD format.",
                "age_verified": False
            }

class FaceVerificationService:
    """Mock face verification service with liveness detection"""
    
    def verify_face_match(self, id_image_data: bytes, selfie_data: bytes) -> Dict[str, Any]:
        """Mock face matching between ID and selfie"""
        
        # In real implementation, this would use face recognition API
        # For now, we'll do basic image validation
        
        try:
            # Validate both images can be opened
            id_image = Image.open(io.BytesIO(id_image_data))
            selfie_image = Image.open(io.BytesIO(selfie_data))
            
            # Basic size validation
            if id_image.size[0] < 100 or id_image.size[1] < 100:
                return {
                    "match": False,
                    "error": "ID image quality too low. Please upload a clear image.",
                    "confidence": 0.0
                }
            
            if selfie_image.size[0] < 200 or selfie_image.size[1] < 200:
                return {
                    "match": False,
                    "error": "Selfie quality too low. Please take a clear photo.",
                    "confidence": 0.0
                }
            
            # Mock successful face match
            return {
                "match": True,
                "confidence": 92.5,
                "liveness_score": 95.0,
                "verification_score": 93.8
            }
            
        except Exception as e:
            return {
                "match": False,
                "error": f"Failed to process images: {str(e)}",
                "confidence": 0.0
            }
    
    def detect_liveness(self, selfie_data: bytes) -> Dict[str, Any]:
        """Mock liveness detection for selfie"""
        
        try:
            image = Image.open(io.BytesIO(selfie_data))
            
            # Basic image quality checks
            if image.size[0] < 200 or image.size[1] < 200:
                return {
                    "live": False,
                    "error": "Image quality too low for liveness detection.",
                    "score": 0.0
                }
            
            # Mock liveness detection
            return {
                "live": True,
                "score": 94.2,
                "quality_score": 88.5
            }
            
        except Exception as e:
            return {
                "live": False,
                "error": f"Failed to analyze image: {str(e)}",
                "score": 0.0
            }

# Global service instances
certification_validator = CertificationValidator()
id_verification_service = IDVerificationService()
face_verification_service = FaceVerificationService()
