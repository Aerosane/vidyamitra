"use client"
import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { TrendingUp, TrendingDown, Target, BookOpen, DollarSign, Star, Zap, Clock, Briefcase, MapPin, Award, AlertCircle, Check, Plus } from 'lucide-react';

function JobRecommendation() {
  const { user, isLoaded } = useUser();
  const [skills, setSkills] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [targetRole, setTargetRole] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [learningPlan, setLearningPlan] = useState(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [marketSkills, setMarketSkills] = useState(null);
  const [marketSummary, setMarketSummary] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [analyzingGap, setAnalyzingGap] = useState(false);
  const [activeTab, setActiveTab] = useState('recommendations');

  const FAST_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Fetch market data on component mount
  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      const [skillsResponse, summaryResponse] = await Promise.all([
        fetch(`${FAST_API_URL}/api/jobs/market/skills`),
        fetch(`${FAST_API_URL}/api/jobs/market/summary`)
      ]);

      if (skillsResponse.ok) {
        const data = await skillsResponse.json();
        setMarketSkills(data);
      }

      if (summaryResponse.ok) {
        const data = await summaryResponse.json();
        setMarketSummary(data);
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
    }
  };

  // Get username from Clerk
  const getUserId = () => {
    if (!user) return "user_123";
    return user.username || user.firstName || user.id || "user_123";
  };

  // Get job recommendations
  const getJobRecommendations = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setLearningPlan(null);
    setSkillGap(null);

    // Convert skills string to array
    const skillsArray = skills.split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    const userId = getUserId();

    const payload = {
      user_id: userId,
      data: {
        skills: skillsArray,
        experience_years: experienceYears,
        target_role: targetRole,
        location: location
      }
    };

    try {
      const response = await fetch(`${FAST_API_URL}/api/webhook/jobs/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "ok") {
        setResult(data);
        setActiveTab('recommendations');

        // Automatically analyze skill gap for the first recommendation (don't switch tab)
        if (data.jobs && data.jobs.length > 0) {
          analyzeSkillGap(data.jobs[0].title, false);
        }
      } else {
        throw new Error('Failed to get job recommendations');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate learning plan
  const generateLearningPlan = async (gaps, role) => {
    setGeneratingPlan(true);
    setError('');
    const userId = getUserId();

    const payload = {
      user_id: userId,
      data: {
        gaps: gaps,
        target_role: role
      }
    };

    try {
      const response = await fetch(`${FAST_API_URL}/api/webhook/learning/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "ok") {
        setLearningPlan(data);
        setActiveTab('learning');
      } else {
        throw new Error('Failed to generate learning plan');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Analyze skill gap
  const analyzeSkillGap = async (role, switchTab = true) => {
    if (!skills.trim()) return;

    setAnalyzingGap(true);

    // Convert skills string to array
    const skillsArray = skills.split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);

    const targetRoleToAnalyze = role || targetRole;
    if (!targetRoleToAnalyze) {
      setError('Please specify a target role');
      setAnalyzingGap(false);
      return;
    }

    try {
      const response = await fetch(`${FAST_API_URL}/api/jobs/market/skill-gap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: skillsArray,
          target_role: targetRoleToAnalyze
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSkillGap(data);
        if (switchTab) {
          setActiveTab('skillgap');
        }
      } else {
        throw new Error('Failed to analyze skill gap');
      }
    } catch (err) {
      console.error('Error analyzing skill gap:', err);
      setError(err.message);
    } finally {
      setAnalyzingGap(false);
    }
  };

  const getMatchColor = (percent) => {
    if (percent >= 80) return 'from-green-500 to-emerald-500';
    if (percent >= 60) return 'from-yellow-500 to-orange-500';
    if (percent >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-500';
  };

  const getGrowthIcon = (outlook) => {
    switch (outlook?.toLowerCase()) {
      case 'strong':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'high':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'moderate':
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'low':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-400" />;
    }
  };

  const getDemandColor = (demand) => {
    switch (demand?.toLowerCase()) {
      case 'critical': return 'text-red-400';
      case 'very_high': return 'text-orange-400';
      case 'high': return 'text-yellow-400';
      case 'medium': return 'text-blue-400';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getResourceTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'course': return <BookOpen className="w-4 h-4" />;
      case 'practice': return <Target className="w-4 h-4" />;
      case 'book': return <BookOpen className="w-4 h-4" />;
      case 'tutorial': return <Zap className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const calculateAverageSalary = () => {
    if (!result?.jobs?.length) return 0;

    let total = 0;
    let count = 0;

    result.jobs.forEach(job => {
      const salaryStr = job.salary_range_usd || job.salary || job.compensation || '';
      const match = salaryStr.match(/\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/);

      if (match) {
        const min = parseInt(match[1].replace(/,/g, '')) || 0;
        const max = parseInt(match[2].replace(/,/g, '')) || 0;
        const avg = (min + max) / 2;
        if (!isNaN(avg)) {
          total += avg;
          count++;
        }
      }
    });

    return count > 0 ? Math.round(total / count) : 0;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-2xl font-bold text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8 relative">
      {/* Neon Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        <h1 className="text-3xl font-bold text-white mb-2">Career Navigator</h1>
        <p className="text-gray-400 mb-8">Welcome, {getUserId()}! Find your dream job and build your skills.</p>

        {/* Input Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 md:p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <div>
              <label className="block text-white mb-2 md:mb-3">Your Skills (comma separated):</label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, FastAPI, PostgreSQL, Docker, React, etc."
                className="w-full h-32 p-3 md:p-4 bg-gray-700/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <p className="text-gray-400 text-sm mt-2">Separate skills with commas</p>
            </div>

            <div>
              <label className="block text-white mb-2 md:mb-3">Target Role:</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Backend Developer, Full Stack Engineer"
                className="w-full p-3 md:p-4 bg-gray-700/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white mb-2 md:mb-3">Years of Experience:</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                min="0"
                max="50"
                className="w-full p-3 md:p-4 bg-gray-700/50 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white mb-2 md:mb-3">Preferred Location:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Remote, San Francisco, New York"
                className="w-full p-3 md:p-4 bg-gray-700/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={getJobRecommendations}
              disabled={loading || !skills.trim() || !targetRole.trim()}
              className={`flex-1 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all ${loading || !skills.trim() || !targetRole.trim()
                ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:scale-105'
                }`}
            >
              {loading ? 'Finding Jobs...' : 'Get Job Recommendations'}
            </button>

            <button
              onClick={() => analyzeSkillGap(targetRole)}
              disabled={analyzingGap || !skills.trim() || !targetRole.trim()}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all ${analyzingGap || !skills.trim() || !targetRole.trim()
                ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white hover:scale-105'
                }`}
            >
              {analyzingGap ? 'Analyzing...' : 'Analyze Skill Gap'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 md:p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Market Insights */}
        {(marketSkills || marketSummary) && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">Market Insights</h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* In-Demand Skills */}
              {marketSkills && (
                <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white">In-Demand Skills</h4>
                  </div>

                  <div className="space-y-4">
                    {/* Technical Skills */}
                    <div>
                      <h5 className="font-bold text-white mb-3">Technical Skills</h5>
                      <div className="space-y-2">
                        {marketSkills.technical_skills?.slice(0, 5).map((skill, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                            <span className="text-white">{skill.skill}</span>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-semibold ${getDemandColor(skill.demand)}`}>
                                {skill.demand}
                              </span>
                              <span className="text-green-400 text-sm font-bold">
                                {skill.growth}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Soft Skills */}
                    {marketSkills.soft_skills && marketSkills.soft_skills.length > 0 && (
                      <div>
                        <h5 className="font-bold text-white mb-3">Soft Skills</h5>
                        <div className="flex flex-wrap gap-2">
                          {marketSkills.soft_skills.slice(0, 6).map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-sm"
                            >
                              {skill.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Market Summary */}
              {marketSummary && (
                <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-2xl p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white">Market Trends</h4>
                  </div>

                  <div className="space-y-4">
                    {/* Fastest Growing */}
                    {marketSummary.fastest_growing && marketSummary.fastest_growing.length > 0 && (
                      <div>
                        <h5 className="font-bold text-white mb-3">Fastest Growing Roles</h5>
                        <div className="space-y-2">
                          {marketSummary.fastest_growing.slice(0, 3).map((role, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                              <span className="text-white">{role.role}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-green-400 text-sm font-bold">
                                  {role.growth}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hot Skills */}
                    {marketSummary.hot_skills && marketSummary.hot_skills.length > 0 && (
                      <div>
                        <h5 className="font-bold text-white mb-3">Hot Skills</h5>
                        <div className="flex flex-wrap gap-2">
                          {marketSummary.hot_skills.slice(0, 8).map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-2 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-xl text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Declining Roles */}
                    {marketSummary.declining && marketSummary.declining.length > 0 && (
                      <div>
                        <h5 className="font-bold text-white mb-3">⚠️ Declining Roles</h5>
                        <div className="space-y-2">
                          {marketSummary.declining.slice(0, 3).map((role, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                              <span className="text-white">{role.role}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-red-400 text-sm font-bold">
                                  {role.decline}
                                </span>
                                {role.automation_risk && (
                                  <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded">
                                    {role.automation_risk} automation risk
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Outdated Skills */}
                    {marketSummary.outdated_skills && marketSummary.outdated_skills.length > 0 && (
                      <div>
                        <h5 className="font-bold text-white mb-3">🚫 Outdated Skills</h5>
                        <div className="flex flex-wrap gap-2">
                          {marketSummary.outdated_skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-2 bg-gray-700/50 text-gray-400 border border-gray-600/30 rounded-xl text-sm line-through"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        {(result || skillGap || learningPlan) && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {result && (
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'recommendations'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  Job Recommendations ({result.jobs?.length || 0})
                </button>
              )}

              {skillGap && (
                <button
                  onClick={() => setActiveTab('skillgap')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'skillgap'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  Skill Gap Analysis
                </button>
              )}

              {learningPlan && (
                <button
                  onClick={() => setActiveTab('learning')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'learning'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  Learning Plan
                </button>
              )}
            </div>
          </div>
        )}

        {/* Job Recommendations Tab */}
        {activeTab === 'recommendations' && result && result.status === "ok" && result.jobs && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white">Job Recommendations</h3>
                <p className="text-gray-300 mt-2">Based on your skills and target role</p>
              </div>
              <div className="text-gray-300">
                Found {result.jobs.length} matching jobs
              </div>
            </div>

            <div className="space-y-6">
              {result.jobs.map((job, index) => {
                // Handle dynamic job data from API
                const title = job.title || job.position || `Job ${index + 1}`;
                const matchPercent = job.match_percent || job.match_score || job.score || 0;
                const skillsMatched = job.skills_matched || job.matched_skills || [];
                const skillsToLearn = job.skills_to_learn || job.required_skills || [];
                const salaryRange = job.salary_range_usd || job.salary || job.compensation || 'Not specified';
                const growthOutlook = job.growth_outlook || job.outlook || 'moderate';

                return (
                  <div key={index} className="bg-gray-700/30 p-4 md:p-6 rounded-xl border border-gray-600/50">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                            {title.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white">{title}</h4>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                {getGrowthIcon(growthOutlook)}
                                <span className="text-gray-300">Growth:</span>
                                <span className="font-semibold text-white">{growthOutlook}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-300 font-bold">{salaryRange}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getMatchColor(matchPercent)}`}>
                          <div className="text-2xl font-bold text-white">{matchPercent}%</div>
                          <div className="text-xs text-white/80">Match Score</div>
                        </div>

                        <button
                          onClick={() => {
                            const gaps = skillsToLearn;
                            if (gaps.length > 0) {
                              generateLearningPlan(gaps, title);
                            }
                          }}
                          className="mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all text-sm"
                        >
                          Learn Missing Skills
                        </button>
                      </div>
                    </div>

                    {/* Skills Matched */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="font-semibold text-white">Your Skills Matched:</span>
                        <span className="text-green-400 text-sm">
                          {skillsMatched.length} of {skillsMatched.length + skillsToLearn.length} skills
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skillsMatched.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-3 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-xl text-sm"
                          >
                            <Check className="w-4 h-4 inline mr-1" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills to Learn */}
                    {skillsToLearn.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="font-semibold text-white">Skills to Learn:</span>
                          <span className="text-blue-400 text-sm">
                            {skillsToLearn.length} recommended skills
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {skillsToLearn.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-3 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-sm"
                            >
                              <Plus className="w-4 h-4 inline mr-1" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Apply Button */}
                    <div className="mt-6 pt-6 border-t border-gray-600/50">
                      <a 
                        href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}${location ? `&location=${encodeURIComponent(location)}` : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(
                            `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}${location ? `&location=${encodeURIComponent(location)}` : ''}`,
                            '_blank'
                          );
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all hover:scale-105"
                      >
                        🔗 View Job Details & Apply →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Statistics */}
            <div className="mt-8 pt-8 border-t border-gray-600/50">
              <h4 className="text-xl font-bold text-white mb-6">Recommendation Summary</h4>
              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gray-700/30 p-4 md:p-6 rounded-xl">
                  <div className="text-3xl font-bold text-white mb-2">
                    {result.jobs.length}
                  </div>
                  <div className="text-gray-300">Total Jobs Found</div>
                </div>

                <div className="bg-gray-700/30 p-4 md:p-6 rounded-xl">
                  <div className="text-3xl font-bold text-white mb-2">
                    {Math.round(result.jobs.reduce((sum, job) => {
                      const match = job.match_percent || job.match_score || job.score || 0;
                      return sum + match;
                    }, 0) / result.jobs.length)}%
                  </div>
                  <div className="text-gray-300">Average Match Score</div>
                </div>

                <div className="bg-gray-700/30 p-4 md:p-6 rounded-xl">
                  <div className="text-3xl font-bold text-white mb-2">
                    ${calculateAverageSalary().toLocaleString()}
                  </div>
                  <div className="text-gray-300">Avg Salary (USD)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skill Gap Analysis Tab */}
        {activeTab === 'skillgap' && skillGap && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-4 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white">Skill Gap Analysis</h3>
                <p className="text-gray-300 mt-2">For Target Role: {skillGap.target_role || targetRole}</p>
              </div>

              <div className={`px-4 md:px-6 py-2 md:py-3 rounded-xl bg-gradient-to-r ${getMatchColor(skillGap.match_percent || 0)}`}>
                <div className="text-2xl font-bold text-white">{skillGap.match_percent || 0}%</div>
                <div className="text-xs text-white/80">Skill Match</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8">
              {/* Skills Matched */}
              <div className="bg-gray-700/30 p-4 md:p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Check className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Skills You Have</h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skillGap.skills_matched?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-xl text-sm"
                    >
                      <Check className="w-4 h-4 inline mr-1" />
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {skillGap.skills_matched?.length || 0} skills
                  </div>
                  <div className="text-gray-300">Already mastered</div>
                </div>
              </div>

              {/* Skills Missing */}
              <div className="bg-gray-700/30 p-4 md:p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Skills to Learn</h4>
                </div>

                <div className="space-y-3">
                  {skillGap.skills_missing?.map((skill, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl ${skillGap.priority_skills?.includes(skill)
                        ? 'bg-red-500/10 border border-red-500/20'
                        : 'bg-blue-500/10 border border-blue-500/20'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{skill}</span>
                        {skillGap.priority_skills?.includes(skill) && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-lg">
                            High Priority
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            {skillGap.skills_missing && skillGap.skills_missing.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => generateLearningPlan(skillGap.skills_missing, skillGap.target_role || targetRole)}
                  disabled={generatingPlan}
                  className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all ${generatingPlan
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105'
                    }`}
                >
                  {generatingPlan ? 'Generating Plan...' : 'Generate Learning Plan'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Learning Plan Tab */}
        {activeTab === 'learning' && learningPlan && learningPlan.status === "ok" && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/20 rounded-2xl p-4 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white">Personalized Learning Plan</h3>
                <p className="text-gray-300 mt-2">Plan ID: {learningPlan.plan_id || 'N/A'}</p>
              </div>
              <div className="text-gray-300">
                {learningPlan.plan?.length || 0} skills to master
              </div>
            </div>

            <div className="space-y-6">
              {learningPlan.plan?.map((item, index) => {
                const skill = item.skill || `Skill ${index + 1}`;
                const priority = item.priority || 'medium';
                const resources = item.resources || [];

                return (
                  <div key={index} className="bg-gray-700/30 p-4 md:p-6 rounded-xl border border-gray-600/50">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                          {skill.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">{skill}</h4>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getPriorityColor(priority)}`}>
                              {priority} priority
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Learning Resources */}
                    {resources.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="font-semibold text-white">Recommended Resources:</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {resources.map((resource, resIndex) => (
                            <div
                              key={resIndex}
                              className="p-4 bg-gray-800/50 rounded-xl border border-gray-600/50 hover:border-blue-500/50 transition-colors"
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-blue-500/20">
                                  {getResourceTypeIcon(resource.type)}
                                </div>
                                <div>
                                  <div className="font-bold text-white">{resource.title}</div>
                                  <div className="text-gray-300 text-sm mt-1">
                                    {resource.type} • {resource.platform}
                                  </div>
                                </div>
                              </div>

                              <button className="w-full mt-3 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium rounded-lg transition-colors text-sm">
                                Start Learning
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Plan Summary */}
            <div className="mt-8 pt-8 border-t border-gray-600/50">
              <h4 className="text-xl font-bold text-white mb-6">Learning Plan Summary</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-gray-700/30 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-white mb-2">
                    {learningPlan.plan?.filter(p => p.priority === 'high').length || 0}
                  </div>
                  <div className="text-gray-300">High Priority Skills</div>
                </div>

                <div className="bg-gray-700/30 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-white mb-2">
                    {learningPlan.plan?.length || 0}
                  </div>
                  <div className="text-gray-300">Total Skills</div>
                </div>

                <div className="bg-gray-700/30 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-white mb-2">
                    {learningPlan.plan?.reduce((sum, item) => sum + (item.resources?.length || 0), 0)}
                  </div>
                  <div className="text-gray-300">Learning Resources</div>
                </div>

                <div className="bg-gray-700/30 p-4 rounded-xl">
                  <div className="text-sm text-gray-400 mb-1">Plan ID</div>
                  <div className="text-sm font-mono text-gray-300 truncate">
                    {learningPlan.plan_id || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reset Button */}
        {(result || skillGap || learningPlan) && (
          <div className="text-center">
            <button
              onClick={() => {
                setResult(null);
                setLearningPlan(null);
                setSkillGap(null);
                setActiveTab('recommendations');
              }}
              className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all hover:scale-105"
            >
              Start New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobRecommendation;