import React, { useState } from 'react';
import {
  Upload, FileText, Target, TrendingUp, CheckCircle,
  AlertCircle, ArrowRight, Home, Moon, Sun, Lightbulb,
  Award, BookOpen, X
} from 'lucide-react';

import './EvaluateResume.css';

function EvaluateResume({ userData, onBack, isDarkMode, toggleDarkMode }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Job Description, 3: Results

  const skillsDatabase = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'MongoDB',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'Java', 'C++', 
    'TypeScript', 'Angular', 'Vue', 'Machine Learning', 
    'Data Science', 'DevOps', 'Leadership', 'Communication',
    'Problem Solving', 'Team Management', 'Agile', 'Scrum',
    'REST API', 'GraphQL', 'HTML', 'CSS', 'Redux', 'Express',
    'PostgreSQL', 'Firebase', 'CI/CD', 'Jest', 'Testing',
    'System Design', 'Algorithms', 'Data Structures'
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      
      // Read file content (simplified - in production, use proper PDF/DOCX parsers)
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  };

  const extractSkills = (text) => {
    const foundSkills = [];
    const lowerText = text.toLowerCase();
    
    skillsDatabase.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });
    
    return [...new Set(foundSkills)];
  };

  const analyzeMatch = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      // Extract skills from resume
      const resumeSkills = extractSkills(resumeText + ' ' + userData.skills.join(' '));
      
      // Extract required skills from job description
      const requiredSkills = extractSkills(jobDescription);
      
      // Find matched skills
      const matchedSkills = resumeSkills.filter(skill =>
        requiredSkills.some(req =>
          req.toLowerCase() === skill.toLowerCase() ||
          req.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(req.toLowerCase())
        )
      );
      
      // Find missing skills
      const missingSkills = requiredSkills.filter(skill =>
        !matchedSkills.some(matched => 
          matched.toLowerCase() === skill.toLowerCase() ||
          matched.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(matched.toLowerCase())
        )
      );
      
      // Calculate match percentage
      const matchPercentage = requiredSkills.length > 0
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : 0;
      
      // Generate recommendations
      const recommendations = [
        {
          id: 1,
          text: `Learn these key skills: ${missingSkills.slice(0, 3).join(', ')}`,
          icon: BookOpen,
          color: '#6C5CE7'
        },
        {
          id: 2,
          text: 'Complete online courses to improve skills alignment',
          icon: Award,
          color: '#00D9C0'
        },
        {
          id: 3,
          text: 'Practice with mock interviews to boost confidence',
          icon: Target,
          color: '#FD9644'
        },
        {
          id: 4,
          text: 'Build projects showcasing the required skills',
          icon: Lightbulb,
          color: '#FD79A8'
        }
      ];
      
      setAnalysis({
        matchPercentage,
        matchedSkills,
        missingSkills,
        recommendations,
        resumeSkills
      });
      
      setIsAnalyzing(false);
      setStep(3);
    }, 2000);
  };

  const handleStartOver = () => {
    setResumeFile(null);
    setResumeText('');
    setJobDescription('');
    setAnalysis(null);
    setStep(1);
  };

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

      <div className="evaluate-container">
        {/* Step 1: Upload Resume */}
        {step === 1 && (
          <div className="evaluate-section">
            <div className="evaluate-header">
              <div className="evaluate-icon">
                <Target size={48} />
              </div>
              <h1>Evaluate Your Resume</h1>
              <p>Upload your resume and compare it against job descriptions to find the perfect match</p>
            </div>

            <div className="upload-card">
              <h2>
                <Upload size={24} />
                Upload Your Resume
              </h2>
              <p>Upload your resume to analyze your skills and experience</p>
              
              <div className="upload-dropzone-evaluate">
                {!resumeFile ? (
                  <>
                    <Upload size={40} />
                    <p className="upload-main-text">Drag & drop your resume here</p>
                    <p className="upload-sub-text">or click to browse files</p>
                    <p className="upload-formats">PDF, DOC, DOCX (Max 5MB)</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="file-input"
                    />
                  </>
                ) : (
                  <div className="file-uploaded">
                    <CheckCircle size={48} color="#00B894" />
                    <p className="file-name">{resumeFile.name}</p>
                    <button className="btn-secondary-small" onClick={() => setResumeFile(null)}>
                      <X size={16} />
                      Remove
                    </button>
                  </div>
                )}
              </div>
              
              {resumeFile && (
                <button className="btn-primary-large" onClick={() => setStep(2)}>
                  Continue to Job Description
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Job Description */}
        {step === 2 && (
          <div className="evaluate-section">
            <div className="evaluate-header">
              <div className="evaluate-icon">
                <FileText size={48} />
              </div>
              <h1>Paste Job Description</h1>
              <p>Add the job description you're targeting to compare with your resume</p>
            </div>

            <div className="job-description-card">
              <h2>
                <FileText size={24} />
                Job Description
              </h2>
              <p>Paste the complete job description including required skills and qualifications</p>
              
              <textarea
                className="job-description-input"
                rows="15"
                placeholder="Paste the job description here...

Example:
We are looking for a skilled Software Engineer with experience in:
- JavaScript, React, Node.js
- 3+ years of experience
- Strong problem-solving skills
- Experience with cloud platforms (AWS, Azure)
- Excellent communication skills"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              
              <div className="button-group">
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  Back
                </button>
                <button 
                  className="btn-primary-large" 
                  onClick={analyzeMatch}
                  disabled={!jobDescription.trim()}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Match'}
                  <TrendingUp size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && analysis && (
          <div className="evaluate-section">
            <div className="evaluate-header">
              <div className="evaluate-icon">
                <TrendingUp size={48} />
              </div>
              <h1>Eligibility Check Complete</h1>
              <p>Here's how your resume matches the job requirements</p>
            </div>

            {/* Match Score */}
            <div className="match-score-card">
              <h2>Skills Match Score</h2>
              <div className="match-percentage">
                <span className="percentage-number">{analysis.matchPercentage}%</span>
              </div>
              <p className="match-subtitle">
                {analysis.matchedSkills.length} out of {analysis.matchedSkills.length + analysis.missingSkills.length} required skills matched
              </p>
              <div className="progress-bar-evaluate">
                <div 
                  className="progress-fill-evaluate" 
                  style={{ 
                    width: `${analysis.matchPercentage}%`,
                    background: analysis.matchPercentage >= 70 ? '#00B894' : 
                               analysis.matchPercentage >= 40 ? '#FDCB6E' : '#FD79A8'
                  }}
                />
              </div>
            </div>

            {/* Skills Breakdown */}
            <div className="skills-breakdown">
              <div className="skills-column">
                <div className="skills-column-header">
                  <CheckCircle size={24} color="#00B894" />
                  <h3>Your Strengths</h3>
                </div>
                <div className="skills-list">
                  {analysis.matchedSkills.length > 0 ? (
                    analysis.matchedSkills.map((skill, index) => (
                      <div key={index} className="skill-item matched">
                        <CheckCircle size={16} color="#00B894" />
                        <span>{skill}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-skills">No matching skills found</p>
                  )}
                </div>
              </div>

              <div className="skills-column">
                <div className="skills-column-header">
                  <AlertCircle size={24} color="#FD9644" />
                  <h3>Skills to Develop</h3>
                </div>
                <div className="skills-list">
                  {analysis.missingSkills.length > 0 ? (
                    analysis.missingSkills.map((skill, index) => (
                      <div key={index} className="skill-item missing">
                        <AlertCircle size={16} color="#FD9644" />
                        <span>{skill}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-skills">You have all required skills! 🎉</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="recommendations-card">
              <h2>
                <Lightbulb size={24} />
                Personalized Recommendations
              </h2>
              <div className="recommendations-list">
                {analysis.recommendations.map(rec => {
                  const IconComponent = rec.icon;
                  return (
                    <div key={rec.id} className="recommendation-item">
                      <div className="recommendation-icon" style={{ background: `${rec.color}20`, color: rec.color }}>
                        <IconComponent size={20} />
                      </div>
                      <span>{rec.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="results-actions">
              <button className="btn-secondary-large" onClick={handleStartOver}>
                Evaluate Another Resume
              </button>
              <button className="btn-primary-large" onClick={() => window.location.href = '#/plan'}>
                Create Learning Plan
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EvaluateResume;