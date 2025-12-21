"""
OCR Service for Document Verification using Google Cloud Vision API
Handles age verification (ID documents) and trainer certification verification
"""

import os
import re
import base64
import httpx
from datetime import datetime, date
from typing import Dict, List, Optional, Tuple
from dotenv import load_dotenv

load_dotenv()

class OCRService:
    """Google Cloud Vision API OCR Service for document verification"""
    
    def __init__(self):
        self.api_key = os.environ.get('GOOGLE_VISION_API_KEY')
        self.vision_api_url = "https://vision.googleapis.com/v1/images:annotate"
        
        if not self.api_key:
            print("⚠️ Warning: GOOGLE_VISION_API_KEY not configured. OCR will use fallback mode.")
    
    async def extract_text_from_image(self, image_base64: str) -> Dict:
        """
        Extract text from image using Google Cloud Vision API
        Returns structured text data with the extracted content
        """
        if not self.api_key:
            return self._fallback_response("OCR API key not configured")
        
        try:
            # Prepare the request payload for Vision API
            request_body = {
                "requests": [
                    {
                        "image": {
                            "content": image_base64
                        },
                        "features": [
                            {
                                "type": "DOCUMENT_TEXT_DETECTION",
                                "maxResults": 10
                            }
                        ]
                    }
                ]
            }
            
            # Make async request to Vision API
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.vision_api_url}?key={self.api_key}",
                    json=request_body,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code != 200:
                    error_detail = response.json() if response.content else "Unknown error"
                    print(f"❌ Vision API Error: {response.status_code} - {error_detail}")
                    return self._fallback_response(f"Vision API returned {response.status_code}")
                
                result = response.json()
                
                # Extract text from response
                if "responses" in result and len(result["responses"]) > 0:
                    annotations = result["responses"][0]
                    
                    if "fullTextAnnotation" in annotations:
                        full_text = annotations["fullTextAnnotation"]["text"]
                        
                        # Extract text blocks with bounding boxes
                        text_blocks = []
                        if "textAnnotations" in annotations:
                            for annotation in annotations["textAnnotations"][1:]:  # Skip first (full text)
                                text_blocks.append({
                                    "text": annotation["description"],
                                    "confidence": annotation.get("confidence", 0.9)
                                })
                        
                        return {
                            "success": True,
                            "full_text": full_text,
                            "text_blocks": text_blocks,
                            "detected": True,
                            "confidence": 0.95  # Vision API doesn't always return confidence
                        }
                    elif "error" in annotations:
                        return self._fallback_response(annotations["error"].get("message", "OCR failed"))
                
                return self._fallback_response("No text detected in image")
                
        except httpx.TimeoutException:
            print("❌ Vision API timeout")
            return self._fallback_response("OCR request timed out")
        except Exception as e:
            print(f"❌ OCR Error: {e}")
            return self._fallback_response(str(e))
    
    def extract_date_of_birth(self, full_text: str) -> Tuple[Optional[str], float, Optional[int]]:
        """
        Extract date of birth from identity document text
        Returns tuple of (date_string, confidence_score, calculated_age)
        """
        if not full_text:
            return None, 0.0, None
        
        # Normalize text for searching
        cleaned_text = full_text.upper()
        
        # Date patterns for different formats
        date_patterns = [
            # DD/MM/YYYY or MM/DD/YYYY
            (r'\b(\d{1,2})[/](\d{1,2})[/](\d{4})\b', 'slash'),
            # DD-MM-YYYY
            (r'\b(\d{1,2})[-](\d{1,2})[-](\d{4})\b', 'dash'),
            # DD.MM.YYYY
            (r'\b(\d{1,2})[.](\d{1,2})[.](\d{4})\b', 'dot'),
            # YYYY-MM-DD (ISO format)
            (r'\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b', 'iso'),
        ]
        
        # Keywords commonly associated with date of birth
        dob_keywords = [
            'DOB', 'DATE OF BIRTH', 'BIRTH DATE', 'BORN', 'BIRTHDATE',
            'D.O.B', 'FECHA DE NACIMIENTO', 'DATE NAISSANCE', 'GEBURTSDATUM',
            'BN', 'BD'
        ]
        
        # First priority: Look for dates near DOB keywords
        lines = full_text.split('\n')
        for line in lines:
            line_upper = line.upper()
            if any(keyword in line_upper for keyword in dob_keywords):
                for pattern, fmt in date_patterns:
                    match = re.search(pattern, line)
                    if match:
                        date_str = match.group(0)
                        parsed_date, age = self._parse_and_validate_date(date_str, fmt)
                        if parsed_date:
                            return date_str, 0.95, age
        
        # Second priority: Search entire text for date patterns
        for pattern, fmt in date_patterns:
            matches = list(re.finditer(pattern, full_text))
            for match in matches:
                date_str = match.group(0)
                parsed_date, age = self._parse_and_validate_date(date_str, fmt)
                if parsed_date and age and 18 <= age <= 120:  # Reasonable age range
                    return date_str, 0.85, age
        
        return None, 0.0, None
    
    def _parse_and_validate_date(self, date_str: str, format_type: str) -> Tuple[Optional[date], Optional[int]]:
        """Parse date string and calculate age"""
        try:
            parts = re.split(r'[/\-.]', date_str)
            
            if format_type == 'iso':
                year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
            elif format_type in ['slash', 'dash', 'dot']:
                # Try DD/MM/YYYY first (most common for IDs)
                day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
                
                # Swap if values suggest MM/DD/YYYY
                if day > 12 and month <= 12:
                    pass  # Already DD/MM/YYYY
                elif month > 12 and day <= 12:
                    day, month = month, day  # Was MM/DD/YYYY
            else:
                return None, None
            
            # Validate date components
            if not (1 <= month <= 12 and 1 <= day <= 31 and 1900 <= year <= datetime.now().year):
                return None, None
            
            birth_date = date(year, month, day)
            
            # Calculate age
            today = date.today()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            
            return birth_date, age
            
        except (ValueError, IndexError):
            return None, None
    
    def extract_certification_details(self, full_text: str) -> Dict:
        """
        Extract fitness certification details from certificate images
        Returns dictionary with certification type, issuer, number, dates
        """
        details = {
            "certification_type": None,
            "certification_name": None,
            "certification_number": None,
            "issuer": None,
            "issue_date": None,
            "expiry_date": None,
            "holder_name": None,
            "confidence": 0.0,
            "is_valid": False
        }
        
        if not full_text:
            return details
        
        text_upper = full_text.upper()
        
        # Known fitness certification organizations
        cert_patterns = {
            "NASM": [r'\bNASM\b', r'\bNATIONAL ACADEMY OF SPORTS MEDICINE\b'],
            "ACE": [r'\bACE\b', r'\bAMERICAN COUNCIL ON EXERCISE\b'],
            "ACSM": [r'\bACSM\b', r'\bAMERICAN COLLEGE OF SPORTS MEDICINE\b'],
            "NSCA": [r'\bNSCA\b', r'\bNATIONAL STRENGTH AND CONDITIONING\b'],
            "ISSA": [r'\bISSA\b', r'\bINTERNATIONAL SPORTS SCIENCES ASSOCIATION\b'],
            "NCSF": [r'\bNCSF\b', r'\bNATIONAL COUNCIL ON STRENGTH\b'],
            "NFPT": [r'\bNFPT\b', r'\bNATIONAL FEDERATION OF PROFESSIONAL TRAINERS\b'],
            "AFAA": [r'\bAFAA\b', r'\bATHLETICS AND FITNESS ASSOCIATION\b'],
        }
        
        # Find certification type
        for cert_type, patterns in cert_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_upper):
                    details["certification_type"] = cert_type
                    details["confidence"] = 0.90
                    break
            if details["certification_type"]:
                break
        
        # Extract certification number (common patterns)
        cert_number_patterns = [
            r'(?:CERT(?:IFICATE)?|LICENSE|ID|NUMBER|NO|#)[:\s]*([A-Z0-9\-]{5,20})',
            r'\b([A-Z]{2,4}[-]?\d{4,10}[-]?[A-Z0-9]*)\b',  # e.g., NASM-1234567
        ]
        
        for pattern in cert_number_patterns:
            match = re.search(pattern, text_upper)
            if match:
                details["certification_number"] = match.group(1).strip()
                break
        
        # Extract dates from document
        date_pattern = r'\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b'
        dates_found = re.findall(date_pattern, full_text)
        
        if dates_found:
            # Try to identify issue and expiry dates
            parsed_dates = []
            for d in dates_found:
                try:
                    date_str = f"{d[0]}/{d[1]}/{d[2]}"
                    parsed_dates.append(date_str)
                except:
                    pass
            
            if len(parsed_dates) >= 1:
                details["issue_date"] = parsed_dates[0]
            if len(parsed_dates) >= 2:
                details["expiry_date"] = parsed_dates[1]
        
        # Extract holder name (typically after "CERTIFIED" or "AWARDED TO")
        name_patterns = [
            r'(?:CERTIF(?:IED|Y)|AWARDED TO|THIS IS TO CERTIFY THAT|PRESENTED TO)[:\s]*([A-Z][A-Z\s\.]+)',
            r'^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$',  # Simple name pattern
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, full_text, re.MULTILINE | re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                if len(name) > 3 and ' ' in name:  # Reasonable name
                    details["holder_name"] = name.title()
                    break
        
        # Determine validity
        if details["certification_type"] and (details["certification_number"] or details["holder_name"]):
            details["is_valid"] = True
            if details["confidence"] < 0.85:
                details["confidence"] = 0.85
        
        return details
    
    def _fallback_response(self, error_message: str) -> Dict:
        """Return a fallback response when OCR fails"""
        return {
            "success": False,
            "full_text": "",
            "text_blocks": [],
            "detected": False,
            "confidence": 0.0,
            "error": error_message
        }
    
    async def verify_age_document(self, image_base64: str, user_id: str = None) -> Dict:
        """
        Complete age verification workflow
        Returns verification result with extracted DOB and age check
        """
        # Extract text from image
        ocr_result = await self.extract_text_from_image(image_base64)
        
        if not ocr_result["success"] or not ocr_result["detected"]:
            return {
                "success": False,
                "age_verified": False,
                "rejection_reason": ocr_result.get("error", "Could not read document. Please upload a clearer image."),
                "extracted_text_preview": ""
            }
        
        # Extract date of birth
        dob, dob_confidence, age = self.extract_date_of_birth(ocr_result["full_text"])
        
        if not dob or age is None:
            return {
                "success": False,
                "age_verified": False,
                "rejection_reason": "Date of birth not found in document. Please ensure the full ID is visible.",
                "extracted_text_preview": ocr_result["full_text"][:200]
            }
        
        # Check if 18 or older
        is_adult = age >= 18
        
        return {
            "success": True,
            "age_verified": is_adult,
            "extracted_dob": dob,
            "calculated_age": age,
            "dob_confidence": dob_confidence,
            "ocr_confidence": ocr_result["confidence"],
            "rejection_reason": None if is_adult else f"Age verification failed. Detected age: {age}. You must be 18 or older.",
            "extracted_text_preview": ocr_result["full_text"][:200]
        }
    
    async def verify_certification_document(self, image_base64: str, expected_cert_type: str = None, user_id: str = None) -> Dict:
        """
        Complete certification verification workflow
        Returns verification result with extracted certification details
        """
        # Extract text from image
        ocr_result = await self.extract_text_from_image(image_base64)
        
        if not ocr_result["success"] or not ocr_result["detected"]:
            return {
                "success": False,
                "cert_verified": False,
                "rejection_reason": ocr_result.get("error", "Could not read document. Please upload a clearer image."),
                "certification_details": {}
            }
        
        # Extract certification details
        cert_details = self.extract_certification_details(ocr_result["full_text"])
        
        if not cert_details["is_valid"]:
            return {
                "success": False,
                "cert_verified": False,
                "rejection_reason": "Could not identify a valid fitness certification. Please ensure the full certificate is visible.",
                "certification_details": cert_details,
                "extracted_text_preview": ocr_result["full_text"][:200]
            }
        
        # Verify certification type matches expected (if provided)
        type_matches = True
        if expected_cert_type:
            type_matches = cert_details["certification_type"] == expected_cert_type.upper()
        
        # Check expiry date if present
        is_expired = False
        if cert_details["expiry_date"]:
            try:
                expiry_parts = cert_details["expiry_date"].split('/')
                expiry_date = date(int(expiry_parts[2]), int(expiry_parts[1]), int(expiry_parts[0]))
                is_expired = expiry_date < date.today()
            except:
                pass
        
        verified = cert_details["is_valid"] and type_matches and not is_expired
        
        rejection_reason = None
        if not verified:
            if not type_matches:
                rejection_reason = f"Certification type mismatch. Expected {expected_cert_type}, found {cert_details['certification_type']}."
            elif is_expired:
                rejection_reason = "Certification has expired. Please upload a current certification."
            else:
                rejection_reason = "Certification verification failed. Please ensure document is clearly visible."
        
        return {
            "success": True,
            "cert_verified": verified,
            "certification_type": cert_details["certification_type"],
            "certification_number": cert_details["certification_number"],
            "holder_name": cert_details["holder_name"],
            "issue_date": cert_details["issue_date"],
            "expiry_date": cert_details["expiry_date"],
            "confidence": cert_details["confidence"],
            "rejection_reason": rejection_reason,
            "extracted_text_preview": ocr_result["full_text"][:200]
        }


# Singleton instance
ocr_service = OCRService()
