import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Target, Trophy, TrendingUp, Briefcase,
  BookOpen, Users, PenTool, CheckCircle, Calendar,
  ArrowRight, X, Play, Award, Clock, Zap, Star,
  MessageCircle, Bell, Settings, LogOut, Menu, Home,
  FileText, BarChart, Plus, Moon, Sun, Upload, Download
} from 'lucide-react';

// Import all page components
import Dashboard from './Dashboard.jsx';
import ResumeBuilder from './ResumeBuilder.jsx';
import EvaluateResume from './EvaluateResume.jsx';
import LearningPlan from './LearningPlan.jsx';
import MockInterview from './MockInterview.jsx';
import JobOpportunities from './JobOpportunities.jsx';
import ProgressTracker from './ProgressTracker.jsx';

import './index.css'; 
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Set to true for now, will add auth later
  
  // User data (will be fetched from backend in production)
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john@gmail.com",
    avatar: "JD",
    profileScore: 85,
    skillsAssessed: 12,
    achievements: 8,
    streakDays: 15,
    resumeAnalyzed: true,
    selectedDomain: "Information Technology",
    selectedRole: "Software Engineer",
    skills: ["JavaScript", "React", "Python", "Node.js"],
    quizHistory: [
      { date: "Nov 7, 2025", topic: "JavaScript", difficulty: "Easy", score: 60 },
      { date: "Nov 6, 2025", topic: "JavaScript", difficulty: "Hard", score: 33 },
      { date: "Nov 6, 2025", topic: "R", difficulty: "Easy", score: 0 },
      { date: "Nov 6, 2025", topic: "Python", difficulty: "Easy", score: 20 },
    ],
    interviewHistory: [
      { role: "Software Engineer", date: "Nov 4, 2025", score: 5, rounds: ["TECHNICAL"] },
      { role: "AI Developer", date: "Nov 4, 2025", score: 4, rounds: ["TECHNICAL"] },
    ]
  });

  // Load theme preference
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

  const navigationItems = [
    { name: 'Dashboard', icon: Home, page: 'dashboard' },
    { name: 'Resume', icon: FileText, page: 'resume' },
    { name: 'Evaluate', icon: Target, page: 'evaluate' },
    { name: 'Plan', icon: Calendar, page: 'plan' },
    { name: 'Interview', icon: Users, page: 'interview' },
    { name: 'Jobs', icon: Briefcase, page: 'jobs' },
    { name: 'Progress', icon: BarChart, page: 'progress' },
  ];

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            userData={userData}
            onNavigate={handleNavigation}
          />
        );
      case 'resume':
        return (
          <ResumeBuilder
            userData={userData}
            onBack={() => handleNavigation('dashboard')}
          />
        );
      case 'evaluate':
        return (
          <EvaluateResume
            userData={userData}
            onBack={() => handleNavigation('dashboard')}
          />
        );
      case 'plan':
        return (
          <LearningPlan
            userData={userData}
            onBack={() => handleNavigation('dashboard')}
          />
        );
      case 'interview':
        return (
          <MockInterview
            userData={userData}
            onBack={() => handleNavigation('dashboard')}
          />
        );
      case 'jobs':
        return (
          <JobOpportunities
            userData={userData}
            onBack={() => handleNavigation('dashboard')}
          />
        );
      case 'progress':
        return (
          <ProgressTracker
            userData={userData}
            onBack={() => handleNavigation('dashboard')}
          />
        );
      default:
        return (
          <Dashboard
            userData={userData}
            onNavigate={handleNavigation}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo" onClick={() => handleNavigation('dashboard')}>
          <div className="logo-icon">
            <GraduationCap size={20} />
          </div>
          VidyaMitra
        </div>
        
        <div className="nav-right">
          <div className="nav-menu">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.name}
                  className={`nav-item ${currentPage === item.page ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.page)}
                >
                  <IconComponent size={16} />
                  <span>{item.name}</span>
                </div>
              );
            })}
          </div>
          
          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {/* User Menu */}
          <div className="user-menu">
            <div className="user-avatar-small">{userData.avatar}</div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="page-content">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;