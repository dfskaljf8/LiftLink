"""
Enhanced OCR Service for Document Verification using Google Cloud Vision API
Validates Government IDs (passports, driver's licenses, national IDs) and Fitness Certifications
Cross-references extracted data with user profiles
"""

import os
import re
import base64
import httpx
from datetime import datetime, date
from typing import Dict, List, Optional, Tuple
from dotenv import load_dotenv

load_dotenv()


class DocumentType:
    """Supported document types for verification"""
    PASSPORT = "passport"
    DRIVERS_LICENSE = "drivers_license"
    NATIONAL_ID = "national_id"
    STATE_ID = "state_id"
    FITNESS_CERT = "fitness_cert"
    UNKNOWN = "unknown"


class OCRService:
    """Enhanced Google Cloud Vision API OCR Service for comprehensive document verification"""
    
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
                            },
                            {
                                "type": "TEXT_DETECTION",
                                "maxResults": 50
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
                            for annotation in annotations["textAnnotations"][1:]:
                                text_blocks.append({
                                    "text": annotation["description"],
                                    "confidence": annotation.get("confidence", 0.9)
                                })
                        
                        return {
                            "success": True,
                            "full_text": full_text,
                            "text_blocks": text_blocks,
                            "detected": True,
                            "confidence": 0.95
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
    
    def detect_document_type(self, full_text: str) -> str:
        """
        Detect the type of document from extracted text
        """
        if not full_text:
            return DocumentType.UNKNOWN
        
        text_upper = full_text.upper()
        
        # Passport indicators
        passport_indicators = [
            'PASSPORT', 'PASSEPORT', 'REISEPASS', 'PASAPORTE',
            'TRAVEL DOCUMENT', 'TYPE/TYPE', 'P<', 'MACHINE READABLE',
            'NATIONALITY', 'NATIONALITÉ', 'MRZ'
        ]
        
        # Driver's license indicators
        license_indicators = [
            'DRIVER', 'LICENSE', 'LICENCE', 'DRIVING', 'PERMIS DE CONDUIRE',
            'CLASS:', 'CATEGORY:', 'ENDORSEMENT', 'RESTRICTION',
            'DL', 'CDL', 'OPERATOR', 'VEHICLE'
        ]
        
        # National/State ID indicators
        id_indicators = [
            'IDENTIFICATION', 'ID CARD', 'IDENTITY CARD', 'NATIONAL ID',
            'STATE ID', 'RESIDENT', 'CITIZEN', 'TARJETA DE IDENTIDAD',
            'CARTE D\'IDENTITÉ', 'PERSONALAUSWEIS'
        ]
        
        # Fitness certification indicators
        cert_indicators = [
            'CERTIFIED', 'CERTIFICATION', 'CERTIFICATE',
            'NASM', 'ACE', 'ACSM', 'NSCA', 'ISSA', 'NCSF', 'AFAA', 'NFPT',
            'PERSONAL TRAINER', 'FITNESS INSTRUCTOR', 'STRENGTH AND CONDITIONING',
            'GROUP FITNESS', 'YOGA', 'PILATES', 'CROSSFIT'
        ]
        
        # Count matches for each type
        passport_score = sum(1 for ind in passport_indicators if ind in text_upper)
        license_score = sum(1 for ind in license_indicators if ind in text_upper)
        id_score = sum(1 for ind in id_indicators if ind in text_upper)
        cert_score = sum(1 for ind in cert_indicators if ind in text_upper)
        
        # Determine document type
        max_score = max(passport_score, license_score, id_score, cert_score)
        
        if max_score == 0:
            return DocumentType.UNKNOWN
        
        if cert_score == max_score and cert_score >= 2:
            return DocumentType.FITNESS_CERT
        elif passport_score == max_score and passport_score >= 2:
            return DocumentType.PASSPORT
        elif license_score == max_score and license_score >= 2:
            return DocumentType.DRIVERS_LICENSE
        elif id_score == max_score and id_score >= 1:
            return DocumentType.NATIONAL_ID
        
        return DocumentType.UNKNOWN
    
    def extract_name_from_document(self, full_text: str, doc_type: str) -> Optional[str]:
        """
        Extract the holder's name from the document
        """
        if not full_text:
            return None
        
        lines = full_text.split('\n')
        text_upper = full_text.upper()
        
        # Name keywords
        name_keywords = [
            'NAME', 'FULL NAME', 'SURNAME', 'FAMILY NAME', 'GIVEN NAME',
            'FIRST NAME', 'LAST NAME', 'NOM', 'PRÉNOM', 'NOMBRE'
        ]
        
        # Look for name near keywords
        for i, line in enumerate(lines):
            line_upper = line.upper()
            for keyword in name_keywords:
                if keyword in line_upper:
                    # Check same line after keyword
                    parts = re.split(f'{keyword}[:\s]*', line, flags=re.IGNORECASE)
                    if len(parts) > 1 and parts[1].strip():
                        name = parts[1].strip()
                        if self._is_valid_name(name):
                            return name.title()
                    
                    # Check next line
                    if i + 1 < len(lines):
                        next_line = lines[i + 1].strip()
                        if self._is_valid_name(next_line):
                            return next_line.title()
        
        # Passport MRZ extraction
        if doc_type == DocumentType.PASSPORT:
            mrz_name = self._extract_name_from_mrz(full_text)
            if mrz_name:
                return mrz_name
        
        return None
    
    def _is_valid_name(self, text: str) -> bool:
        """Check if text looks like a valid name"""
        if not text or len(text) < 2:
            return False
        
        # Should contain only letters, spaces, hyphens, apostrophes
        if not re.match(r'^[A-Za-z\s\-\'\.]+$', text):
            return False
        
        # Should have at least two parts (first and last name) or one reasonable length part
        parts = text.split()
        if len(parts) < 1:
            return False
        
        # Check reasonable length
        if len(text) < 2 or len(text) > 100:
            return False
        
        return True
    
    def _extract_name_from_mrz(self, full_text: str) -> Optional[str]:
        """Extract name from passport Machine Readable Zone"""
        # MRZ pattern: P<COUNTRYLASTNAME<<FIRSTNAME<MIDDLE<<
        mrz_pattern = r'P<([A-Z]{3})([A-Z<]+)'
        
        match = re.search(mrz_pattern, full_text.replace(' ', '').replace('\n', ''))
        if match:
            name_part = match.group(2)
            # Split by << to get last name and first names
            parts = name_part.split('<<')
            if len(parts) >= 2:
                last_name = parts[0].replace('<', ' ').strip()
                first_names = parts[1].replace('<', ' ').strip()
                return f"{first_names} {last_name}".title()
        
        return None
    
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
            (r'\b(\d{1,2})[/](\d{1,2})[/](\d{4})\b', 'slash'),
            (r'\b(\d{1,2})[-](\d{1,2})[-](\d{4})\b', 'dash'),
            (r'\b(\d{1,2})[.](\d{1,2})[.](\d{4})\b', 'dot'),
            (r'\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b', 'iso'),
            (r'\b(\d{2})(\d{2})(\d{4})\b', 'compact'),  # DDMMYYYY
        ]
        
        # Keywords commonly associated with date of birth
        dob_keywords = [
            'DOB', 'DATE OF BIRTH', 'BIRTH DATE', 'BORN', 'BIRTHDATE',
            'D.O.B', 'FECHA DE NACIMIENTO', 'DATE NAISSANCE', 'GEBURTSDATUM',
            'BN', 'BD', 'BIRTH', 'NAISSANCE'
        ]
        
        lines = full_text.split('\n')
        
        # First priority: Look for dates near DOB keywords
        for line in lines:
            line_upper = line.upper()
            if any(keyword in line_upper for keyword in dob_keywords):
                for pattern, fmt in date_patterns:
                    match = re.search(pattern, line)
                    if match:
                        date_str = match.group(0)
                        parsed_date, age = self._parse_and_validate_date(date_str, fmt)
                        if parsed_date and age and 0 <= age <= 120:
                            return date_str, 0.95, age
        
        # Second priority: Search entire text for date patterns
        for pattern, fmt in date_patterns:
            matches = list(re.finditer(pattern, full_text))
            for match in matches:
                date_str = match.group(0)
                parsed_date, age = self._parse_and_validate_date(date_str, fmt)
                if parsed_date and age and 18 <= age <= 120:
                    return date_str, 0.85, age
        
        return None, 0.0, None
    
    def _parse_and_validate_date(self, date_str: str, format_type: str) -> Tuple[Optional[date], Optional[int]]:
        """Parse date string and calculate age"""
        try:
            parts = re.split(r'[/\-.]', date_str)
            
            if len(parts) < 3:
                # Handle compact format DDMMYYYY
                if format_type == 'compact' and len(date_str) == 8:
                    day, month, year = int(date_str[:2]), int(date_str[2:4]), int(date_str[4:])
                else:
                    return None, None
            elif format_type == 'iso':
                year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
            elif format_type in ['slash', 'dash', 'dot']:
                day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
                
                # Swap if values suggest MM/DD/YYYY
                if day > 12 and month <= 12:
                    pass
                elif month > 12 and day <= 12:
                    day, month = month, day
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
    
    def extract_document_number(self, full_text: str, doc_type: str) -> Optional[str]:
        """Extract document number (passport number, license number, etc.)"""
        if not full_text:
            return None
        
        text_upper = full_text.upper()
        
        # Document number patterns by type
        patterns = {
            DocumentType.PASSPORT: [
                r'(?:PASSPORT\s*(?:NO|NUMBER|#)?[:\s]*)?([A-Z]{1,2}\d{6,9})',
                r'\b([A-Z]\d{8})\b',  # US passport format
                r'\b(\d{9})\b',  # 9-digit number
            ],
            DocumentType.DRIVERS_LICENSE: [
                r'(?:DL|LICENSE|LICENCE)\s*(?:NO|NUMBER|#)?[:\s]*([A-Z0-9]{5,15})',
                r'\b([A-Z]\d{7,12})\b',
                r'(?:ID|NO)[:\s]*([A-Z0-9]{6,15})',
            ],
            DocumentType.NATIONAL_ID: [
                r'(?:ID|NUMBER|NO)[:\s]*([A-Z0-9]{6,20})',
                r'\b(\d{9,12})\b',
            ],
        }
        
        type_patterns = patterns.get(doc_type, patterns[DocumentType.NATIONAL_ID])
        
        for pattern in type_patterns:
            match = re.search(pattern, text_upper)
            if match:
                return match.group(1)
        
        return None
    
    def extract_expiry_date(self, full_text: str) -> Optional[str]:
        """Extract document expiry date"""
        if not full_text:
            return None
        
        expiry_keywords = [
            'EXP', 'EXPIRY', 'EXPIRES', 'EXPIRATION', 'VALID UNTIL',
            'DATE D\'EXPIRATION', 'GÜLTIG BIS', 'VALIDO HASTA'
        ]
        
        lines = full_text.split('\n')
        
        for line in lines:
            line_upper = line.upper()
            if any(keyword in line_upper for keyword in expiry_keywords):
                # Look for date in this line
                date_patterns = [
                    r'\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})\b',
                    r'\b(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})\b',
                ]
                
                for pattern in date_patterns:
                    match = re.search(pattern, line)
                    if match:
                        return match.group(0)
        
        return None
    
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
            "specialty": None,
            "confidence": 0.0,
            "is_valid": False
        }
        
        if not full_text:
            return details
        
        text_upper = full_text.upper()
        
        # Known fitness certification organizations with full names
        cert_patterns = {
            "NASM": {
                "patterns": [r'\bNASM\b', r'\bNATIONAL ACADEMY OF SPORTS MEDICINE\b'],
                "full_name": "National Academy of Sports Medicine"
            },
            "ACE": {
                "patterns": [r'\bACE\b', r'\bAMERICAN COUNCIL ON EXERCISE\b'],
                "full_name": "American Council on Exercise"
            },
            "ACSM": {
                "patterns": [r'\bACSM\b', r'\bAMERICAN COLLEGE OF SPORTS MEDICINE\b'],
                "full_name": "American College of Sports Medicine"
            },
            "NSCA": {
                "patterns": [r'\bNSCA\b', r'\bNATIONAL STRENGTH AND CONDITIONING\b'],
                "full_name": "National Strength and Conditioning Association"
            },
            "ISSA": {
                "patterns": [r'\bISSA\b', r'\bINTERNATIONAL SPORTS SCIENCES ASSOCIATION\b'],
                "full_name": "International Sports Sciences Association"
            },
            "NCSF": {
                "patterns": [r'\bNCSF\b', r'\bNATIONAL COUNCIL ON STRENGTH\b'],
                "full_name": "National Council on Strength and Fitness"
            },
            "NFPT": {
                "patterns": [r'\bNFPT\b', r'\bNATIONAL FEDERATION OF PROFESSIONAL TRAINERS\b'],
                "full_name": "National Federation of Professional Trainers"
            },
            "AFAA": {
                "patterns": [r'\bAFAA\b', r'\bATHLETICS AND FITNESS ASSOCIATION\b'],
                "full_name": "Athletics and Fitness Association of America"
            },
            "CROSSFIT": {
                "patterns": [r'\bCROSSFIT\b', r'\bCF-L\d\b'],
                "full_name": "CrossFit"
            },
            "YOGA_ALLIANCE": {
                "patterns": [r'\bYOGA ALLIANCE\b', r'\bRYT[\s-]?\d{3}\b', r'\bE-RYT\b'],
                "full_name": "Yoga Alliance"
            },
        }
        
        # Find certification type
        for cert_type, cert_info in cert_patterns.items():
            for pattern in cert_info["patterns"]:
                if re.search(pattern, text_upper):
                    details["certification_type"] = cert_type
                    details["issuer"] = cert_info["full_name"]
                    details["confidence"] = 0.90
                    break
            if details["certification_type"]:
                break
        
        # Extract certification specialty
        specialties = [
            "PERSONAL TRAINER", "CPT", "CERTIFIED PERSONAL TRAINER",
            "GROUP FITNESS", "GFI", "GROUP EXERCISE",
            "STRENGTH AND CONDITIONING", "CSCS",
            "NUTRITION COACH", "SPORTS NUTRITION",
            "YOGA INSTRUCTOR", "RYT", "PILATES",
            "CORRECTIVE EXERCISE", "CES",
            "PERFORMANCE ENHANCEMENT", "PES",
            "SENIOR FITNESS", "YOUTH FITNESS"
        ]
        
        for specialty in specialties:
            if specialty in text_upper:
                details["specialty"] = specialty.title()
                break
        
        # Extract certification number
        cert_number_patterns = [
            r'(?:CERT(?:IFICATE)?|LICENSE|ID|NUMBER|NO|#|CREDENTIAL)[:\s]*([A-Z0-9\-]{5,20})',
            r'\b([A-Z]{2,4}[-]?\d{4,10}[-]?[A-Z0-9]*)\b',
        ]
        
        for pattern in cert_number_patterns:
            match = re.search(pattern, text_upper)
            if match:
                details["certification_number"] = match.group(1).strip()
                break
        
        # Extract dates
        date_pattern = r'\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b'
        dates_found = re.findall(date_pattern, full_text)
        
        if dates_found:
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
        
        # Extract holder name
        name_patterns = [
            r'(?:CERTIF(?:IED|Y)|AWARDED TO|THIS IS TO CERTIFY THAT|PRESENTED TO|HEREBY CERTIFIES)[:\s]*([A-Z][A-Z\s\.]+)',
            r'^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$',
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, full_text, re.MULTILINE | re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                if len(name) > 3 and ' ' in name:
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
    
    async def verify_government_id(
        self,
        image_base64: str,
        user_id: str = None,
        expected_name: str = None
    ) -> Dict:
        """
        Complete government ID verification workflow
        Validates passports, driver's licenses, and national IDs
        Cross-references with user profile if provided
        """
        # Extract text from image
        ocr_result = await self.extract_text_from_image(image_base64)
        
        if not ocr_result["success"] or not ocr_result["detected"]:
            return {
                "success": False,
                "verified": False,
                "document_type": None,
                "rejection_reason": ocr_result.get("error", "Could not read document. Please upload a clearer image."),
                "extracted_data": {}
            }
        
        full_text = ocr_result["full_text"]
        
        # Detect document type
        doc_type = self.detect_document_type(full_text)
        
        if doc_type == DocumentType.UNKNOWN:
            return {
                "success": False,
                "verified": False,
                "document_type": None,
                "rejection_reason": "Could not identify document type. Please upload a valid government-issued ID (passport, driver's license, or national ID).",
                "extracted_data": {}
            }
        
        if doc_type == DocumentType.FITNESS_CERT:
            return {
                "success": False,
                "verified": False,
                "document_type": "fitness_cert",
                "rejection_reason": "This appears to be a fitness certification, not a government ID. Please upload a government-issued ID for age verification.",
                "extracted_data": {}
            }
        
        # Extract all relevant data
        extracted_name = self.extract_name_from_document(full_text, doc_type)
        dob, dob_confidence, age = self.extract_date_of_birth(full_text)
        doc_number = self.extract_document_number(full_text, doc_type)
        expiry = self.extract_expiry_date(full_text)
        
        extracted_data = {
            "name": extracted_name,
            "date_of_birth": dob,
            "age": age,
            "document_number": doc_number,
            "expiry_date": expiry,
            "document_type": doc_type
        }
        
        # Validate required fields
        if not dob or age is None:
            return {
                "success": False,
                "verified": False,
                "document_type": doc_type,
                "rejection_reason": "Date of birth not found in document. Please ensure the full ID is visible.",
                "extracted_data": extracted_data
            }
        
        # Check age (must be 18+)
        if age < 18:
            return {
                "success": False,
                "verified": False,
                "document_type": doc_type,
                "rejection_reason": f"Age verification failed. You must be 18 or older to use this app. Detected age: {age}.",
                "extracted_data": extracted_data
            }
        
        # Check document expiry
        if expiry:
            try:
                expiry_parts = expiry.split('/')
                if len(expiry_parts) == 3:
                    exp_date = date(int(expiry_parts[2]), int(expiry_parts[1]), int(expiry_parts[0]))
                    if exp_date < date.today():
                        return {
                            "success": False,
                            "verified": False,
                            "document_type": doc_type,
                            "rejection_reason": "This document has expired. Please upload a valid, non-expired ID.",
                            "extracted_data": extracted_data
                        }
            except:
                pass  # If we can't parse expiry, continue
        
        # Cross-reference name with expected name if provided
        name_match = True
        if expected_name and extracted_name:
            # Normalize names for comparison
            expected_normalized = ''.join(expected_name.lower().split())
            extracted_normalized = ''.join(extracted_name.lower().split())
            
            # Check for significant overlap
            name_match = (
                expected_normalized in extracted_normalized or
                extracted_normalized in expected_normalized or
                self._names_similar(expected_name, extracted_name)
            )
            
            if not name_match:
                return {
                    "success": False,
                    "verified": False,
                    "document_type": doc_type,
                    "rejection_reason": f"Name on document does not match your profile name.",
                    "extracted_data": extracted_data
                }
        
        # Success!
        return {
            "success": True,
            "verified": True,
            "age_verified": True,
            "document_type": doc_type,
            "extracted_data": extracted_data,
            "confidence": ocr_result["confidence"],
            "rejection_reason": None
        }
    
    def _names_similar(self, name1: str, name2: str) -> bool:
        """Check if two names are similar enough to match"""
        # Split into parts
        parts1 = set(name1.lower().split())
        parts2 = set(name2.lower().split())
        
        # At least 2 parts should match, or 50% of parts
        common = parts1.intersection(parts2)
        min_matches = min(2, max(len(parts1), len(parts2)) // 2)
        
        return len(common) >= min_matches
    
    async def verify_age_document(self, image_base64: str, user_id: str = None) -> Dict:
        """
        Legacy method - wraps verify_government_id
        """
        result = await self.verify_government_id(image_base64, user_id)
        
        # Convert to legacy format
        return {
            "success": result["success"],
            "age_verified": result.get("verified", False) and result.get("extracted_data", {}).get("age", 0) >= 18,
            "extracted_dob": result.get("extracted_data", {}).get("date_of_birth"),
            "calculated_age": result.get("extracted_data", {}).get("age"),
            "dob_confidence": result.get("confidence", 0),
            "ocr_confidence": result.get("confidence", 0),
            "rejection_reason": result.get("rejection_reason"),
            "extracted_text_preview": ""
        }
    
    async def verify_certification_document(
        self,
        image_base64: str,
        expected_cert_type: str = None,
        user_id: str = None,
        expected_name: str = None
    ) -> Dict:
        """
        Complete certification verification workflow
        Returns verification result with extracted certification details
        Cross-references with user profile if provided
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
        
        full_text = ocr_result["full_text"]
        
        # Check if this is actually a certification document
        doc_type = self.detect_document_type(full_text)
        
        if doc_type != DocumentType.FITNESS_CERT and doc_type != DocumentType.UNKNOWN:
            return {
                "success": False,
                "cert_verified": False,
                "rejection_reason": "This appears to be an ID document, not a fitness certification. Please upload your fitness certification.",
                "certification_details": {}
            }
        
        # Extract certification details
        cert_details = self.extract_certification_details(full_text)
        
        if not cert_details["is_valid"]:
            return {
                "success": False,
                "cert_verified": False,
                "rejection_reason": "Could not identify a valid fitness certification. Please ensure the full certificate is visible and is from a recognized organization (NASM, ACE, ACSM, NSCA, ISSA, etc.).",
                "certification_details": cert_details
            }
        
        # Verify certification type matches expected (if provided)
        if expected_cert_type:
            expected_upper = expected_cert_type.upper().replace(' ', '_')
            found_type = cert_details["certification_type"]
            
            if found_type and found_type.upper() != expected_upper:
                return {
                    "success": False,
                    "cert_verified": False,
                    "rejection_reason": f"Certification type mismatch. Expected {expected_cert_type}, found {found_type}.",
                    "certification_details": cert_details
                }
        
        # Check expiry date if present
        if cert_details["expiry_date"]:
            try:
                expiry_parts = cert_details["expiry_date"].split('/')
                if len(expiry_parts) == 3:
                    expiry_date = date(int(expiry_parts[2]), int(expiry_parts[1]), int(expiry_parts[0]))
                    if expiry_date < date.today():
                        return {
                            "success": False,
                            "cert_verified": False,
                            "rejection_reason": "This certification has expired. Please upload a current, valid certification.",
                            "certification_details": cert_details
                        }
            except:
                pass
        
        # Cross-reference name with expected name if provided
        if expected_name and cert_details["holder_name"]:
            if not self._names_similar(expected_name, cert_details["holder_name"]):
                return {
                    "success": False,
                    "cert_verified": False,
                    "rejection_reason": "Name on certification does not match your profile name.",
                    "certification_details": cert_details
                }
        
        # Success!
        return {
            "success": True,
            "cert_verified": True,
            "certification_type": cert_details["certification_type"],
            "certification_number": cert_details["certification_number"],
            "holder_name": cert_details["holder_name"],
            "issuer": cert_details["issuer"],
            "specialty": cert_details["specialty"],
            "issue_date": cert_details["issue_date"],
            "expiry_date": cert_details["expiry_date"],
            "confidence": cert_details["confidence"],
            "rejection_reason": None
        }


# Singleton instance
ocr_service = OCRService()
