#!/usr/bin/env python3
"""
SECURITY FIXES VALIDATION TEST

This test specifically validates the 3 security fixes mentioned in the review request
that were supposed to close the 3.8% gap from 96.2% to 100% production readiness:

1. Enhanced email validation (reject consecutive dots, leading/trailing dots)
2. Input length validation (name >100 chars, email >254 chars should be rejected)
3. XSS protection with 4 specific payloads:
   - <script>alert('XSS')</script>
   - javascript:alert('XSS')
   - <img src=x onerror=alert('XSS')>
   - <svg onload=alert('XSS')>
"""

import requests
import json
import uuid
from datetime import datetime

# Backend URL
BACKEND_URL = "https://fitcoach-ai-36.preview.emergentagent.com/api"

def print_section(title):
    print("\n" + "="*80)
    print(f"🎯 {title}")
    print("="*80)

def print_subsection(title):
    print(f"\n📋 {title}")
    print("-" * 60)

def test_enhanced_email_validation():
    """Test enhanced email validation - reject consecutive dots, leading/trailing dots"""
    print_subsection("ENHANCED EMAIL VALIDATION TEST")
    
    # Test cases that should be REJECTED (422 status)
    invalid_emails = [
        "test..test@example.com",     # Consecutive dots
        ".test@example.com",          # Leading dot
        "test@example.com.",          # Trailing dot (in local part)
        "test.@example.com",          # Dot before @
        "test@.example.com",          # Dot after @
        "user@domain..com",           # Consecutive dots in domain
    ]
    
    # Test cases that should be ACCEPTED (200 status)
    valid_emails = [
        "test@example.com",
        "user.name@domain.org",
        "valid.email@test.co.uk"
    ]
    
    results = {"passed": 0, "total": 0, "details": []}
    
    print("Testing INVALID email patterns (should be rejected with 422):")
    for email in invalid_emails:
        results["total"] += 1
        test_data = {
            "email": email,
            "role": "fitness_enthusiast",
            "fitness_goals": ["general_fitness"],
            "experience_level": "beginner"
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/users", json=test_data, timeout=10)
            if response.status_code == 422:
                print(f"✅ Correctly rejected: {email}")
                results["passed"] += 1
            else:
                print(f"❌ Should reject {email} but got: {response.status_code}")
                results["details"].append(f"Invalid email {email} not rejected (got {response.status_code})")
        except Exception as e:
            print(f"❌ Error testing {email}: {str(e)}")
            results["details"].append(f"Error testing {email}: {str(e)}")
    
    print("\nTesting VALID email patterns (should be accepted with 200):")
    for email in valid_emails:
        results["total"] += 1
        unique_email = f"valid_{uuid.uuid4()}_{email}"
        test_data = {
            "email": unique_email,
            "role": "fitness_enthusiast", 
            "fitness_goals": ["general_fitness"],
            "experience_level": "beginner"
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/users", json=test_data, timeout=10)
            if response.status_code == 200:
                print(f"✅ Correctly accepted: {email}")
                results["passed"] += 1
            else:
                print(f"❌ Should accept {email} but got: {response.status_code}")
                results["details"].append(f"Valid email {email} rejected (got {response.status_code})")
        except Exception as e:
            print(f"❌ Error testing {email}: {str(e)}")
            results["details"].append(f"Error testing {email}: {str(e)}")
    
    success_rate = (results["passed"] / results["total"]) * 100 if results["total"] > 0 else 0
    print(f"\n📊 Email Validation Score: {results['passed']}/{results['total']} ({success_rate:.1f}%)")
    
    return results

def test_input_length_validation():
    """Test input length validation - name >100 chars, email >254 chars should be rejected"""
    print_subsection("INPUT LENGTH VALIDATION TEST")
    
    results = {"passed": 0, "total": 0, "details": []}
    
    # Test 1: Name with >100 characters should be rejected
    print("Testing name with >100 characters (should be rejected with 422):")
    results["total"] += 1
    long_name = "A" * 101  # 101 characters
    test_data = {
        "email": f"length_test_{uuid.uuid4()}@example.com",
        "name": long_name,
        "role": "fitness_enthusiast",
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/users", json=test_data, timeout=10)
        if response.status_code == 422:
            print(f"✅ Correctly rejected name with {len(long_name)} characters")
            results["passed"] += 1
        else:
            print(f"❌ Should reject long name but got: {response.status_code}")
            results["details"].append(f"Long name not rejected (got {response.status_code})")
    except Exception as e:
        print(f"❌ Error testing long name: {str(e)}")
        results["details"].append(f"Error testing long name: {str(e)}")
    
    # Test 2: Name with exactly 100 characters should be accepted
    print("\nTesting name with exactly 100 characters (should be accepted with 200):")
    results["total"] += 1
    exact_name = "B" * 100  # Exactly 100 characters
    test_data = {
        "email": f"length_test_{uuid.uuid4()}@example.com",
        "name": exact_name,
        "role": "fitness_enthusiast",
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/users", json=test_data, timeout=10)
        if response.status_code == 200:
            print(f"✅ Correctly accepted name with {len(exact_name)} characters")
            results["passed"] += 1
        else:
            print(f"❌ Should accept 100-char name but got: {response.status_code}")
            results["details"].append(f"100-char name rejected (got {response.status_code})")
    except Exception as e:
        print(f"❌ Error testing 100-char name: {str(e)}")
        results["details"].append(f"Error testing 100-char name: {str(e)}")
    
    # Test 3: Email with >254 characters should be rejected
    print("\nTesting email with >254 characters (should be rejected with 422):")
    results["total"] += 1
    long_email_prefix = "a" * 240  # Make a very long email
    long_email = f"{long_email_prefix}@example.com"  # Total > 254 chars
    test_data = {
        "email": long_email,
        "role": "fitness_enthusiast",
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/users", json=test_data, timeout=10)
        if response.status_code == 422:
            print(f"✅ Correctly rejected email with {len(long_email)} characters")
            results["passed"] += 1
        else:
            print(f"❌ Should reject long email but got: {response.status_code}")
            results["details"].append(f"Long email not rejected (got {response.status_code})")
    except Exception as e:
        print(f"❌ Error testing long email: {str(e)}")
        results["details"].append(f"Error testing long email: {str(e)}")
    
    # Test 4: Normal length inputs should be accepted
    print("\nTesting normal length inputs (should be accepted with 200):")
    results["total"] += 1
    test_data = {
        "email": f"normal_test_{uuid.uuid4()}@example.com",
        "name": "Normal Name",
        "role": "fitness_enthusiast",
        "fitness_goals": ["general_fitness"],
        "experience_level": "beginner"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/users", json=test_data, timeout=10)
        if response.status_code == 200:
            print("✅ Correctly accepted normal length inputs")
            results["passed"] += 1
        else:
            print(f"❌ Should accept normal inputs but got: {response.status_code}")
            results["details"].append(f"Normal inputs rejected (got {response.status_code})")
    except Exception as e:
        print(f"❌ Error testing normal inputs: {str(e)}")
        results["details"].append(f"Error testing normal inputs: {str(e)}")
    
    success_rate = (results["passed"] / results["total"]) * 100 if results["total"] > 0 else 0
    print(f"\n📊 Length Validation Score: {results['passed']}/{results['total']} ({success_rate:.1f}%)")
    
    return results

def test_xss_protection():
    """Test XSS protection with the 4 specific payloads mentioned in the review"""
    print_subsection("XSS PROTECTION TEST - 4 SPECIFIC PAYLOADS")
    
    # The exact 4 XSS payloads mentioned in the review request
    xss_payloads = [
        "<script>alert('XSS')</script>",
        "javascript:alert('XSS')",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert('XSS')>"
    ]
    
    results = {"passed": 0, "total": 0, "details": []}
    
    print("Testing XSS protection in user name field:")
    for i, payload in enumerate(xss_payloads, 1):
        results["total"] += 1
        print(f"\nTesting XSS payload {i}: {payload}")
        
        test_data = {
            "email": f"xss_test_{uuid.uuid4()}@example.com",
            "name": payload,
            "role": "fitness_enthusiast",
            "fitness_goals": ["general_fitness"],
            "experience_level": "beginner"
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/users", json=test_data, timeout=10)
            
            if response.status_code == 200:
                # Check if the payload was sanitized in the response
                user_data = response.json()
                returned_name = user_data.get("name", "")
                
                # Check if dangerous patterns are removed/escaped
                dangerous_patterns = ["<script", "javascript:", "onerror", "onload", "alert("]
                is_sanitized = True
                
                for pattern in dangerous_patterns:
                    if pattern.lower() in returned_name.lower():
                        is_sanitized = False
                        break
                
                if is_sanitized:
                    print(f"✅ XSS payload {i} properly sanitized")
                    print(f"   Original: {payload}")
                    print(f"   Sanitized: {returned_name}")
                    results["passed"] += 1
                else:
                    print(f"❌ XSS payload {i} NOT properly sanitized")
                    print(f"   Original: {payload}")
                    print(f"   Returned: {returned_name}")
                    results["details"].append(f"XSS payload {i} not sanitized: {returned_name}")
            
            elif response.status_code == 422:
                # If the request is rejected due to validation, that's also acceptable XSS protection
                print(f"✅ XSS payload {i} rejected by validation (status: 422)")
                results["passed"] += 1
            
            else:
                print(f"❌ Unexpected response for XSS payload {i}: {response.status_code}")
                results["details"].append(f"XSS payload {i} unexpected response: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error testing XSS payload {i}: {str(e)}")
            results["details"].append(f"Error testing XSS payload {i}: {str(e)}")
    
    success_rate = (results["passed"] / results["total"]) * 100 if results["total"] > 0 else 0
    print(f"\n📊 XSS Protection Score: {results['passed']}/{results['total']} ({success_rate:.1f}%)")
    
    return results

def main():
    """Main test execution focusing on the 3 security fixes"""
    print_section("SECURITY FIXES VALIDATION FOR 100% PRODUCTION READINESS")
    print("🎯 Testing the exact 3 security fixes that close the 3.8% gap from 96.2% to 100%")
    print("🔍 Focus: Enhanced email validation, input length validation, XSS protection")
    
    # Run the 3 specific security fix tests
    test_results = {}
    
    # Test 1: Enhanced Email Validation
    print_section("1. ENHANCED EMAIL VALIDATION")
    test_results["email_validation"] = test_enhanced_email_validation()
    
    # Test 2: Input Length Validation  
    print_section("2. INPUT LENGTH VALIDATION")
    test_results["length_validation"] = test_input_length_validation()
    
    # Test 3: XSS Protection
    print_section("3. XSS PROTECTION")
    test_results["xss_protection"] = test_xss_protection()
    
    # Calculate overall results
    print_section("FINAL SECURITY FIXES ASSESSMENT")
    
    total_passed = sum(result["passed"] for result in test_results.values())
    total_tests = sum(result["total"] for result in test_results.values())
    overall_percentage = (total_passed / total_tests * 100) if total_tests > 0 else 0
    
    print(f"📊 OVERALL SECURITY FIXES SCORE: {overall_percentage:.1f}% ({total_passed}/{total_tests})")
    print()
    
    # Individual test results
    for test_name, result in test_results.items():
        success_rate = (result["passed"] / result["total"] * 100) if result["total"] > 0 else 0
        status = "✅ PASSED" if success_rate >= 80 else "❌ FAILED"
        print(f"{status} {test_name.replace('_', ' ').title()}: {result['passed']}/{result['total']} ({success_rate:.1f}%)")
        
        # Show details for failed tests
        if result["details"]:
            for detail in result["details"]:
                print(f"    - {detail}")
    
    print()
    
    # Final assessment
    if overall_percentage >= 95:
        print("🎉 SECURITY FIXES VALIDATION: PASSED!")
        print("✅ All critical security fixes are working correctly")
        print("✅ System should achieve 100% production readiness")
        return True
    elif overall_percentage >= 80:
        print("⚠️ SECURITY FIXES VALIDATION: MOSTLY PASSED")
        print("🔧 Some security fixes need attention but core protection is working")
        return False
    else:
        print("❌ SECURITY FIXES VALIDATION: FAILED!")
        print("🚨 Critical security vulnerabilities remain - NOT production ready")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)