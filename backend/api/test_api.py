"""
VidyaMitra API Test Suite
Simulates calls from Frontend (with Clerk auth) and n8n (webhook interface)

Run: python test_api.py
"""

import asyncio
import httpx
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"
API_PREFIX = "/api"

# Colors for terminal output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

def log(msg, color=RESET):
    print(f"{color}{msg}{RESET}")

def log_test(name, passed, details=""):
    status = f"{GREEN}✓ PASS{RESET}" if passed else f"{RED}✗ FAIL{RESET}"
    print(f"  {status} {name}")
    if details and not passed:
        print(f"       {RED}{details}{RESET}")

# ═══════════════════════════════════════════════════════════════
# N8N WEBHOOK TESTS (No Auth Required)
# ═══════════════════════════════════════════════════════════════

async def test_n8n_webhooks():
    """Test n8n webhook endpoints - these don't require auth"""
    
    log("\n" + "="*60, BLUE)
    log("🔗 N8N WEBHOOK TESTS (No Auth)", BLUE)
    log("="*60, BLUE)
    
    async with httpx.AsyncClient(timeout=60) as client:
        results = []
        
        # Test 1: Resume Analysis
        log("\n📝 Resume Analysis Webhook", YELLOW)
        try:
            res = await client.post(f"{BASE_URL}{API_PREFIX}/webhook/resume/analyze", json={
                "user_id": "n8n-workflow-123",
                "data": {
                    "resume_text": """
                    Sarah Johnson
                    sarah.johnson@email.com | +1-555-0123 | San Francisco, CA
                    LinkedIn: linkedin.com/in/sarahjohnson
                    
                    PROFESSIONAL SUMMARY
                    Software Engineer with 4 years of experience in Python, AWS, and microservices.
                    
                    EXPERIENCE
                    Senior Developer at TechCorp (2021-Present)
                    - Developed REST APIs using Python and FastAPI
                    - Deployed applications on AWS using Docker and Kubernetes
                    - Reduced API response time by 40%
                    
                    Developer at StartupXYZ (2019-2021)
                    - Built web applications using React and Node.js
                    - Implemented CI/CD pipelines with GitHub Actions
                    
                    SKILLS
                    Python, JavaScript, AWS, Docker, Kubernetes, PostgreSQL, Redis, Git
                    
                    EDUCATION
                    BS Computer Science, Stanford University, 2019
                    """,
                    "target_role": "Senior Backend Engineer"
                }
            })
            data = res.json()
            analysis = data.get("analysis", {})
            passed = res.status_code == 200 and analysis.get("score", 0) > 0
            log_test("Resume analyzed with score", passed, f"Score: {analysis.get('score')}, Grade: {analysis.get('grade')}")
            log_test("Market readiness included", "market_readiness" in analysis)
            log_test("Certifications recommended", len(analysis.get("certifications_recommended", [])) > 0)
            results.append(passed)
        except Exception as e:
            log_test("Resume Analysis", False, str(e))
            results.append(False)
        
        # Test 2: Resume Enhancement
        log("\n✨ Resume Enhancement Webhook", YELLOW)
        try:
            res = await client.post(f"{BASE_URL}{API_PREFIX}/webhook/resume/enhance", json={
                "user_id": "n8n-workflow-123",
                "data": {
                    "resume_text": """
                    John Smith
                    john@email.com
                    
                    Developer at ABC Inc (2020-2024)
                    - Made websites
                    - Fixed bugs
                    
                    Skills: HTML, CSS, JavaScript
                    """,
                    "target_role": "Full Stack Developer",
                    "focus_areas": ["add metrics", "modern keywords"]
                }
            })
            data = res.json()
            enhanced = data.get("enhanced", {})
            passed = res.status_code == 200 and "enhanced_resume" in enhanced
            score_before = enhanced.get("score_before", 0)
            score_after = enhanced.get("score_after", 0)
            log_test("Resume enhanced", passed)
            log_test("Score improved", score_after > score_before, f"{score_before} → {score_after}")
            log_test("Keywords added", len(enhanced.get("keywords_added", [])) > 0)
            results.append(passed)
        except Exception as e:
            log_test("Resume Enhancement", False, str(e))
            results.append(False)
        
        # Test 3: Resume Generation
        log("\n📄 Resume Generation Webhook", YELLOW)
        try:
            res = await client.post(f"{BASE_URL}{API_PREFIX}/webhook/resume/generate", json={
                "user_id": "n8n-workflow-123",
                "data": {
                    "name": "Priya Sharma",
                    "email": "priya@email.com",
                    "phone": "+91 98765 43210",
                    "location": "Bangalore, India",
                    "experience": [
                        {
                            "title": "Software Engineer",
                            "company": "Infosys",
                            "duration": "2022-Present",
                            "description": "Developed microservices using Java and Spring Boot"
                        }
                    ],
                    "education": [
                        {"degree": "B.Tech", "field": "Computer Science", "institution": "IIT Delhi", "year": "2022"}
                    ],
                    "technical_skills": ["Java", "Python", "AWS", "Docker"],
                    "target_role": "Backend Developer"
                }
            })
            data = res.json()
            passed = res.status_code == 200 and len(data.get("resume", "")) > 100
            log_test("Resume generated", passed, f"Length: {len(data.get('resume', ''))} chars")
            results.append(passed)
        except Exception as e:
            log_test("Resume Generation", False, str(e))
            results.append(False)
        
        # Test 4: Interview Start
        log("\n🎤 Interview Start Webhook", YELLOW)
        try:
            res = await client.post(f"{BASE_URL}{API_PREFIX}/webhook/interview/start", json={
                "user_id": "n8n-workflow-123",
                "data": {
                    "domain": "technology",
                    "role": "Python Developer",
                    "question_count": 3
                }
            })
            data = res.json()
            questions = data.get("questions", [])
            passed = res.status_code == 200 and len(questions) >= 1
            log_test("Questions generated", passed, f"Count: {len(questions)}")
            if questions:
                log_test("Has expected_points", "expected_points" in questions[0])
                log_test("Has difficulty", "difficulty" in questions[0])
            results.append(passed)
        except Exception as e:
            log_test("Interview Start", False, str(e))
            results.append(False)
        
        # Test 5: Interview Answer Evaluation
        log("\n📊 Answer Evaluation Webhook", YELLOW)
        try:
            res = await client.post(f"{BASE_URL}{API_PREFIX}/webhook/interview/evaluate", json={
                "user_id": "n8n-workflow-123",
                "data": {
                    "question": "What is a Python decorator and when would you use one?",
                    "answer": "A decorator is a function that wraps another function to extend its behavior. I use them for logging, authentication, and caching. For example, @login_required in Flask checks if user is authenticated before running the view function.",
                    "expected_points": ["function wrapper", "extends behavior", "practical examples"]
                }
            })
            data = res.json()
            evaluation = data.get("evaluation", {})
            passed = res.status_code == 200 and "score" in evaluation
            log_test("Answer evaluated", passed, f"Score: {evaluation.get('score')}")
            log_test("Feedback provided", len(evaluation.get("feedback", "")) > 0)
            results.append(passed)
        except Exception as e:
            log_test("Answer Evaluation", False, str(e))
            results.append(False)
        
        # Test 6: Quiz Generation
        log("\n📝 Quiz Generation Webhook", YELLOW)
        try:
            res = await client.post(f"{BASE_URL}{API_PREFIX}/webhook/quiz/generate", json={
                "user_id": "n8n-workflow-123",
                "data": {
                    "skill": "Python",
                    "count": 3,
                    "difficulty": "medium"
                }
            })
            data = res.json()
            questions = data.get("questions", [])
            passed = res.status_code == 200 and len(questions) >= 1
            log_test("Quiz generated", passed, f"Questions: {len(questions)}")
            if questions:
                log_test("Has options", len(questions[0].get("options", [])) == 4)
                log_test("Has explanation", "explanation" in questions[0])
            results.append(passed)
        except Exception as e:
            log_test("Quiz Generation", False, str(e))
            results.append(False)
        
        # Test 7: Quiz Evaluation
        log("\n✅ Quiz Evaluation Webhook", YELLOW)
        try:
            res = await client.post(f"{BASE_URL}{API_PREFIX}/webhook/quiz/evaluate", json={
                "user_id": "n8n-workflow-123",
                "data": {
                    "skill": "Python",
                    "questions": [
                        {"question": "Q1", "correct": "A"},
                        {"question": "Q2", "correct": "B"},
                        {"question": "Q3", "correct": "C"}
                    ],
                    "answers": ["A", "B", "D"]  # 2 correct, 1 wrong
                }
            })
            data = res.json()
            result = data.get("result", {})
            passed = res.status_code == 200 and result.get("correct") == 2
            log_test("Quiz evaluated", passed, f"Score: {result.get('score')}%, Correct: {result.get('correct')}/{result.get('total')}")
            results.append(passed)
        except Exception as e:
            log_test("Quiz Evaluation", False, str(e))
            results.append(False)
        
        # Test 8: Job Recommendations
        log("\n💼 Job Recommendations Webhook", YELLOW)
        try:
            res = await client.post(f"{BASE_URL}{API_PREFIX}/webhook/jobs/recommend", json={
                "user_id": "n8n-workflow-123",
                "data": {
                    "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
                    "role": "Backend Developer",
                    "location": "Remote"
                }
            })
            data = res.json()
            jobs = data.get("jobs", [])
            passed = res.status_code == 200 and len(jobs) >= 1
            log_test("Jobs recommended", passed, f"Count: {len(jobs)}")
            if jobs:
                log_test("Has market_demand", "market_demand" in jobs[0])
                log_test("Has growth_outlook", "growth_outlook" in jobs[0])
            results.append(passed)
        except Exception as e:
            log_test("Job Recommendations", False, str(e))
            results.append(False)
        
        # Test 9: Learning Plan
        log("\n📚 Learning Plan Webhook", YELLOW)
        try:
            res = await client.post(f"{BASE_URL}{API_PREFIX}/webhook/learning/generate", json={
                "user_id": "n8n-workflow-123",
                "data": {
                    "gaps": ["Kubernetes", "Machine Learning", "System Design"],
                    "role": "Senior Software Engineer"
                }
            })
            data = res.json()
            plan = data.get("plan", [])
            passed = res.status_code == 200 and len(plan) >= 1
            log_test("Learning plan generated", passed, f"Skills covered: {len(plan)}")
            results.append(passed)
        except Exception as e:
            log_test("Learning Plan", False, str(e))
            results.append(False)
        
        # Test 10: Voice Interview Process
        log("\n🎙️ Voice Interview Webhook", YELLOW)
        try:
            res = await client.post(f"{BASE_URL}{API_PREFIX}/webhook/voice/process", json={
                "user_id": "n8n-workflow-123",
                "data": {
                    "transcript": "I have 3 years of experience with Python and have worked on several REST API projects using FastAPI and Django.",
                    "current_question": "Tell me about your Python experience.",
                    "context": {
                        "question_index": 0,
                        "total_questions": 5,
                        "next_question": "What's your experience with databases?"
                    }
                }
            })
            data = res.json()
            passed = res.status_code == 200 and "response_text" in data
            log_test("Voice processed", passed)
            log_test("Has TTS response", len(data.get("response_text", "")) > 0)
            log_test("Has evaluation", "evaluation" in data)
            results.append(passed)
        except Exception as e:
            log_test("Voice Interview", False, str(e))
            results.append(False)
        
        return results


# ═══════════════════════════════════════════════════════════════
# JOB MARKET DATA TESTS (Public Endpoints)
# ═══════════════════════════════════════════════════════════════

async def test_job_market_endpoints():
    """Test job market data endpoints"""
    
    log("\n" + "="*60, BLUE)
    log("📊 JOB MARKET DATA TESTS (Public)", BLUE)
    log("="*60, BLUE)
    
    async with httpx.AsyncClient(timeout=30) as client:
        results = []
        
        # Test 1: Market Summary
        log("\n📈 Market Summary", YELLOW)
        try:
            res = await client.get(f"{BASE_URL}{API_PREFIX}/jobs/market/summary")
            data = res.json()
            passed = res.status_code == 200 and "fastest_growing" in data
            log_test("Summary retrieved", passed)
            log_test("Has key insights", len(data.get("key_insights", [])) > 0)
            results.append(passed)
        except Exception as e:
            log_test("Market Summary", False, str(e))
            results.append(False)
        
        # Test 2: Fastest Growing Jobs
        log("\n🚀 Fastest Growing Jobs", YELLOW)
        try:
            res = await client.get(f"{BASE_URL}{API_PREFIX}/jobs/market/fastest-growing?region=global")
            data = res.json()
            passed = res.status_code == 200 and len(data.get("jobs", [])) > 0
            log_test("Global jobs retrieved", passed, f"Count: {len(data.get('jobs', []))}")
            
            res = await client.get(f"{BASE_URL}{API_PREFIX}/jobs/market/fastest-growing?region=india")
            data = res.json()
            passed = res.status_code == 200 and data.get("region") == "India"
            log_test("India jobs retrieved", passed)
            results.append(passed)
        except Exception as e:
            log_test("Fastest Growing", False, str(e))
            results.append(False)
        
        # Test 3: In-Demand Skills
        log("\n🔧 In-Demand Skills", YELLOW)
        try:
            res = await client.get(f"{BASE_URL}{API_PREFIX}/jobs/market/skills")
            data = res.json()
            passed = res.status_code == 200 and len(data.get("technical_skills", [])) > 0
            log_test("Skills retrieved", passed)
            log_test("Has certifications", len(data.get("certifications", [])) > 0)
            results.append(passed)
        except Exception as e:
            log_test("In-Demand Skills", False, str(e))
            results.append(False)
        
        # Test 4: Salary Benchmarks
        log("\n💰 Salary Benchmarks", YELLOW)
        try:
            res = await client.get(f"{BASE_URL}{API_PREFIX}/jobs/market/salaries?level=senior")
            data = res.json()
            passed = res.status_code == 200 and "salaries_usd" in data
            log_test("Salaries retrieved", passed, f"Level: {data.get('level')}")
            results.append(passed)
        except Exception as e:
            log_test("Salary Benchmarks", False, str(e))
            results.append(False)
        
        # Test 5: Industry Outlook
        log("\n🏭 Industry Outlook", YELLOW)
        try:
            res = await client.get(f"{BASE_URL}{API_PREFIX}/jobs/market/industry/technology")
            data = res.json()
            passed = res.status_code == 200 and "outlook" in data
            log_test("Tech outlook retrieved", passed, f"Outlook: {data.get('outlook')}")
            results.append(passed)
        except Exception as e:
            log_test("Industry Outlook", False, str(e))
            results.append(False)
        
        # Test 6: Skill Gap Analysis
        log("\n🎯 Skill Gap Analysis", YELLOW)
        try:
            res = await client.post(f"{BASE_URL}{API_PREFIX}/jobs/market/skill-gap", json={
                "skills": ["Python", "SQL", "Git"],
                "role": "ML Engineer"
            })
            data = res.json()
            passed = res.status_code == 200 and "match_percent" in data
            log_test("Gap analysis done", passed, f"Match: {data.get('match_percent')}%")
            log_test("Missing skills identified", len(data.get("skills_missing", [])) > 0)
            results.append(passed)
        except Exception as e:
            log_test("Skill Gap Analysis", False, str(e))
            results.append(False)
        
        return results


# ═══════════════════════════════════════════════════════════════
# FRONTEND SIMULATION (With Mock Auth Header)
# ═══════════════════════════════════════════════════════════════

async def test_frontend_simulation():
    """Simulate frontend calls - would need real Clerk token in production"""
    
    log("\n" + "="*60, BLUE)
    log("🖥️ FRONTEND SIMULATION (Auth Endpoints)", BLUE)
    log("Note: These require Clerk auth - testing structure only", YELLOW)
    log("="*60, BLUE)
    
    async with httpx.AsyncClient(timeout=30) as client:
        results = []
        
        # These endpoints require auth - we test that they properly reject without it
        auth_endpoints = [
            ("POST", "/resume/analyze", {"resume_text": "test"}),
            ("POST", "/resume/generate", {"name": "Test", "email": "test@test.com", "phone": "123", "location": "Test"}),
            ("POST", "/interview/start", {"domain": "tech", "role": "dev"}),
            ("GET", "/resume/", None),
            ("GET", "/interview/", None),
        ]
        
        log("\n🔒 Auth Required Endpoints", YELLOW)
        for method, endpoint, body in auth_endpoints:
            try:
                if method == "GET":
                    res = await client.get(f"{BASE_URL}{API_PREFIX}{endpoint}")
                else:
                    res = await client.post(f"{BASE_URL}{API_PREFIX}{endpoint}", json=body)
                
                # Should return 403 (Forbidden) or 401 (Unauthorized) without auth
                requires_auth = res.status_code in [401, 403, 422]
                log_test(f"{method} {endpoint} requires auth", requires_auth, f"Status: {res.status_code}")
                results.append(requires_auth)
            except Exception as e:
                log_test(f"{method} {endpoint}", False, str(e))
                results.append(False)
        
        return results


# ═══════════════════════════════════════════════════════════════
# HEALTH & BASIC TESTS
# ═══════════════════════════════════════════════════════════════

async def test_health():
    """Test basic health endpoints"""
    
    log("\n" + "="*60, BLUE)
    log("🏥 HEALTH CHECKS", BLUE)
    log("="*60, BLUE)
    
    async with httpx.AsyncClient(timeout=10) as client:
        results = []
        
        log("\n💓 Basic Health", YELLOW)
        try:
            res = await client.get(f"{BASE_URL}/")
            passed = res.status_code == 200 and res.json().get("status") == "ok"
            log_test("Root endpoint", passed)
            results.append(passed)
            
            res = await client.get(f"{BASE_URL}/health")
            passed = res.status_code == 200 and res.json().get("status") == "healthy"
            log_test("Health endpoint", passed)
            results.append(passed)
        except Exception as e:
            log_test("Health Check", False, str(e))
            results.append(False)
        
        return results


# ═══════════════════════════════════════════════════════════════
# MAIN TEST RUNNER
# ═══════════════════════════════════════════════════════════════

async def run_all_tests():
    """Run all test suites"""
    
    log("\n" + "="*60, BLUE)
    log("🧪 VIDYAMITRA API TEST SUITE", BLUE)
    log(f"   Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", BLUE)
    log(f"   Base URL: {BASE_URL}", BLUE)
    log("="*60, BLUE)
    
    all_results = []
    
    # Run test suites
    all_results.extend(await test_health())
    all_results.extend(await test_job_market_endpoints())
    all_results.extend(await test_n8n_webhooks())
    all_results.extend(await test_frontend_simulation())
    
    # Summary
    passed = sum(all_results)
    total = len(all_results)
    
    log("\n" + "="*60, BLUE)
    log("📊 TEST SUMMARY", BLUE)
    log("="*60, BLUE)
    
    if passed == total:
        log(f"\n  ✅ ALL TESTS PASSED: {passed}/{total}", GREEN)
    else:
        log(f"\n  ⚠️ TESTS: {passed}/{total} passed, {total-passed} failed", YELLOW)
    
    log(f"\n  Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", BLUE)
    log("="*60 + "\n", BLUE)
    
    return passed == total


if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    exit(0 if success else 1)
