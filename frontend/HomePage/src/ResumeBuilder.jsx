import React, { useState, useEffect } from 'react';
import {
  Upload, FileText, GraduationCap, Briefcase, FolderGit2,
  Award, CheckCircle, ArrowRight, ArrowLeft, Download,
  Plus, X, Moon, Sun, Home, Edit, Sparkles
} from 'lucide-react';
import './ResumeBuilder.css';

function ResumeBuilder({ isDarkMode, toggleDarkMode, onNavigateHome }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasResume, setHasResume] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeGenerated, setResumeGenerated] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    
    // Education
    education: [{
      degree: '',
      institution: '',
      year: '',
      gpa: ''
    }],
    
    // Experience
    experience: [{
      jobTitle: '',
      company: '',
      duration: '',
      description: ''
    }],
    
    // Projects
    projects: [{
      title: '',
      description: '',
      technologies: '',
      link: ''
    }],
    
    // Skills
    skills: ['']
  });

  const steps = [
    { id: 'personal', label: 'Personal Info', icon: FileText },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'generate', label: 'Generate', icon: Sparkles }
  ];

  const handleInputChange = (section, index, field, value) => {
    if (section === 'skills') {
      const newSkills = [...formData.skills];
      newSkills[index] = value;
      setFormData({ ...formData, skills: newSkills });
    } else if (Array.isArray(formData[section])) {
      const newSection = [...formData[section]];
      newSection[index] = { ...newSection[index], [field]: value };
      setFormData({ ...formData, [section]: newSection });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const addItem = (section) => {
    if (section === 'skills') {
      setFormData({ ...formData, skills: [...formData.skills, ''] });
    } else if (section === 'education') {
      setFormData({
        ...formData,
        education: [...formData.education, { degree: '', institution: '', year: '', gpa: '' }]
      });
    } else if (section === 'experience') {
      setFormData({
        ...formData,
        experience: [...formData.experience, { jobTitle: '', company: '', duration: '', description: '' }]
      });
    } else if (section === 'projects') {
      setFormData({
        ...formData,
        projects: [...formData.projects, { title: '', description: '', technologies: '', link: '' }]
      });
    }
  };

  const removeItem = (section, index) => {
    if (section === 'skills') {
      const newSkills = formData.skills.filter((_, i) => i !== index);
      setFormData({ ...formData, skills: newSkills.length ? newSkills : [''] });
    } else {
      const newSection = formData[section].filter((_, i) => i !== index);
      setFormData({ ...formData, [section]: newSection });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleGenerateResume = () => {
    setIsGenerating(true);
    // Simulate resume generation
    setTimeout(() => {
      setIsGenerating(false);
      setResumeGenerated(true);
    }, 2000);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Initial screen - Resume choice
  if (hasResume === null) {
    return (
      <div className="resume-builder-container">
        {/* Header */}
        <header className="resume-builder-header">
          <div className="header-content">
            <button className="home-button" onClick={onNavigateHome}>
              <Home size={20} />
              <span>Back to Dashboard</span>
            </button>
            <button className="theme-toggle" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <div className="resume-choice-screen">
          <div className="resume-choice-container">
            <div className="resume-icon">
              <FileText size={48} />
            </div>
            <h1>Let's Start Your Career Journey!</h1>
            <p>To provide you with the best career guidance, we need to understand your current profile.</p>
            
            <div className="resume-question">Do you have an existing resume?</div>
            
            <div className="resume-options">
              <div className="resume-option-card" onClick={() => setHasResume(true)}>
                <div className="option-icon success">
                  <CheckCircle size={32} />
                </div>
                <h3>Yes, I have one</h3>
                <p>Upload your existing resume for analysis</p>
              </div>
              
              <div className="resume-option-card" onClick={() => setHasResume(false)}>
                <div className="option-icon error">
                  <X size={32} />
                </div>
                <h3>No, I need help</h3>
                <p>Let our AI help you build a professional resume</p>
              </div>
            </div>
            
            <div className="info-box">
              <div className="info-icon">💡</div>
              <div>
                <strong>What happens next?</strong>
                <p>Choose an option above to see what happens next in your career journey.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Upload resume screen
  if (hasResume && !uploadedFile) {
    return (
      <div className="resume-builder-container">
        <header className="resume-builder-header">
          <div className="header-content">
            <button className="home-button" onClick={onNavigateHome}>
              <Home size={20} />
              <span>Back to Dashboard</span>
            </button>
            <button className="theme-toggle" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <div className="upload-screen">
          <div className="upload-container">
            <div className="upload-icon">
              <Upload size={48} />
            </div>
            <h1>Upload Your Resume</h1>
            <p>Upload your existing resume and let our AI analyze your skills, experience, and qualifications.</p>
            
            <div className="upload-dropzone">
              <Upload size={40} />
              <p className="upload-main-text">Drag & drop your resume here</p>
              <p className="upload-sub-text">or click to browse files</p>
              <p className="upload-formats">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="file-input"
              />
            </div>
            
            <div className="upload-actions">
              <button className="btn-secondary" onClick={() => setHasResume(null)}>
                <ArrowLeft size={20} />
                Back
              </button>
            </div>
            
            <div className="privacy-notice">
              <div className="privacy-icon">🔒</div>
              <div>
                <strong>Your Privacy Matters</strong>
                <p>Your resume is processed securely and used only for analysis. We extract skills, experience, and qualifications to provide personalized career guidance. Your data is never shared with third parties.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Resume generated screen
  if (resumeGenerated) {
    return (
      <div className="resume-builder-container">
        <header className="resume-builder-header">
          <div className="header-content">
            <button className="home-button" onClick={onNavigateHome}>
              <Home size={20} />
              <span>Back to Dashboard</span>
            </button>
            <button className="theme-toggle" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <div className="resume-ready-screen">
          <div className="resume-ready-container">
            <h1>Your Resume is Ready! 🎉</h1>
            <p>Review your resume and download it when you're satisfied</p>
            
            <div className="resume-preview">
              <div className="resume-preview-card">
                <div className="resume-header-preview">
                  <h2>{formData.firstName.toUpperCase()} {formData.lastName.toUpperCase()}</h2>
                  <p className="resume-title">Software Engineer</p>
                  <p className="resume-contact">{formData.email} • {formData.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="resume-actions-grid">
              <button className="btn-outline">
                <Edit size={20} />
                Change Template
              </button>
              <button className="btn-outline">
                <FileText size={20} />
                Print/Save as PDF
              </button>
              <button className="btn-primary">
                <Download size={20} />
                Download PDF
              </button>
            </div>
            
            <div className="resume-features">
              <h3>✨ Professional Resume Ready!</h3>
              <div className="features-grid">
                <div className="feature-item">
                  <CheckCircle size={20} color="#00B894" />
                  <div>
                    <strong>ATS-Optimized</strong>
                    <p>Your resume is formatted to pass Applicant Tracking Systems used by recruiters.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <CheckCircle size={20} color="#00B894" />
                  <div>
                    <strong>Professional Design</strong>
                    <p>Industry-standard template with clean typography and proper spacing.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <CheckCircle size={20} color="#00B894" />
                  <div>
                    <strong>Instant Download</strong>
                    <p>Click "Download PDF" to get your professionally formatted resume instantly.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bottom-actions">
              <button className="btn-outline-secondary" onClick={() => setResumeGenerated(false)}>
                <ArrowLeft size={20} />
                Edit Resume
              </button>
              <button className="btn-primary-large" onClick={onNavigateHome}>
                Continue Career Journey
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-step form
  return (
    <div className="resume-builder-container">
      {/* Header */}
      <header className="resume-builder-header">
        <div className="header-content">
          <button className="home-button" onClick={onNavigateHome}>
            <Home size={20} />
            <span>Back to Dashboard</span>
          </button>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="steps-container">
        <div className="steps-wrapper">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <React.Fragment key={step.id}>
                <div className={`step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                  <div className="step-number">
                    {isCompleted ? (
                      <CheckCircle size={20} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="step-label">
                    <StepIcon size={16} />
                    {step.label}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="form-container">
        {/* Personal Info */}
        {currentStep === 0 && (
          <div className="form-section">
            <div className="section-header">
              <FileText size={28} color="var(--primary)" />
              <h2>Personal Information</h2>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('personal', 0, 'firstName', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('personal', 0, 'lastName', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('personal', 0, 'email', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('personal', 0, 'phone', e.target.value)}
                />
              </div>
              
              <div className="form-group full-width">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="City, State, Country"
                  value={formData.location}
                  onChange={(e) => handleInputChange('personal', 0, 'location', e.target.value)}
                />
              </div>
              
              <div className="form-group full-width">
                <label>Professional Summary</label>
                <textarea
                  rows="4"
                  placeholder="Brief description of your professional background and career objectives..."
                  value={formData.summary}
                  onChange={(e) => handleInputChange('personal', 0, 'summary', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Education */}
        {currentStep === 1 && (
          <div className="form-section">
            <div className="section-header">
              <GraduationCap size={28} color="var(--primary)" />
              <h2>Education</h2>
            </div>
            
            {formData.education.map((edu, index) => (
              <div key={index} className="repeatable-section">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      placeholder="Bachelor of Science in Computer Science"
                      value={edu.degree}
                      onChange={(e) => handleInputChange('education', index, 'degree', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Institution</label>
                    <input
                      type="text"
                      placeholder="University Name"
                      value={edu.institution}
                      onChange={(e) => handleInputChange('education', index, 'institution', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Year</label>
                    <input
                      type="text"
                      placeholder="2020-2024"
                      value={edu.year}
                      onChange={(e) => handleInputChange('education', index, 'year', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>GPA (Optional)</label>
                    <input
                      type="text"
                      placeholder="3.8/4.0"
                      value={edu.gpa}
                      onChange={(e) => handleInputChange('education', index, 'gpa', e.target.value)}
                    />
                  </div>
                </div>
                
                {formData.education.length > 1 && (
                  <button
                    className="remove-button"
                    onClick={() => removeItem('education', index)}
                  >
                    <X size={16} />
                    Remove
                  </button>
                )}
              </div>
            ))}
            
            <button className="add-button" onClick={() => addItem('education')}>
              <Plus size={20} />
              Add Another Education
            </button>
          </div>
        )}

        {/* Experience */}
        {currentStep === 2 && (
          <div className="form-section">
            <div className="section-header">
              <Briefcase size={28} color="var(--primary)" />
              <h2>Work Experience</h2>
            </div>
            
            {formData.experience.map((exp, index) => (
              <div key={index} className="repeatable-section">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      placeholder="Software Developer"
                      value={exp.jobTitle}
                      onChange={(e) => handleInputChange('experience', index, 'jobTitle', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      placeholder="Tech Company Inc."
                      value={exp.company}
                      onChange={(e) => handleInputChange('experience', index, 'company', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Duration</label>
                    <input
                      type="text"
                      placeholder="Jan 2022 - Present"
                      value={exp.duration}
                      onChange={(e) => handleInputChange('experience', index, 'duration', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      rows="4"
                      placeholder="Describe your responsibilities and achievements..."
                      value={exp.description}
                      onChange={(e) => handleInputChange('experience', index, 'description', e.target.value)}
                    />
                  </div>
                </div>
                
                {formData.experience.length > 1 && (
                  <button
                    className="remove-button"
                    onClick={() => removeItem('experience', index)}
                  >
                    <X size={16} />
                    Remove
                  </button>
                )}
              </div>
            ))}
            
            <button className="add-button" onClick={() => addItem('experience')}>
              <Plus size={20} />
              Add Another Experience
            </button>
          </div>
        )}

        {/* Projects */}
        {currentStep === 3 && (
          <div className="form-section">
            <div className="section-header">
              <FolderGit2 size={28} color="var(--primary)" />
              <h2>Projects</h2>
            </div>
            
            {formData.projects.map((project, index) => (
              <div key={index} className="repeatable-section">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Project Title</label>
                    <input
                      type="text"
                      placeholder="E-Commerce Website"
                      value={project.title}
                      onChange={(e) => handleInputChange('projects', index, 'title', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      rows="3"
                      placeholder="Describe what the project does and your role in it..."
                      value={project.description}
                      onChange={(e) => handleInputChange('projects', index, 'description', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Technologies Used</label>
                    <input
                      type="text"
                      placeholder="React, Node.js, MongoDB"
                      value={project.technologies}
                      onChange={(e) => handleInputChange('projects', index, 'technologies', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Project Link (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username/project"
                      value={project.link}
                      onChange={(e) => handleInputChange('projects', index, 'link', e.target.value)}
                    />
                  </div>
                </div>
                
                {formData.projects.length > 1 && (
                  <button
                    className="remove-button"
                    onClick={() => removeItem('projects', index)}
                  >
                    <X size={16} />
                    Remove
                  </button>
                )}
              </div>
            ))}
            
            <button className="add-button" onClick={() => addItem('projects')}>
              <Plus size={20} />
              Add Another Project
            </button>
          </div>
        )}

        {/* Skills */}
        {currentStep === 4 && (
          <div className="form-section">
            <div className="section-header">
              <Award size={28} color="var(--primary)" />
              <h2>Skills</h2>
            </div>
            <p className="section-description">
              Add your technical and soft skills. These will help employers understand your capabilities.
            </p>
            
            <div className="skills-input-container">
              <input
                type="text"
                placeholder="e.g., JavaScript, Communication, Leadership"
                className="skills-main-input"
                value={formData.skills[formData.skills.length - 1]}
                onChange={(e) => handleInputChange('skills', formData.skills.length - 1, null, e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    addItem('skills');
                  }
                }}
              />
            </div>
            
            <div className="skills-tags">
              {formData.skills.filter(skill => skill.trim()).map((skill, index) => (
                <div key={index} className="skill-tag">
                  <span>{skill}</span>
                  <button onClick={() => removeItem('skills', index)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            <button className="add-button" onClick={() => addItem('skills')}>
              <Plus size={20} />
              Add Another Skill
            </button>
          </div>
        )}

        {/* Generate */}
        {currentStep === 5 && (
          <div className="form-section generate-section">
            <div className="section-header">
              <Sparkles size={28} color="var(--primary)" />
              <h2>Generate Your Resume</h2>
            </div>
            
            {!isGenerating ? (
              <div className="generate-content">
                <p className="generate-description">
                  You've completed all the steps! Click the button below to generate your professional resume.
                </p>
                
                <div className="generate-preview">
                  <h3>Resume Summary:</h3>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <FileText size={20} />
                      <div>
                        <strong>Personal Info</strong>
                        <p>{formData.firstName} {formData.lastName}</p>
                      </div>
                    </div>
                    <div className="summary-item">
                      <GraduationCap size={20} />
                      <div>
                        <strong>Education</strong>
                        <p>{formData.education.length} entries</p>
                      </div>
                    </div>
                    <div className="summary-item">
                      <Briefcase size={20} />
                      <div>
                        <strong>Experience</strong>
                        <p>{formData.experience.length} entries</p>
                      </div>
                    </div>
                    <div className="summary-item">
                      <FolderGit2 size={20} />
                      <div>
                        <strong>Projects</strong>
                        <p>{formData.projects.length} entries</p>
                      </div>
                    </div>
                    <div className="summary-item">
                      <Award size={20} />
                      <div>
                        <strong>Skills</strong>
                        <p>{formData.skills.filter(s => s.trim()).length} skills</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button className="generate-button" onClick={handleGenerateResume}>
                  <Sparkles size={24} />
                  Generate Resume
                  <ArrowRight size={20} />
                </button>
              </div>
            ) : (
              <div className="generating-content">
                <div className="loader"></div>
                <h3>Generating your resume...</h3>
                <p>Please wait while we create your professional resume</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          <button
            className="btn-secondary"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft size={20} />
            Previous
          </button>
          
          {currentStep < steps.length - 1 && (
            <button className="btn-primary" onClick={nextStep}>
              Next
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;