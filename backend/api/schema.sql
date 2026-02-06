-- VidyaMitra Database Schema for Supabase
-- This schema matches the actual Supabase tables
-- Run this in Supabase SQL Editor to create tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- USERS TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,  -- Clerk auth user ID
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- ═══════════════════════════════════════════════════════════════
-- RESUMES TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
    file_url TEXT,              -- Google Drive file URL (optional)
    resume_text TEXT,           -- Raw resume text
    target_role TEXT,           -- Target job role
    analysis_score INTEGER,     -- Overall score (0-100)
    analysis_grade TEXT,        -- Letter grade (A, B+, etc.)
    analysis_json JSONB,        -- Full analysis result
    enhanced_text TEXT,         -- AI-enhanced resume text
    enhancement_changes JSONB,  -- List of changes made
    ats_score_before INTEGER,   -- ATS score before enhancement
    ats_score_after INTEGER,    -- ATS score after enhancement
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- INTERVIEWS TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
    domain TEXT NOT NULL DEFAULT 'technology',
    role TEXT NOT NULL,
    difficulty TEXT DEFAULT 'intermediate',  -- easy, intermediate, hard
    status TEXT DEFAULT 'in_progress',       -- in_progress, completed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- QUIZZES TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    difficulty TEXT DEFAULT 'intermediate',  -- easy, intermediate, hard
    questions_json JSONB,                    -- Array of question objects
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_skill ON quizzes(skill);

-- ═══════════════════════════════════════════════════════════════
-- LEARNING PLANS TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS learning_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
    target_role TEXT,           -- Target career role
    plan_json JSONB,            -- Full learning plan with weeks/resources
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_plans_user_id ON learning_plans(user_id);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_searches ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (for API server with service key)
-- These policies allow authenticated users to access only their own data

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- Resumes policies
CREATE POLICY "Users can view own resumes" ON resumes
    FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own resumes" ON resumes
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Interviews policies
CREATE POLICY "Users can view own interviews" ON interviews
    FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own interviews" ON interviews
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own interviews" ON interviews
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Learning plans policies
CREATE POLICY "Users can view own learning plans" ON learning_plans
    FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own learning plans" ON learning_plans
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own learning plans" ON learning_plans
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Quizzes policies
CREATE POLICY "Users can view own quizzes" ON quizzes
    FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own quizzes" ON quizzes
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Job searches policies
CREATE POLICY "Users can view own job searches" ON job_searches
    FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own job searches" ON job_searches
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'skills_assessed', (SELECT COUNT(*) FROM quizzes WHERE user_id = p_user_id),
        'interviews_completed', (SELECT COUNT(*) FROM interviews WHERE user_id = p_user_id AND status = 'completed'),
        'resumes_analyzed', (SELECT COUNT(*) FROM resumes WHERE user_id = p_user_id),
        'learning_plans', (SELECT COUNT(*) FROM learning_plans WHERE user_id = p_user_id),
        'profile_score', COALESCE((SELECT MAX(score) FROM resumes WHERE user_id = p_user_id), 0)
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
