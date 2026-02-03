import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Target, Trophy, TrendingUp, Briefcase,
  BookOpen, Users, PenTool, CheckCircle, Calendar,
  ArrowRight, X, Play, Award, Clock, Zap, Star,
  MessageCircle, Bell, Settings, LogOut, Menu, Home,
  FileText, BarChart, Plus, Moon, Sun
} from 'lucide-react';
import ResumeBuilder from './ResumeBuilder';
import './App-dark-mode.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' or 'resume-builder'
  const [currentUser] = useState({
    name: "John",
    email: "john@gmail.com",
    avatar: "JD"
  });

  const [stats] = useState({
    skillsAssessed: 12,
    achievements: 8,
    profileScore: 85,
    streakDays: 15
  });

  const [activities] = useState([
    { id: 1, title: "Completed Resume Analysis", time: "2 hours ago", icon: CheckCircle, color: "#00B894" },
    { id: 2, title: "Started JavaScript Course", time: "1 day ago", icon: Play, color: "#6C5CE7" },
    { id: 3, title: "Earned 'Profile Builder' Badge", time: "2 days ago", icon: Award, color: "#FD9644" },
    { id: 4, title: "Scored 92% in React Quiz", time: "3 days ago", icon: Trophy, color: "#00D9C0" },
    { id: 5, title: "Completed Full Stack Module", time: "1 week ago", icon: Star, color: "#A29BFE" }
  ]);

  const [activeModal, setActiveModal] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [formData, setFormData] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const quickActions = [
    {
      id: 1,
      title: "Start Career Journey",
      description: "Begin with resume analysis and career planning",
      icon: Target,
      color: "#6C5CE7",
      action: "career-journey"
    },
    {
      id: 2,
      title: "Skill Evaluation",
      description: "Assess your skills to match job requirements",
      icon: TrendingUp,
      color: "#00D9C0",
      action: "skill-eval"
    },
    {
      id: 3,
      title: "Learning Plan",
      description: "Get personalized training roadmap",
      icon: BookOpen,
      color: "#FD9644",
      action: "learning-plan"
    },
    {
      id: 4,
      title: "Practice Quiz",
      description: "Test your knowledge with AI-powered practice",
      icon: PenTool,
      color: "#FD79A8",
      action: "practice-quiz"
    }
  ];

  const recommendations = [
    {
      id: 1,
      title: "Complete Your Profile",
      description: "Add work experience to better job matches",
      progress: 73,
      buttonText: "Complete Now",
      buttonType: "primary"
    },
    {
      id: 2,
      title: "Take Skill Assessment",
      description: "Evaluate your JavaScript skills to unlock new opportunities",
      progress: 0,
      buttonText: "Start Assessment",
      buttonType: "secondary"
    },
    {
      id: 3,
      title: "Practice Interview",
      description: "Prepare for your next interview with AI-powered practice",
      progress: 25,
      buttonText: "Continue",
      buttonType: "tertiary"
    }
  ];

  const moreActions = [
    { id: 1, title: "Mock Interview", icon: Users },
    { id: 2, title: "Job Matching", icon: Briefcase }
  ];

  const navigationItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Resume', icon: FileText },
    { name: 'Evaluate', icon: Target },
    { name: 'Plan', icon: Calendar },
    { name: 'Guide', icon: BookOpen },
    { name: 'Interview', icon: Users },
    { name: 'Jobs', icon: Briefcase },
    { name: 'Progress', icon: BarChart },
    { name: 'Logout', icon: LogOut }
  ];

  const handleNavClick = (navName) => {
    setActiveNav(navName);
    if (navName === 'Resume') {
      setCurrentPage('resume-builder');
    } else if (navName === 'Dashboard') {
      setCurrentPage('dashboard');
    }
  };

  const handleActionClick = (action) => {
    setActiveModal(action);
    setQuizAnswers({});
    setFormData({});
  };

  const handleQuizSubmit = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setActiveModal(null);
      setShowSuccess(false);
    }, 2000);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setActiveModal(null);
      setShowSuccess(false);
    }, 2000);
  };

  const renderModal = () => {
    if (!activeModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setActiveModal(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">
              {activeModal === 'practice-quiz' && 'Practice Quiz'}
              {activeModal === 'career-journey' && 'Start Career Journey'}
              {activeModal === 'skill-eval' && 'Skill Evaluation'}
              {activeModal === 'learning-plan' && 'Create Learning Plan'}
            </h2>
            <button className="close-button" onClick={() => setActiveModal(null)}>
              <X size={20} />
            </button>
          </div>

          {showSuccess && (
            <div className="success-message">
              <CheckCircle size={24} />
              <span>Successfully submitted! Your progress has been saved.</span>
            </div>
          )}

          {activeModal === 'practice-quiz' && (
            <div>
              <div className="form-group">
                <label className="form-label">Question 1: What is React?</label>
                <div
                  className={`quiz-option ${quizAnswers.q1 === 'a' ? 'selected' : ''}`}
                  onClick={() => setQuizAnswers({ ...quizAnswers, q1: 'a' })}
                >
                  A JavaScript library for building user interfaces
                </div>
                <div
                  className={`quiz-option ${quizAnswers.q1 === 'b' ? 'selected' : ''}`}
                  onClick={() => setQuizAnswers({ ...quizAnswers, q1: 'b' })}
                >
                  A database management system
                </div>
                <div
                  className={`quiz-option ${quizAnswers.q1 === 'c' ? 'selected' : ''}`}
                  onClick={() => setQuizAnswers({ ...quizAnswers, q1: 'c' })}
                >
                  A server-side framework
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Question 2: Which hook is used for side effects?</label>
                <div
                  className={`quiz-option ${quizAnswers.q2 === 'a' ? 'selected' : ''}`}
                  onClick={() => setQuizAnswers({ ...quizAnswers, q2: 'a' })}
                >
                  useState
                </div>
                <div
                  className={`quiz-option ${quizAnswers.q2 === 'b' ? 'selected' : ''}`}
                  onClick={() => setQuizAnswers({ ...quizAnswers, q2: 'b' })}
                >
                  useEffect
                </div>
                <div
                  className={`quiz-option ${quizAnswers.q2 === 'c' ? 'selected' : ''}`}
                  onClick={() => setQuizAnswers({ ...quizAnswers, q2: 'c' })}
                >
                  useContext
                </div>
              </div>

              <button className="action-button primary" onClick={handleQuizSubmit} style={{ width: '100%' }}>
                Submit Quiz
              </button>
            </div>
          )}

          {activeModal === 'career-journey' && (
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Current Position</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Junior Developer"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g., 2"
                  value={formData.experience || ''}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Career Goals</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Senior Full Stack Developer"
                  value={formData.goals || ''}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                />
              </div>
              <button type="submit" className="action-button primary" style={{ width: '100%' }}>
                Start Journey
              </button>
            </form>
          )}

          {activeModal === 'skill-eval' && (
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Select Skill to Evaluate</label>
                <select
                  className="form-input"
                  value={formData.skill || ''}
                  onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                >
                  <option value="">Choose a skill...</option>
                  <option value="javascript">JavaScript</option>
                  <option value="react">React</option>
                  <option value="python">Python</option>
                  <option value="nodejs">Node.js</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Self-Rating (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="form-input"
                  value={formData.rating || 5}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
                <div style={{ textAlign: 'center', marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {formData.rating || 5}/10
                </div>
              </div>
              <button type="submit" className="action-button secondary" style={{ width: '100%' }}>
                Start Evaluation
              </button>
            </form>
          )}

          {activeModal === 'learning-plan' && (
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">What would you like to learn?</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Advanced React Patterns"
                  value={formData.topic || ''}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time Commitment (hours/week)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g., 10"
                  value={formData.hours || ''}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Completion</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <button type="submit" className="action-button tertiary" style={{ width: '100%' }}>
                Generate Plan
              </button>
            </form>
          )}
        </div>
      </div>
    );
  };

  // Show Resume Builder if that page is active
  if (currentPage === 'resume-builder') {
    return (
      <ResumeBuilder 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onNavigateHome={() => setCurrentPage('dashboard')}
      />
    );
  }

  // Dashboard
  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">
            <GraduationCap size={20} />
          </div>
          VidyaMitra
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="nav-menu">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.name}
                  className={`nav-item ${activeNav === item.name ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.name)}
                >
                  <IconComponent size={16} />
                  {item.name}
                </div>
              );
            })}
          </div>
          {/* Dark Mode Toggle */}
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="welcome-header">
            <div className="welcome-text">
              <h1>Welcome back, {currentUser.name}! 👋</h1>
              <p>Ready to advance your career today?</p>
            </div>
            <div className="user-profile">
              <div className="user-avatar">
                {currentUser.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{currentUser.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' }}>
              <Target size={28} color="white" />
            </div>
            <div className="stat-value">{stats.skillsAssessed}</div>
            <div className="stat-label">Skills Assessed</div>
            <div className="stat-subtitle">+3 this week</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #00D9C0, #00B894)' }}>
              <Trophy size={28} color="white" />
            </div>
            <div className="stat-value">{stats.achievements}</div>
            <div className="stat-label">Achievements</div>
            <div className="stat-subtitle">New badge earned!</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FD9644, #FD79A8)' }}>
              <TrendingUp size={28} color="white" />
            </div>
            <div className="stat-value">{stats.profileScore}%</div>
            <div className="stat-label">Profile Score</div>
            <div className="stat-subtitle">+5% this month</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats.profileScore}%` }}></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FDCB6E, #FD9644)' }}>
              <Zap size={28} color="white" />
            </div>
            <div className="stat-value">{stats.streakDays}</div>
            <div className="stat-label">Streak Days</div>
            <div className="stat-subtitle">Keep it up!</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Quick Actions */}
          <div className="section-card">
            <div className="section-header">
              <Zap size={24} color="var(--primary)" />
              Quick Actions
            </div>
            <div className="action-grid">
              {quickActions.map(action => {
                const IconComponent = action.icon;
                return (
                  <div
                    key={action.id}
                    className="action-card"
                    onClick={() => handleActionClick(action.action)}
                  >
                    <div className="action-content">
                      <div className="action-icon" style={{ background: `${action.color}20`, color: action.color }}>
                        <IconComponent size={24} />
                      </div>
                      <div className="action-title">{action.title}</div>
                      <div className="action-description">{action.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="section-card">
            <div className="section-header">
              <Clock size={24} color="var(--primary)" />
              Recent Activity
            </div>
            <div className="activity-list">
              {activities.map(activity => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon" style={{ background: `${activity.color}20`, color: activity.color }}>
                      <IconComponent size={20} />
                    </div>
                    <div className="activity-details">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="section-card">
          <div className="section-header">
            <Star size={24} color="var(--primary)" />
            Recommended for You
          </div>
          {recommendations.map(rec => (
            <div key={rec.id} className="recommendation-card">
              <div className="recommendation-header">
                <div>
                  <div className="recommendation-title">{rec.title}</div>
                  <div className="recommendation-description">{rec.description}</div>
                </div>
              </div>
              <div className="recommendation-footer">
                <div className="progress-text">{rec.progress}%</div>
                <button className={`action-button ${rec.buttonType}`}>
                  {rec.buttonText}
                  <ArrowRight size={16} />
                </button>
              </div>
              {rec.progress > 0 && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${rec.progress}%` }}></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* More Actions */}
        <div className="section-card">
          <div className="section-header">
            <Plus size={24} color="var(--primary)" />
            More Actions
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {moreActions.map(action => {
              const IconComponent = action.icon;
              return (
                <div key={action.id} className="activity-item" style={{ flex: '1', minWidth: '200px' }}>
                  <div className="activity-icon" style={{ background: 'linear-gradient(135deg, #6C5CE7, #00D9C0)', color: 'white' }}>
                    <IconComponent size={20} />
                  </div>
                  <div className="activity-details">
                    <div className="activity-title">{action.title}</div>
                  </div>
                  <ArrowRight size={20} color="var(--dark-light)" />
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fab" onClick={() => handleActionClick('career-journey')}>
        <MessageCircle size={28} />
      </button>

      {/* Modal */}
      {renderModal()}
    </div>
  );
}

export default App;