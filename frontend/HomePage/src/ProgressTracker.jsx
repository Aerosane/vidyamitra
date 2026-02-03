import React, { useState } from 'react';
import {
  BarChart as BarChartIcon, Trophy, Target, TrendingUp,
  Home, Moon, Sun, Award, Calendar, CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ProgressTracker({ userData, onBack, isDarkMode, toggleDarkMode }) {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Quiz performance data
  const quizData = userData.quizHistory.map(quiz => ({
    date: quiz.date.split(',')[0],
    score: quiz.score,
    topic: quiz.topic
  }));

  // Calculate averages
  const avgQuizScore = Math.round(
    userData.quizHistory.reduce((acc, quiz) => acc + quiz.score, 0) / userData.quizHistory.length
  );

  const avgInterviewScore = userData.interviewHistory.length > 0
    ? Math.round(
        userData.interviewHistory.reduce((acc, interview) => acc + interview.score, 0) / 
        userData.interviewHistory.length
      )
    : 0;

  const quizzesTaken = userData.quizHistory.length;
  const interviewsPassed = userData.interviewHistory.filter(i => i.score >= 5).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-button" onClick={onBack}>
          <Home size={20} />
          Back to Dashboard
        </button>
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="progress-container">
        {/* Header */}
        <div className="progress-header">
          <div className="progress-icon">
            <BarChartIcon size={48} />
          </div>
          <h1>Your Learning Progress</h1>
          <p>Track your growth and achievements across all activities</p>
        </div>

        {/* Stats Overview */}
        <div className="progress-stats-grid">
          <div className="progress-stat-card">
            <div className="stat-card-icon" style={{ background: '#6C5CE720', color: '#6C5CE7' }}>
              <Target size={28} />
            </div>
            <div className="stat-card-content">
              <h3>Quiz Performance</h3>
              <div className="stat-value-large">{avgQuizScore}%</div>
              <p className="stat-subtitle">Average Score</p>
              <p className="stat-detail">{quizzesTaken} out of 8 quizzes passed</p>
            </div>
          </div>

          <div className="progress-stat-card">
            <div className="stat-card-icon" style={{ background: '#FD964420', color: '#FD9644' }}>
              <Trophy size={28} />
            </div>
            <div className="stat-card-content">
              <h3>Quizzes Taken</h3>
              <div className="stat-value-large">{quizzesTaken}</div>
              <p className="stat-subtitle">Total attempts</p>
              <p className="stat-detail">Keep learning!</p>
            </div>
          </div>

          <div className="progress-stat-card">
            <div className="stat-card-icon" style={{ background: '#00D9C020', color: '#00D9C0' }}>
              <Award size={28} />
            </div>
            <div className="stat-card-content">
              <h3>Interview Score</h3>
              <div className="stat-value-large">{avgInterviewScore}%</div>
              <p className="stat-subtitle">Average Score</p>
              <p className="stat-detail">{interviewsPassed} out of {userData.interviewHistory.length} interviews passed</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="progress-tabs">
          <button 
            className={`tab-button ${selectedTab === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedTab('overview')}
          >
            <BarChartIcon size={20} />
            Overview
          </button>
          <button 
            className={`tab-button ${selectedTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setSelectedTab('quizzes')}
          >
            <Target size={20} />
            Quiz History
          </button>
          <button 
            className={`tab-button ${selectedTab === 'interviews' ? 'active' : ''}`}
            onClick={() => setSelectedTab('interviews')}
          >
            <Award size={20} />
            Interview History
          </button>
        </div>

        {/* Tab Content */}
        <div className="progress-content">
          {selectedTab === 'overview' && (
            <div className="overview-section">
              <div className="chart-card">
                <h2>
                  <TrendingUp size={24} />
                  Quiz Performance Trend
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={quizData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#eee'} />
                    <XAxis dataKey="date" stroke={isDarkMode ? '#fff' : '#333'} />
                    <YAxis stroke={isDarkMode ? '#fff' : '#333'} />
                    <Tooltip 
                      contentStyle={{ 
                        background: isDarkMode ? '#1a1a2e' : '#fff',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#6C5CE7" 
                      strokeWidth={3}
                      dot={{ fill: '#6C5CE7', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="achievements-card">
                <h2>
                  <Trophy size={24} />
                  Recent Achievements
                </h2>
                <div className="achievements-list">
                  <div className="achievement-item">
                    <CheckCircle size={20} color="#00B894" />
                    <div>
                      <h4>Profile Builder Badge</h4>
                      <p>Completed your professional profile</p>
                    </div>
                  </div>
                  <div className="achievement-item">
                    <CheckCircle size={20} color="#00B894" />
                    <div>
                      <h4>Quiz Master</h4>
                      <p>Passed 5 quizzes successfully</p>
                    </div>
                  </div>
                  <div className="achievement-item">
                    <CheckCircle size={20} color="#00B894" />
                    <div>
                      <h4>Interview Pro</h4>
                      <p>Completed first mock interview</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'quizzes' && (
            <div className="history-section">
              <h2>Quiz History</h2>
              <div className="history-table">
                <div className="table-header">
                  <span>Date</span>
                  <span>Topic</span>
                  <span>Difficulty</span>
                  <span>Score</span>
                  <span>Result</span>
                </div>
                {userData.quizHistory.map((quiz, index) => (
                  <div key={index} className="table-row">
                    <span>{quiz.date}</span>
                    <span>{quiz.topic}</span>
                    <span>
                      <span className={`difficulty-badge ${quiz.difficulty.toLowerCase()}`}>
                        {quiz.difficulty}
                      </span>
                    </span>
                    <span className="score-cell">{quiz.score}%</span>
                    <span>
                      <button className="review-button">Review</button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'interviews' && (
            <div className="history-section">
              <h2>Interview Practice History</h2>
              {userData.interviewHistory.map((interview, index) => (
                <div key={index} className="interview-history-card">
                  <div className="interview-history-header">
                    <h3>{interview.role}</h3>
                    <span className="interview-score">{interview.score}%</span>
                  </div>
                  <div className="interview-history-meta">
                    <span>
                      <Calendar size={14} />
                      {interview.date}
                    </span>
                    <span>{interview.rounds.join(', ')}</span>
                  </div>
                  <div className="interview-rounds">
                    {interview.rounds.map((round, idx) => (
                      <span key={idx} className="round-badge">
                        {round}
                      </span>
                    ))}
                  </div>
                  <button className="review-button-large">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressTracker;