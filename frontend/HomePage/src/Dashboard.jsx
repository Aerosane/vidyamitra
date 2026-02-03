import React, { useState } from 'react';
import {
  Target, Trophy, TrendingUp, Zap, Star, Clock,
  CheckCircle, Play, Award, ArrowRight, Plus,
  Users, Briefcase, BookOpen, PenTool, MessageCircle
} from 'lucide-react';

function Dashboard({ userData, onNavigate }) {
  const [activeModal, setActiveModal] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [formData, setFormData] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const stats = {
    skillsAssessed: userData.skillsAssessed,
    achievements: userData.achievements,
    profileScore: userData.profileScore,
    streakDays: userData.streakDays
  };

  const activities = [
    { id: 1, title: "Completed Resume Analysis", time: "2 hours ago", icon: CheckCircle, color: "#00B894" },
    { id: 2, title: "Started JavaScript Course", time: "1 day ago", icon: Play, color: "#6C5CE7" },
    { id: 3, title: "Earned 'Profile Builder' Badge", time: "2 days ago", icon: Award, color: "#FD9644" },
    { id: 4, title: "Scored 92% in React Quiz", time: "3 days ago", icon: Trophy, color: "#00D9C0" },
    { id: 5, title: "Completed Full Stack Module", time: "1 week ago", icon: Star, color: "#A29BFE" }
  ];

  const quickActions = [
    {
      id: 1,
      title: "Start Career Journey",
      description: "Begin with resume analysis and career planning",
      icon: Target,
      color: "#6C5CE7",
      action: () => onNavigate('resume')
    },
    {
      id: 2,
      title: "Skill Evaluation",
      description: "Assess your skills to match job requirements",
      icon: TrendingUp,
      color: "#00D9C0",
      action: () => onNavigate('evaluate')
    },
    {
      id: 3,
      title: "Learning Plan",
      description: "Get personalized training roadmap",
      icon: BookOpen,
      color: "#FD9644",
      action: () => onNavigate('plan')
    },
    {
      id: 4,
      title: "Practice Interview",
      description: "Test your knowledge with AI-powered practice",
      icon: PenTool,
      color: "#FD79A8",
      action: () => onNavigate('interview')
    }
  ];

  const recommendations = [
    {
      id: 1,
      title: "Complete Your Profile",
      description: "Add work experience to better job matches",
      progress: userData.profileScore,
      buttonText: "Complete Now",
      buttonType: "primary",
      action: () => onNavigate('resume')
    },
    {
      id: 2,
      title: "Take Skill Assessment",
      description: "Evaluate your JavaScript skills to unlock new opportunities",
      progress: 0,
      buttonText: "Start Assessment",
      buttonType: "secondary",
      action: () => onNavigate('evaluate')
    },
    {
      id: 3,
      title: "Practice Interview",
      description: "Prepare for your next interview with AI-powered practice",
      progress: 25,
      buttonText: "Continue",
      buttonType: "tertiary",
      action: () => onNavigate('interview')
    }
  ];

  const moreActions = [
    { id: 1, title: "Mock Interview", icon: Users, action: () => onNavigate('interview') },
    { id: 2, title: "Job Matching", icon: Briefcase, action: () => onNavigate('jobs') }
  ];

  return (
    <main className="main-content">
      {/* Welcome Card */}
      <div className="welcome-card">
        <div className="welcome-header">
          <div className="welcome-text">
            <h1>Welcome back, {userData.name}! 👋</h1>
            <p>Ready to advance your career today?</p>
          </div>
          <div className="user-profile">
            <div className="user-avatar">
              {userData.avatar}
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>{userData.name}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>{userData.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate('evaluate')}>
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' }}>
            <Target size={28} color="white" />
          </div>
          <div className="stat-value">{stats.skillsAssessed}</div>
          <div className="stat-label">Skills Assessed</div>
          <div className="stat-subtitle">+3 this week</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('progress')}>
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #00D9C0, #00B894)' }}>
            <Trophy size={28} color="white" />
          </div>
          <div className="stat-value">{stats.achievements}</div>
          <div className="stat-label">Achievements</div>
          <div className="stat-subtitle">New badge earned!</div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('resume')}>
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

        <div className="stat-card" onClick={() => onNavigate('plan')}>
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
                  onClick={action.action}
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
              <button className={`action-button ${rec.buttonType}`} onClick={rec.action}>
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
              <div
                key={action.id}
                className="activity-item"
                style={{ flex: '1', minWidth: '200px', cursor: 'pointer' }}
                onClick={action.action}
              >
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

      {/* Floating Action Button */}
      <button className="fab" onClick={() => onNavigate('interview')}>
        <MessageCircle size={28} />
      </button>
    </main>
  );
}

export default Dashboard;