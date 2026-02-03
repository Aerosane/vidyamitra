import React, { useState } from 'react';
import {
  Briefcase, MapPin, Clock, DollarSign, Search,
  Home, Moon, Sun, Filter, ExternalLink, TrendingUp,
  Award, CheckCircle
} from 'lucide-react';

function JobOpportunities({ userData, onBack, isDarkMode, toggleDarkMode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');

  const locations = [
    'Nationwide', 'Remote', 'Bangalore', 'Mumbai', 'Delhi NCR',
    'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Noida'
  ];

  const jobTypes = ['All Types', 'Full-time', 'Part-time', 'Contract', 'Internship'];

  const jobListings = [
    {
      id: 1,
      title: 'Python Tutor',
      company: 'Coding Academy',
      location: 'Remote',
      type: 'Part-time',
      salary: '₹20,000 - ₹30,000',
      posted: '2 days ago',
      skills: ['Python', 'Teaching'],
      description: 'Teach Python programming online to students...',
      urgent: false
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      company: 'Tech Startup Inc',
      location: 'Bangalore',
      type: 'Full-time',
      salary: '₹8L - ₹12L',
      posted: '1 week ago',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      description: 'Build scalable web applications using modern tech stack...',
      urgent: true
    },
    {
      id: 3,
      title: 'Senior Backend Engineer',
      company: 'InnovateTech',
      location: 'Hyderabad',
      type: 'Full-time',
      salary: '₹15L - ₹20L',
      posted: '3 days ago',
      skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
      description: 'Design distributed systems and microservices...',
      urgent: true
    },
    {
      id: 4,
      title: 'Frontend Developer',
      company: 'WebCraft Solutions',
      location: 'Remote',
      type: 'Full-time',
      salary: '₹6L - ₹9L',
      posted: '5 days ago',
      skills: ['React', 'TypeScript', 'CSS'],
      description: 'Create user interfaces with React and modern CSS...',
      urgent: false
    },
    {
      id: 5,
      title: 'Frontend Consultant',
      company: 'Freelance Corp',
      location: 'Mumbai',
      type: 'Contract',
      salary: '₹1,200/hour',
      posted: '1 week ago',
      skills: ['React', 'JavaScript', 'HTML/CSS'],
      description: 'Short-term frontend development consulting...',
      urgent: false
    },
    {
      id: 6,
      title: 'Data Science Contractor',
      company: 'Analytics Hub',
      location: 'Bangalore',
      type: 'Contract',
      salary: '₹80,000/month',
      posted: '4 days ago',
      skills: ['Python', 'Machine Learning', 'SQL'],
      description: 'Analyze data and build predictive models...',
      urgent: false
    },
    {
      id: 7,
      title: 'Contract Python Developer',
      company: 'TempWork Inc',
      location: 'Remote',
      type: 'Contract',
      salary: '₹50,000 - ₹70,000',
      posted: '2 weeks ago',
      skills: ['Python', 'Flask', 'Docker'],
      description: 'Backend development for contract period...',
      urgent: false
    }
  ];

  // Filter jobs
  const filteredJobs = jobListings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = !locationFilter || locationFilter === 'Nationwide' || 
                           job.location === locationFilter;
    
    const matchesType = selectedType === 'All Types' || job.type === selectedType;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  // Calculate skill match
  const calculateMatch = (jobSkills) => {
    const userSkills = userData.skills.map(s => s.toLowerCase());
    const matched = jobSkills.filter(skill => 
      userSkills.some(us => 
        us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us)
      )
    );
    return Math.round((matched.length / jobSkills.length) * 100);
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

      <div className="jobs-container">
        {/* Header */}
        <div className="jobs-header">
          <div className="jobs-icon">
            <Briefcase size={48} />
          </div>
          <h1>Job Opportunities</h1>
          <p>Find jobs matching your skills and experience from Naukri and LinkedIn</p>
        </div>

        {/* Search and Filters */}
        <div className="jobs-search-section">
          <div className="search-bar-jobs">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search job roles, skills, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-jobs"
            />
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label>
                <MapPin size={16} />
                Location
              </label>
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <Briefcase size={16} />
                Job Type
              </label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="jobs-results">
          <div className="results-header-jobs">
            <h2>Found {filteredJobs.length} Jobs</h2>
            <p>Matching skills: {userData.skills.join(', ')}</p>
          </div>

          <div className="jobs-grid">
            {filteredJobs.map(job => {
              const matchPercentage = calculateMatch(job.skills);
              return (
                <div key={job.id} className="job-card">
                  {job.urgent && <div className="urgent-badge">🔥 Urgent</div>}
                  
                  <div className="job-card-header">
                    <h3>{job.title}</h3>
                    <div className="company-info">
                      <Briefcase size={16} />
                      {job.company}
                    </div>
                  </div>

                  <div className="job-meta">
                    <span className="job-meta-item">
                      <MapPin size={14} />
                      {job.location}
                    </span>
                    <span className="job-meta-item">
                      <Clock size={14} />
                      {job.type}
                    </span>
                    <span className="job-meta-item">
                      <DollarSign size={14} />
                      {job.salary}
                    </span>
                  </div>

                  <p className="job-description">{job.description}</p>

                  <div className="job-skills">
                    {job.skills.map((skill, idx) => {
                      const hasSkill = userData.skills.some(us => 
                        us.toLowerCase() === skill.toLowerCase()
                      );
                      return (
                        <span 
                          key={idx} 
                          className={`skill-tag-job ${hasSkill ? 'matched' : ''}`}
                        >
                          {hasSkill && <CheckCircle size={12} />}
                          {skill}
                        </span>
                      );
                    })}
                  </div>

                  <div className="job-footer">
                    <div className="match-indicator">
                      <TrendingUp size={16} />
                      <span className="match-text">{matchPercentage}% Match</span>
                    </div>
                    <button className="apply-button">
                      Apply Now
                      <ExternalLink size={16} />
                    </button>
                  </div>

                  <div className="job-posted">Posted {job.posted}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobOpportunities;