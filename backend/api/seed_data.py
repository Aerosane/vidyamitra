#!/usr/bin/env python3
"""
Seed data script for VidyaMitra backend
Creates sample data for frontend testing
Matches actual Supabase schema
"""
import os
from supabase import create_client

# Load from env file or use direct values
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://yqekpagehpemtvjcinwq.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# Sample users (clerk_id is what frontend sends)
SAMPLE_USERS = [
    {"clerk_id": "user_test", "email": "test@vidyamitra.com", "full_name": "Test User"},
    {"clerk_id": "user_demo", "email": "demo@vidyamitra.com", "full_name": "Demo User"},
]

# Sample resume analysis
SAMPLE_RESUME_ANALYSIS = {
    "score": 78,
    "grade": "B+",
    "sections": {
        "contact_info": {"score": 90, "feedback": "Good contact information"},
        "experience": {"score": 75, "feedback": "Strong experience, consider quantifying achievements"},
        "skills": {"score": 80, "feedback": "Good skill variety, add more technical skills"},
        "education": {"score": 85, "feedback": "Well documented education"},
    },
    "strengths": ["Clear work history", "Relevant experience", "Good education"],
    "improvements": ["Add quantifiable achievements", "Include certifications", "Optimize for ATS"]
}

# Sample quiz questions
SAMPLE_QUIZ_QUESTIONS = [
    {
        "question": "What is the output of print(type([]))?",
        "options": ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'set'>"],
        "correct_answer": "<class 'list'>"
    },
    {
        "question": "Which method adds an element to a list?",
        "options": ["add()", "append()", "insert()", "push()"],
        "correct_answer": "append()"
    }
]

# Sample learning plan
SAMPLE_LEARNING_PLAN = {
    "skill_gaps": ["Docker", "Kubernetes", "AWS"],
    "weeks": [
        {"week": 1, "topic": "Docker Fundamentals", "goals": ["Understand containers", "Build images"]},
        {"week": 2, "topic": "Docker Compose", "goals": ["Multi-container apps", "Networking"]},
        {"week": 3, "topic": "Kubernetes Basics", "goals": ["Pods", "Deployments", "kubectl"]}
    ],
    "estimated_duration": "4 weeks"
}


def seed_database():
    """Seed the database with sample data"""
    if not SUPABASE_KEY:
        print("❌ SUPABASE_SERVICE_KEY not set")
        return False
    
    try:
        client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase")
        
        # Seed users
        print("\n📝 Seeding users...")
        for user in SAMPLE_USERS:
            try:
                # Check if exists
                existing = client.table("users").select("clerk_id").eq("clerk_id", user["clerk_id"]).execute()
                if existing.data:
                    print(f"   ⚡ User {user['clerk_id']} already exists")
                else:
                    client.table("users").insert(user).execute()
                    print(f"   ✓ Created user: {user['clerk_id']}")
            except Exception as e:
                print(f"   ⚠ User {user['clerk_id']}: {e}")
        
        # Seed resumes
        print("\n📝 Seeding resumes...")
        for user in SAMPLE_USERS:
            try:
                existing = client.table("resumes").select("id").eq("user_id", user["clerk_id"]).execute()
                if existing.data:
                    print(f"   ⚡ Resume for {user['clerk_id']} already exists")
                else:
                    resume_data = {
                        "user_id": user["clerk_id"],
                        "resume_text": "Sample resume text for testing...",
                        "target_role": "Software Engineer",
                        "analysis_score": SAMPLE_RESUME_ANALYSIS["score"],
                        "analysis_grade": SAMPLE_RESUME_ANALYSIS["grade"],
                        "analysis_json": SAMPLE_RESUME_ANALYSIS
                    }
                    client.table("resumes").insert(resume_data).execute()
                    print(f"   ✓ Created resume for: {user['clerk_id']}")
            except Exception as e:
                print(f"   ⚠ Resume for {user['clerk_id']}: {e}")
        
        # Seed interviews
        print("\n📝 Seeding interviews...")
        for user in SAMPLE_USERS:
            try:
                existing = client.table("interviews").select("id").eq("user_id", user["clerk_id"]).execute()
                if existing.data:
                    print(f"   ⚡ Interview for {user['clerk_id']} already exists")
                else:
                    interview_data = {
                        "user_id": user["clerk_id"],
                        "domain": "technology",
                        "role": "Software Engineer",
                        "difficulty": "intermediate",
                        "status": "completed"
                    }
                    client.table("interviews").insert(interview_data).execute()
                    print(f"   ✓ Created interview for: {user['clerk_id']}")
            except Exception as e:
                print(f"   ⚠ Interview for {user['clerk_id']}: {e}")
        
        # Seed quizzes
        print("\n📝 Seeding quizzes...")
        for user in SAMPLE_USERS:
            try:
                existing = client.table("quizzes").select("id").eq("user_id", user["clerk_id"]).execute()
                if existing.data:
                    print(f"   ⚡ Quiz for {user['clerk_id']} already exists")
                else:
                    quiz_data = {
                        "user_id": user["clerk_id"],
                        "skill": "Python",
                        "difficulty": "intermediate",
                        "questions_json": SAMPLE_QUIZ_QUESTIONS
                    }
                    client.table("quizzes").insert(quiz_data).execute()
                    print(f"   ✓ Created quiz for: {user['clerk_id']}")
            except Exception as e:
                print(f"   ⚠ Quiz for {user['clerk_id']}: {e}")
        
        # Seed learning plans
        print("\n📝 Seeding learning plans...")
        for user in SAMPLE_USERS:
            try:
                existing = client.table("learning_plans").select("id").eq("user_id", user["clerk_id"]).execute()
                if existing.data:
                    print(f"   ⚡ Learning plan for {user['clerk_id']} already exists")
                else:
                    plan_data = {
                        "user_id": user["clerk_id"],
                        "target_role": "Senior Software Engineer",
                        "plan_json": SAMPLE_LEARNING_PLAN
                    }
                    client.table("learning_plans").insert(plan_data).execute()
                    print(f"   ✓ Created learning plan for: {user['clerk_id']}")
            except Exception as e:
                print(f"   ⚠ Learning plan for {user['clerk_id']}: {e}")
        
        print("\n✅ Seeding complete!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    seed_database()
