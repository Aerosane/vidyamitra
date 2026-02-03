import React, { useState } from 'react';
import {
  BookOpen, Play, Clock, CheckCircle, Calendar,
  Home, Moon, Sun, Award, TrendingUp, ExternalLink,
  Youtube, ArrowRight
} from 'lucide-react';
import './LearningPlan.css';

function LearningPlan({ userData, onBack, isDarkMode, toggleDarkMode }) {
  const [selectedWeek, setSelectedWeek] = useState(null);

  // Learning resources with YouTube links
  const learningResources = {
    'JavaScript': {
      title: 'JavaScript Tutorial Full Course - Beginner to Pro',
      videoId: 'PkZNo7MFNFg',
      channel: 'SuperSimpleDev',
      duration: '3.5 hours',
      level: 'Beginner',
      tasks: [
        'Study JavaScript fundamentals through interactive tutorials and documentation',
        'Complete 5-7 beginner-level JavaScript coding exercises on platforms like LeetCode/HackerRank',
        'Build a simple starter project implementing JavaScript concepts',
        'Document your learning journey, challenges faced and solutions found',
        'Watch at least 3 comprehensive video tutorials on JavaScript'
      ],
      topics: [
        'Understand core JavaScript concepts and principles',
        'Implement JavaScript in practical projects',
        'Master JavaScript best practices for Software Engineer',
        'Build confidence to use JavaScript in real-world scenarios'
      ]
    },
    'React': {
      title: 'React Course - Beginner\'s Tutorial for React JavaScript Library',
      videoId: 'bMknfKXIFA8',
      channel: 'freeCodeCamp',
      duration: '11.5 hours',
      level: 'Beginner',
      tasks: [
        'Study React fundamentals through interactive tutorials and documentation',
        'Complete 5-7 beginner-level React coding exercises',
        'Build a simple starter project implementing React concepts',
        'Document your learning journey, challenges faced and solutions found',
        'Watch at least 3 comprehensive video tutorials on React'
      ],
      topics: [
        'Understand core React concepts and principles',
        'Implement React in practical projects',
        'Master React best practices',
        'Build confidence to use React in real-world scenarios'
      ]
    },
    'Node.js': {
      title: 'Node.js Ultimate Beginner\'s Guide in 7 Easy Steps',
      videoId: 'ENrzD9HAZK4',
      channel: 'Fireship',
      duration: '3 hours',
      level: 'Beginner',
      tasks: [
        'Study Node.js fundamentals through interactive tutorials',
        'Complete 5-7 beginner-level Node.js coding exercises',
        'Build a simple starter project implementing Node.js concepts',
        'Document your learning journey',
        'Watch at least 3 comprehensive video tutorials on Node.js'
      ],
      topics: [
        'Understand core Node.js concepts',
        'Implement Node.js in practical projects',
        'Master Node.js best practices',
        'Build confidence to use Node.js in real-world scenarios'
      ]
    },
    'Python': {
      title: 'Python Full Course for Beginners [2025]',
      videoId: '_uQrJ0TkZlc',
      channel: 'Programming with Mosh',
      duration: '6.5 hours',
      level: 'Beginner',
      tasks: [
        'Study Python fundamentals through interactive tutorials',
        'Complete 5-7 beginner-level Python coding exercises',
        'Build a simple starter project implementing Python concepts',
        'Document your learning journey',
        'Watch at least 3 comprehensive video tutorials on Python'
      ],
      topics: [
        'Understand core Python concepts and principles',
        'Implement Python in practical projects',
        'Master Python best practices for Software Engineer',
        'Build confidence to use Python in real-world scenarios'
      ]
    }
  };

  // Generate 4-week learning plan based on missing skills
  const weeklySchedule = [
    {
      week: 1,
      skill: 'JavaScript',
      description: 'Master JavaScript to excel as a Software Engineer. This week focuses on beginner-level concepts essential for your target role.'
    },
    {
      week: 2,
      skill: 'React',
      description: 'Master React to excel as a Software Engineer. This week focuses on beginner-level concepts essential for your target role.'
    },
    {
      week: 3,
      skill: 'Node.js',
      description: 'Master Node.js to excel as a Software Engineer. This week focuses on beginner-level concepts essential for your target role.'
    },
    {
      week: 4,
      skill: 'Python',
      description: 'Master Python to excel as a Software Engineer. This week focuses on beginner-level concepts essential for your target role.'
    }
  ];

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

      <div className="learning-plan-container">
        {/* Header */}
        <div className="learning-plan-header">
          <div className="plan-icon">
            <Calendar size={48} />
          </div>
          <h1>4-Week Learning Journey</h1>
          <p>Structured plan with curated resources and practical exercises</p>
        </div>

        {/* Weekly Schedule Overview */}
        <div className="weekly-schedule-card">
          <div className="schedule-header">
            <BookOpen size={24} />
            <h2>Weekly Schedule</h2>
          </div>

          <div className="weeks-grid">
            {weeklySchedule.map(week => {
              const resource = learningResources[week.skill];
              return (
                <div 
                  key={week.week} 
                  className={`week-card ${selectedWeek === week.week ? 'selected' : ''}`}
                  onClick={() => setSelectedWeek(selectedWeek === week.week ? null : week.week)}
                >
                  <div className="week-header">
                    <div className="week-badge">W{week.week}</div>
                    <h3>{week.skill}</h3>
                  </div>
                  <p className="week-description">{week.description}</p>

                  {selectedWeek === week.week && (
                    <div className="week-details">
                      {/* Tasks Section */}
                      <div className="tasks-section">
                        <h4>📋 Tasks</h4>
                        <ul className="tasks-list">
                          {resource.tasks.map((task, idx) => (
                            <li key={idx}>
                              <CheckCircle size={16} />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Primary Learning Resource */}
                      <div className="primary-resource">
                        <div className="resource-header">
                          <Youtube size={20} color="#FF0000" />
                          <h4>Primary Learning Resource</h4>
                        </div>
                        
                        {/* YouTube Embed */}
                        <div className="youtube-container">
                          <iframe
                            width="100%"
                            height="315"
                            src={`https://www.youtube.com/embed/${resource.videoId}`}
                            title={resource.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>

                        <div className="resource-info">
                          <h5>{resource.title}</h5>
                          <div className="resource-meta">
                            <span className="resource-channel">📺 {resource.channel}</span>
                            <span className="resource-duration">⏱️ {resource.duration}</span>
                            <span className={`resource-level level-${resource.level.toLowerCase()}`}>
                              📚 {resource.level} Level
                            </span>
                          </div>
                          <a 
                            href={`https://www.youtube.com/watch?v=${resource.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="watch-on-youtube"
                          >
                            Watch on YouTube
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>

                      {/* What You'll Learn */}
                      <div className="learning-outcomes">
                        <h4>✨ What You'll Learn</h4>
                        <ul className="outcomes-list">
                          {resource.topics.map((topic, idx) => (
                            <li key={idx}>
                              <TrendingUp size={16} />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="additional-resources">
          <h2>
            <Award size={24} />
            Additional Learning Resources
          </h2>
          <div className="resources-grid">
            <div className="resource-card">
              <div className="resource-card-icon" style={{ background: '#6C5CE720', color: '#6C5CE7' }}>
                <BookOpen size={24} />
              </div>
              <h3>Online Documentation</h3>
              <p>Official documentation and guides for each technology</p>
              <ul className="resource-links">
                <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noopener noreferrer">MDN JavaScript Docs</a></li>
                <li><a href="https://react.dev" target="_blank" rel="noopener noreferrer">React Official Docs</a></li>
                <li><a href="https://nodejs.org/docs" target="_blank" rel="noopener noreferrer">Node.js Documentation</a></li>
              </ul>
            </div>

            <div className="resource-card">
              <div className="resource-card-icon" style={{ background: '#00D9C020', color: '#00D9C0' }}>
                <TrendingUp size={24} />
              </div>
              <h3>Practice Platforms</h3>
              <p>Coding challenges and exercises to practice your skills</p>
              <ul className="resource-links">
                <li><a href="https://leetcode.com" target="_blank" rel="noopener noreferrer">LeetCode</a></li>
                <li><a href="https://hackerrank.com" target="_blank" rel="noopener noreferrer">HackerRank</a></li>
                <li><a href="https://codewars.com" target="_blank" rel="noopener noreferrer">Codewars</a></li>
              </ul>
            </div>

            <div className="resource-card">
              <div className="resource-card-icon" style={{ background: '#FD964420', color: '#FD9644' }}>
                <Youtube size={24} />
              </div>
              <h3>Video Tutorials</h3>
              <p>Comprehensive video courses and tutorials</p>
              <ul className="resource-links">
                <li><a href="https://www.youtube.com/@freecodecamp" target="_blank" rel="noopener noreferrer">freeCodeCamp</a></li>
                <li><a href="https://www.youtube.com/@TraversyMedia" target="_blank" rel="noopener noreferrer">Traversy Media</a></li>
                <li><a href="https://www.youtube.com/@WebDevSimplified" target="_blank" rel="noopener noreferrer">Web Dev Simplified</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="plan-cta">
          <h2>Ready to Start Your Learning Journey?</h2>
          <p>Follow the weekly schedule and complete all tasks to achieve your career goals</p>
          <button className="btn-primary-large" onClick={() => setSelectedWeek(1)}>
            <Play size={20} />
            Start Week 1
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LearningPlan;