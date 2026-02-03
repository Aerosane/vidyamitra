"""Job Market Data - 2025-2030 Research-Based Insights

Data sourced from:
- World Economic Forum Future of Jobs Report 2025
- Bureau of Labor Statistics
- McKinsey, Deloitte, Indeed, J.P. Morgan reports
- India Employment Forum
"""

# ═══════════════════════════════════════════════════════════════
# JOB MARKET DATA (2025-2030)
# ═══════════════════════════════════════════════════════════════

JOB_MARKET_DATA = {
    "last_updated": "2026-02",
    "sources": [
        "World Economic Forum Future of Jobs Report 2025",
        "U.S. Bureau of Labor Statistics",
        "McKinsey Healthcare Outlook 2026",
        "Indeed Jobs & Hiring Trends Report 2026",
        "India Employment Forum"
    ],
    
    # Fastest growing jobs globally (2025-2030)
    "fastest_growing_global": [
        {"role": "Big Data Specialist", "growth": "60%+", "demand": "very_high", "salary_range_usd": "90,000-180,000"},
        {"role": "AI/ML Engineer", "growth": "55%+", "demand": "very_high", "salary_range_usd": "120,000-250,000"},
        {"role": "FinTech Engineer", "growth": "50%+", "demand": "very_high", "salary_range_usd": "100,000-200,000"},
        {"role": "Cybersecurity Specialist", "growth": "35%+", "demand": "very_high", "salary_range_usd": "95,000-175,000"},
        {"role": "Cloud Architect", "growth": "30%+", "demand": "very_high", "salary_range_usd": "130,000-220,000"},
        {"role": "Renewable Energy Engineer", "growth": "30%+", "demand": "high", "salary_range_usd": "80,000-140,000"},
        {"role": "DevOps Engineer", "growth": "25%+", "demand": "very_high", "salary_range_usd": "100,000-180,000"},
        {"role": "Full Stack Developer", "growth": "22%+", "demand": "high", "salary_range_usd": "90,000-160,000"},
        {"role": "Healthcare Professional", "growth": "20%+", "demand": "very_high", "salary_range_usd": "60,000-150,000"},
        {"role": "UX/UI Designer", "growth": "18%+", "demand": "high", "salary_range_usd": "75,000-140,000"},
    ],
    
    # India-specific fastest growing (2025-2030)
    "fastest_growing_india": [
        {"role": "AI/ML Specialist", "growth": "65%+", "demand": "very_high", "salary_range_inr": "15,00,000-50,00,000"},
        {"role": "Big Data Engineer", "growth": "60%+", "demand": "very_high", "salary_range_inr": "12,00,000-40,00,000"},
        {"role": "Cloud Architect", "growth": "50%+", "demand": "very_high", "salary_range_inr": "18,00,000-55,00,000"},
        {"role": "Cybersecurity Analyst", "growth": "45%+", "demand": "very_high", "salary_range_inr": "10,00,000-35,00,000"},
        {"role": "DevOps Engineer", "growth": "40%+", "demand": "very_high", "salary_range_inr": "12,00,000-38,00,000"},
        {"role": "Digital Marketing Manager", "growth": "35%+", "demand": "high", "salary_range_inr": "8,00,000-25,00,000"},
        {"role": "Full Stack Developer", "growth": "30%+", "demand": "high", "salary_range_inr": "8,00,000-30,00,000"},
        {"role": "Renewable Energy Engineer", "growth": "30%+", "demand": "high", "salary_range_inr": "7,00,000-20,00,000"},
        {"role": "UX/UI Designer", "growth": "25%+", "demand": "high", "salary_range_inr": "6,00,000-22,00,000"},
        {"role": "Healthcare IT Specialist", "growth": "25%+", "demand": "high", "salary_range_inr": "8,00,000-25,00,000"},
    ],
    
    # Declining roles (automation risk)
    "declining_roles": [
        {"role": "Data Entry Clerk", "decline": "-30%", "automation_risk": "very_high"},
        {"role": "Bank Teller", "decline": "-25%", "automation_risk": "very_high"},
        {"role": "Postal Service Clerk", "decline": "-20%", "automation_risk": "high"},
        {"role": "Cashier", "decline": "-15%", "automation_risk": "high"},
        {"role": "Bookkeeping Clerk", "decline": "-12%", "automation_risk": "high"},
        {"role": "Administrative Assistant", "decline": "-10%", "automation_risk": "medium"},
    ],
    
    # Skills in highest demand (2025-2030)
    "top_skills_global": [
        {"skill": "AI/Machine Learning", "demand": "critical", "growth": "65%"},
        {"skill": "Data Analytics & Big Data", "demand": "critical", "growth": "58%"},
        {"skill": "Cloud Computing (AWS/Azure/GCP)", "demand": "critical", "growth": "45%"},
        {"skill": "Cybersecurity", "demand": "critical", "growth": "40%"},
        {"skill": "Python", "demand": "very_high", "growth": "35%"},
        {"skill": "DevOps & CI/CD", "demand": "very_high", "growth": "32%"},
        {"skill": "JavaScript/TypeScript", "demand": "very_high", "growth": "25%"},
        {"skill": "SQL & Database Management", "demand": "high", "growth": "20%"},
        {"skill": "Kubernetes & Containerization", "demand": "high", "growth": "38%"},
        {"skill": "API Development", "demand": "high", "growth": "22%"},
    ],
    
    # Soft skills in demand
    "top_soft_skills": [
        {"skill": "Creative Thinking", "importance": "critical"},
        {"skill": "Analytical Thinking", "importance": "critical"},
        {"skill": "Resilience & Adaptability", "importance": "very_high"},
        {"skill": "Leadership & Mentoring", "importance": "very_high"},
        {"skill": "Communication", "importance": "very_high"},
        {"skill": "Problem Solving", "importance": "high"},
        {"skill": "Collaboration", "importance": "high"},
        {"skill": "Time Management", "importance": "high"},
    ],
    
    # Industry outlook
    "industry_outlook": {
        "technology": {
            "outlook": "very_strong",
            "growth": "17-18%",
            "trends": [
                "AI integration across all roles",
                "Skills-based hiring over degrees",
                "Remote/hybrid work standard",
                "Senior roles in high demand, junior market competitive"
            ],
            "hot_areas": ["AI/ML", "Cloud", "Security", "DevOps"]
        },
        "healthcare": {
            "outlook": "very_strong",
            "growth": "15-20%",
            "trends": [
                "Persistent workforce shortages",
                "Telehealth expansion",
                "Mental health focus",
                "Tech-savvy talent preferred"
            ],
            "hot_areas": ["Nursing", "Mental Health", "Health IT", "Telehealth"]
        },
        "finance": {
            "outlook": "stable",
            "growth": "8-12%",
            "trends": [
                "Compliance and risk management priority",
                "FinTech disruption",
                "Data-driven decision making",
                "AI in financial analysis"
            ],
            "hot_areas": ["FinTech", "Risk Management", "Data Analytics", "Compliance"]
        },
        "data_science": {
            "outlook": "very_strong",
            "growth": "35%+",
            "trends": [
                "Cross-functional skills valued",
                "NLP and deep learning focus",
                "Cloud skills essential",
                "Business outcome orientation"
            ],
            "hot_areas": ["ML Engineering", "NLP", "Computer Vision", "MLOps"]
        },
        "marketing": {
            "outlook": "moderate",
            "growth": "6-10%",
            "trends": [
                "ROI-focused hiring",
                "Digital/performance marketing priority",
                "Content + analytics combo",
                "Generalist roles declining"
            ],
            "hot_areas": ["Performance Marketing", "SEO", "Marketing Analytics", "Content Strategy"]
        },
        "renewable_energy": {
            "outlook": "strong",
            "growth": "30%+",
            "trends": [
                "Green transition acceleration",
                "Government incentives",
                "Solar and wind expansion",
                "EV infrastructure growth"
            ],
            "hot_areas": ["Solar Engineering", "Wind Energy", "EV Technology", "Sustainability"]
        }
    },
    
    # Certifications in demand
    "top_certifications": [
        {"name": "AWS Solutions Architect", "field": "Cloud", "value": "very_high"},
        {"name": "Google Cloud Professional", "field": "Cloud", "value": "very_high"},
        {"name": "Azure Administrator", "field": "Cloud", "value": "high"},
        {"name": "CISSP", "field": "Cybersecurity", "value": "very_high"},
        {"name": "CEH (Certified Ethical Hacker)", "field": "Cybersecurity", "value": "high"},
        {"name": "PMP", "field": "Project Management", "value": "high"},
        {"name": "Scrum Master", "field": "Agile", "value": "high"},
        {"name": "TensorFlow Developer", "field": "AI/ML", "value": "high"},
        {"name": "Kubernetes Administrator (CKA)", "field": "DevOps", "value": "high"},
        {"name": "Data Engineering Professional", "field": "Data", "value": "high"},
    ],
    
    # Salary benchmarks 2026 (USD)
    "salary_benchmarks_usd": {
        "entry_level": {
            "software_engineer": "70,000-95,000",
            "data_analyst": "55,000-75,000",
            "cybersecurity_analyst": "65,000-85,000",
            "devops_engineer": "75,000-100,000",
            "ml_engineer": "85,000-115,000"
        },
        "mid_level": {
            "software_engineer": "100,000-140,000",
            "data_scientist": "95,000-135,000",
            "cybersecurity_engineer": "100,000-140,000",
            "devops_engineer": "110,000-150,000",
            "ml_engineer": "130,000-180,000"
        },
        "senior": {
            "software_engineer": "150,000-220,000",
            "data_scientist": "140,000-200,000",
            "security_architect": "160,000-230,000",
            "cloud_architect": "170,000-250,000",
            "ml_architect": "180,000-280,000"
        }
    },
    
    # Key insights
    "key_insights": [
        "39-40% of core job skills will change by 2030",
        "AI will impact nearly every sector, creating new roles while automating others",
        "Skills-based hiring is replacing degree requirements at many companies",
        "Remote work remains standard for tech roles",
        "India's tech sector targeting $500B revenue by 2030",
        "Healthcare and green energy are recession-resistant growth areas",
        "Upskilling in AI/ML provides the highest career ROI"
    ]
}


def get_job_market_summary(field: str = None) -> dict:
    """Get job market summary, optionally filtered by field"""
    if field and field.lower() in JOB_MARKET_DATA["industry_outlook"]:
        return {
            "field": field,
            "outlook": JOB_MARKET_DATA["industry_outlook"][field.lower()],
            "top_skills": [s for s in JOB_MARKET_DATA["top_skills_global"][:5]],
            "key_insights": JOB_MARKET_DATA["key_insights"][:3]
        }
    return {
        "fastest_growing": JOB_MARKET_DATA["fastest_growing_global"][:5],
        "top_skills": JOB_MARKET_DATA["top_skills_global"][:5],
        "industry_outlook": {k: v["outlook"] for k, v in JOB_MARKET_DATA["industry_outlook"].items()},
        "key_insights": JOB_MARKET_DATA["key_insights"]
    }


def get_role_outlook(role: str) -> dict:
    """Get outlook for a specific role"""
    role_lower = role.lower()
    
    # Check fastest growing
    for job in JOB_MARKET_DATA["fastest_growing_global"]:
        if role_lower in job["role"].lower():
            return {
                "role": job["role"],
                "outlook": "growing",
                "growth_rate": job["growth"],
                "demand": job["demand"],
                "salary_range": job["salary_range_usd"],
                "recommendation": "Strong career choice with excellent growth prospects"
            }
    
    # Check declining
    for job in JOB_MARKET_DATA["declining_roles"]:
        if role_lower in job["role"].lower():
            return {
                "role": job["role"],
                "outlook": "declining",
                "decline_rate": job["decline"],
                "automation_risk": job["automation_risk"],
                "recommendation": "Consider upskilling to adjacent tech-enabled roles"
            }
    
    return {
        "role": role,
        "outlook": "stable",
        "recommendation": "Research specific industry trends for this role"
    }


def get_skills_gap_analysis(current_skills: list, target_role: str) -> dict:
    """Analyze skill gaps based on market demand"""
    current_lower = [s.lower() for s in current_skills]
    
    # Skills needed for common roles
    role_skills = {
        "software engineer": ["python", "javascript", "sql", "git", "api development", "cloud computing"],
        "data scientist": ["python", "sql", "machine learning", "data analytics", "statistics", "tensorflow"],
        "ml engineer": ["python", "tensorflow", "pytorch", "mlops", "cloud computing", "docker"],
        "devops engineer": ["kubernetes", "docker", "ci/cd", "aws", "terraform", "linux"],
        "cybersecurity": ["security", "networking", "linux", "python", "compliance", "incident response"],
        "cloud architect": ["aws", "azure", "gcp", "kubernetes", "networking", "security"],
        "full stack": ["javascript", "react", "node.js", "python", "sql", "api development"],
    }
    
    target_lower = target_role.lower()
    needed_skills = []
    
    for role_key, skills in role_skills.items():
        if role_key in target_lower:
            needed_skills = skills
            break
    
    if not needed_skills:
        # Default to high-demand skills
        needed_skills = [s["skill"].lower() for s in JOB_MARKET_DATA["top_skills_global"][:6]]
    
    missing = [s for s in needed_skills if s not in current_lower]
    matched = [s for s in needed_skills if s in current_lower]
    
    return {
        "target_role": target_role,
        "skills_matched": matched,
        "skills_missing": missing,
        "match_percent": int((len(matched) / len(needed_skills)) * 100) if needed_skills else 0,
        "priority_skills": missing[:3],
        "market_demand_skills": [s["skill"] for s in JOB_MARKET_DATA["top_skills_global"][:5]]
    }
