"use client"

import React, { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

function ResumeAnalyser() {
  const { isLoaded, isSignedIn, user } = useUser();

  // Add loading state for Clerk authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading authentication...</div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('analyze');
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pdfParsing, setPdfParsing] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse PDF file to text
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }

    setPdfParsing(true);
    setError('');
    setPdfFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      const cleaned = fullText.trim();
      if (!cleaned) {
        setError('Could not extract text from PDF. It may be image-based — try pasting text manually.');
      } else {
        setResumeText(cleaned);
      }
    } catch (err: any) {
      setError(`Failed to parse PDF: ${err.message}`);
    } finally {
      setPdfParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Get user ID from Clerk - prioritize username
  const getUserId = () => {
    if (!user) return null;
    return user.username || user.primaryEmailAddress?.emailAddress || user.id;
  };

  const userId = getUserId();

  // Complete structured data state matching API schema
  const [structuredData, setStructuredData] = useState({
    personal_info: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: ''
    },
    summary: '',
    experience: [
      {
        title: '',
        company: '',
        duration: '',
        highlights: ['']
      }
    ],
    education: [
      {
        degree: '',
        institution: '',
        year: ''
      }
    ],
    skills: [''],
    certifications: [''],
    target_role: ''
  });

  const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/webhook/resume`;

  // Copy to clipboard function with fallback
  const handleCopyToClipboard = async () => {
    try {
      // Modern Clipboard API (preferred)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(result.resume || result.enhanced?.enhanced_resume || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      // Fallback for older browsers
      else {
        const textArea = document.createElement('textarea');
        textArea.value = result.resume || result.enhanced?.enhanced_resume || '';
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } else {
            alert('❌ Failed to copy. Please copy manually.');
          }
        } catch (err) {
          console.error('Fallback copy failed:', err);
          alert('❌ Failed to copy. Please select and copy manually.');
        }

        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Clipboard error:', err);
      alert('❌ Could not access clipboard. Please copy manually.');
    }
  };

  const resumeContentRef = useRef<HTMLDivElement>(null);

  // Strip markdown code fences from LLM response
  const cleanMarkdown = (text: string) => {
    return text.replace(/^```(?:markdown)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  };

  const handleExportPdf = () => {
    const el = resumeContentRef.current;
    if (!el) return;
    // Clone element so we don't mutate the visible DOM
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.cssText = 'position:fixed;left:-9999px;top:0;background:white;color:#111;padding:32px;width:800px;';
    clone.querySelectorAll('h1, h2, h3, h4').forEach((h) => {
      (h as HTMLElement).style.color = '#111';
    });
    clone.querySelectorAll('p, li, span').forEach((p) => {
      (p as HTMLElement).style.color = '#333';
    });
    clone.querySelectorAll('strong, b').forEach((b) => {
      (b as HTMLElement).style.color = '#111';
    });
    clone.querySelectorAll('hr').forEach((hr) => {
      (hr as HTMLElement).style.borderColor = '#ccc';
    });
    document.body.appendChild(clone);
    const opt = {
      margin: [12, 12, 12, 12],
      filename: `resume-${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(clone).toPdf().save().then(() => {
      document.body.removeChild(clone);
    });
  };

  const handleAnalyze = async () => {
    if (!isSignedIn) {
      setError("Please sign in to use this feature");
      return;
    }

    if (!resumeText.trim() || !targetRole.trim()) {
      setError("Please fill in both resume text and target role");
      return;
    }

    if (!userId) {
      setError("Unable to identify user");
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const payload = {
      user_id: userId,
      data: {
        resume_text: resumeText,
        target_role: targetRole
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleEnhance = async () => {
    if (!isSignedIn) {
      setError("Please sign in to use this feature");
      return;
    }

    if (!resumeText.trim() || !targetRole.trim()) {
      setError("Please fill in both resume text and target role");
      return;
    }

    if (!userId) {
      setError("Unable to identify user");
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const payload = {
      user_id: userId,
      data: {
        resume_text: resumeText,
        target_role: targetRole
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during enhancement');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!isSignedIn) {
      setError("Please sign in to use this feature");
      return;
    }

    if (!structuredData.target_role.trim()) {
      setError("Please specify a target role");
      return;
    }

    if (!userId) {
      setError("Unable to identify user");
      return;
    }

    // Validate required fields
    if (!structuredData.personal_info.name.trim() || !structuredData.personal_info.email.trim()) {
      setError("Please fill in at least name and email");
      return;
    }

    // Clean empty values from arrays before sending
    const cleanedData = {
      ...structuredData,
      experience: structuredData.experience
        .filter(exp => exp.title.trim() || exp.company.trim())
        .map(exp => ({
          ...exp,
          highlights: exp.highlights.filter(h => h.trim())
        })),
      education: structuredData.education
        .filter(edu => edu.degree.trim() || edu.institution.trim()),
      skills: structuredData.skills.filter(skill => skill.trim()),
      certifications: structuredData.certifications.filter(cert => cert.trim())
    };

    setLoading(true);
    setError('');
    setResult(null);

    const payload = {
      user_id: userId,
      data: cleanedData
    };

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during generation');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to update structured data
  const updatePersonalInfo = (field, value) => {
    setStructuredData({
      ...structuredData,
      personal_info: {
        ...structuredData.personal_info,
        [field]: value
      }
    });
  };

  const updateExperience = (index, field, value) => {
    const newExperience = [...structuredData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setStructuredData({ ...structuredData, experience: newExperience });
  };

  const updateExperienceHighlight = (expIndex, highlightIndex, value) => {
    const newExperience = [...structuredData.experience];
    const newHighlights = [...newExperience[expIndex].highlights];
    newHighlights[highlightIndex] = value;
    newExperience[expIndex].highlights = newHighlights;
    setStructuredData({ ...structuredData, experience: newExperience });
  };

  const addExperience = () => {
    setStructuredData({
      ...structuredData,
      experience: [
        ...structuredData.experience,
        { title: '', company: '', duration: '', highlights: [''] }
      ]
    });
  };

  const removeExperience = (index) => {
    const newExperience = [...structuredData.experience];
    newExperience.splice(index, 1);
    setStructuredData({ ...structuredData, experience: newExperience });
  };

  const addExperienceHighlight = (expIndex) => {
    const newExperience = [...structuredData.experience];
    newExperience[expIndex].highlights.push('');
    setStructuredData({ ...structuredData, experience: newExperience });
  };

  const removeExperienceHighlight = (expIndex, highlightIndex) => {
    const newExperience = [...structuredData.experience];
    const newHighlights = [...newExperience[expIndex].highlights];
    newHighlights.splice(highlightIndex, 1);
    newExperience[expIndex].highlights = newHighlights;
    setStructuredData({ ...structuredData, experience: newExperience });
  };

  const updateEducation = (index, field, value) => {
    const newEducation = [...structuredData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setStructuredData({ ...structuredData, education: newEducation });
  };

  const addEducation = () => {
    setStructuredData({
      ...structuredData,
      education: [
        ...structuredData.education,
        { degree: '', institution: '', year: '' }
      ]
    });
  };

  const removeEducation = (index) => {
    const newEducation = [...structuredData.education];
    newEducation.splice(index, 1);
    setStructuredData({ ...structuredData, education: newEducation });
  };

  const addSkill = () => {
    setStructuredData({
      ...structuredData,
      skills: [...structuredData.skills, '']
    });
  };

  const updateSkill = (index, value) => {
    const newSkills = [...structuredData.skills];
    newSkills[index] = value;
    setStructuredData({ ...structuredData, skills: newSkills });
  };

  const removeSkill = (index) => {
    const newSkills = [...structuredData.skills];
    newSkills.splice(index, 1);
    setStructuredData({ ...structuredData, skills: newSkills });
  };

  const addCertification = () => {
    setStructuredData({
      ...structuredData,
      certifications: [...structuredData.certifications, '']
    });
  };

  const updateCertification = (index, value) => {
    const newCertifications = [...structuredData.certifications];
    newCertifications[index] = value;
    setStructuredData({ ...structuredData, certifications: newCertifications });
  };

  const removeCertification = (index) => {
    const newCertifications = [...structuredData.certifications];
    newCertifications.splice(index, 1);
    setStructuredData({ ...structuredData, certifications: newCertifications });
  };

  const renderResult = () => {
    if (!result) return null;

    if (activeTab === 'analyze' && result.analysis) {
      const a = result.analysis;
      const strengths = a.skills_found || a.strengths || [];
      const gaps = a.gaps || a.missing_keywords || [];
      const improvements = a.improvements || [];
      const certs = a.certifications_recommended || [];
      const outdated = a.skills_outdated || [];
      return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Resume Analysis</h2>

          {/* Overall Score */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-8 mb-6 text-center">
            <h3 className="text-gray-300 mb-2">Overall Score</h3>
            <div className="text-5xl font-bold text-white mb-2">
              {a.score}/100 ({a.grade})
            </div>
            {a.career_trajectory && (
              <p className="text-gray-400 mt-2">Career Trajectory: <span className="text-purple-300 capitalize">{a.career_trajectory}</span></p>
            )}
          </div>

          {/* Strengths & Gaps */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {strengths.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-green-400 mb-4">✅ {a.skills_found ? 'Skills Found' : 'Strengths'}</h3>
                <div className="flex flex-wrap gap-2">
                  {strengths.map((item, index) => {
                    const text = typeof item === 'string' ? item : JSON.stringify(item);
                    return (
                      <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                        a.skills_hot?.includes(item)
                          ? 'bg-green-500/30 text-green-200 border border-green-400/50'
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {text} {a.skills_hot?.includes(item) ? '🔥' : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {gaps.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-yellow-400 mb-4">⚠️ {a.gaps ? 'Skill Gaps' : 'Missing Keywords'}</h3>
                <div className="flex flex-wrap gap-2">
                  {gaps.map((item, index) => {
                    const text = typeof item === 'string' ? item : (item.skill || JSON.stringify(item));
                    return (
                      <span key={index} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                        {text}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Improvements */}
          {improvements.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-blue-400 mb-4">📝 Suggested Improvements</h3>
              <div className="space-y-4">
                {improvements.map((item, index) => (
                  <div key={index} className="bg-gray-900/30 rounded-lg p-4">
                    {typeof item === 'string' ? (
                      <p className="text-gray-300">• {item}</p>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            item.priority === 'high' ? 'bg-red-500/30 text-red-300'
                            : item.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-300'
                            : 'bg-blue-500/30 text-blue-300'
                          }`}>{item.priority || 'tip'}</span>
                          <span className="text-white font-semibold">{item.issue || item.title || ''}</span>
                        </div>
                        {item.fix && <p className="text-gray-400 text-sm ml-1">💡 {item.fix}</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Recommended */}
          {certs.length > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-purple-400 mb-4">🎓 Recommended Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {certs.map((cert, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                    {typeof cert === 'string' ? cert : cert.name || JSON.stringify(cert)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Outdated Skills */}
          {outdated.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-red-400 mb-4">⏳ Outdated Skills</h3>
              <div className="flex flex-wrap gap-2">
                {outdated.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                    {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Market Readiness */}
          {a.market_readiness && (
            <div className={`border rounded-xl p-6 mb-6 ${a.market_readiness === 'high'
              ? 'bg-green-500/10 border-green-500/30'
              : a.market_readiness === 'medium'
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-red-500/10 border-red-500/30'
              }`}>
              <h3 className={`text-lg font-bold mb-4 ${a.market_readiness === 'high'
                ? 'text-green-400'
                : a.market_readiness === 'medium'
                  ? 'text-yellow-400'
                  : 'text-red-400'
                }`}>
                📊 Market Readiness: {a.market_readiness.charAt(0).toUpperCase() + a.market_readiness.slice(1)}
              </h3>
              <p className="text-gray-300">
                {a.market_readiness === 'high'
                  ? 'Your resume is well-positioned for the current job market!'
                  : a.market_readiness === 'medium'
                    ? 'Your resume has good potential but could benefit from some improvements.'
                    : 'Consider enhancing your resume to better align with market demands.'}
              </p>
            </div>
          )}

          {/* Summary */}
          {a.summary && (
            <div className="bg-gray-900/30 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">📋 Summary</h3>
              <p className="text-gray-300">{a.summary}</p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'enhance' && result.enhanced) {
      const e = result.enhanced;
      return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Resume Enhancement Results</h2>

          {/* Score Comparison */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Score Improvement</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                <div className="text-gray-300 mb-2">Before Enhancement</div>
                <div className="text-4xl font-bold text-white">{e.score_before || e.ats_score_before || 0}%</div>
                {e.market_readiness_before && <p className="text-gray-400 mt-1 capitalize">Market: {e.market_readiness_before}</p>}
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                <div className="text-gray-300 mb-2">After Enhancement</div>
                <div className="text-4xl font-bold text-white">{e.score_after || e.ats_score_after || 0}%</div>
                {e.market_readiness_after && <p className="text-gray-400 mt-1 capitalize">Market: {e.market_readiness_after}</p>}
              </div>
            </div>
          </div>

          {/* Changes Made */}
          {(e.changes_made || e.changes) && (e.changes_made || e.changes).length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-blue-400 mb-4">Improvements Made</h3>
              <div className="space-y-3">
                {(e.changes_made || e.changes).map((change, index) => (
                  <div key={index} className="bg-gray-900/30 rounded-lg p-3">
                    {typeof change === 'string' ? (
                      <p className="text-gray-300">✓ {change}</p>
                    ) : (
                      <>
                        <span className="text-cyan-300 font-semibold">{change.section || 'Change'}:</span>
                        {change.before && <p className="text-red-300/70 text-sm mt-1 line-through">{change.before}</p>}
                        {change.after && <p className="text-green-300 text-sm mt-1">→ {change.after}</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Resume Text */}
          {e.enhanced_resume && (
            <div className="bg-gray-900/30 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Enhanced Resume</h3>
              <div ref={resumeContentRef} className="prose prose-invert prose-sm max-w-none bg-gray-900/50 p-8 rounded-lg overflow-x-auto mb-4
                prose-headings:text-purple-300 prose-strong:text-white prose-li:text-gray-300 prose-p:text-gray-300
                prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
                prose-ul:my-2 prose-li:my-0.5">
                <ReactMarkdown>{cleanMarkdown(e.enhanced_resume)}</ReactMarkdown>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCopyToClipboard}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                    }`}
                >
                  {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
                </button>
                <button
                  onClick={handleExportPdf}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all hover:scale-105"
                >
                  📄 Export PDF
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'generate' && result.resume) {
      return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Generated Resume</h2>
          <div ref={resumeContentRef} className="prose prose-invert prose-sm max-w-none bg-gray-900/50 p-8 rounded-lg overflow-x-auto mb-6
            prose-headings:text-purple-300 prose-strong:text-white prose-li:text-gray-300 prose-p:text-gray-300
            prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
            prose-ul:my-2 prose-li:my-0.5">
            <ReactMarkdown>{cleanMarkdown(result.resume)}</ReactMarkdown>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCopyToClipboard}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${copied
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                }`}
            >
              {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
            </button>
            <button
              onClick={handleExportPdf}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all hover:scale-105"
            >
              📄 Export PDF
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderGenerateForm = () => {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Resume Generator</h2>
          <p className="text-gray-400">Fill in all details to generate a professional resume</p>
        </div>

        {/* Personal Information */}
        <div className="bg-gray-900/30 p-6 rounded-xl">
          <h4 className="text-lg font-bold text-white mb-4">👤 Personal Information</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Full Name *</label>
              <input
                type="text"
                value={structuredData.personal_info.name}
                onChange={(e) => updatePersonalInfo('name', e.target.value)}
                placeholder="John Doe"
                className="w-full p-3 bg-gray-700/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                value={structuredData.personal_info.email}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                placeholder="john@example.com"
                className="w-full p-3 bg-gray-700/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Phone</label>
              <input
                type="text"
                value={structuredData.personal_info.phone}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full p-3 bg-gray-700/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Location</label>
              <input
                type="text"
                value={structuredData.personal_info.location}
                onChange={(e) => updatePersonalInfo('location', e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full p-3 bg-gray-700/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-300 mb-2">LinkedIn URL</label>
              <input
                type="text"
                value={structuredData.personal_info.linkedin}
                onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                placeholder="linkedin.com/in/johndoe"
                className="w-full p-3 bg-gray-700/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
        </div>

        {/* Target Role */}
        <div className="bg-gray-900/30 p-6 rounded-xl">
          <h4 className="text-lg font-bold text-white mb-4">🎯 Target Role *</h4>
          <input
            type="text"
            value={structuredData.target_role}
            onChange={(e) => setStructuredData({ ...structuredData, target_role: e.target.value })}
            placeholder="e.g., Full Stack Developer, Data Scientist"
            className="w-full p-4 bg-gray-700/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Professional Summary */}
        <div className="bg-gray-900/30 p-6 rounded-xl">
          <h4 className="text-lg font-bold text-white mb-4">📝 Professional Summary</h4>
          <textarea
            value={structuredData.summary}
            onChange={(e) => setStructuredData({ ...structuredData, summary: e.target.value })}
            placeholder="Briefly describe your professional background, skills, and career goals..."
            rows="4"
            className="w-full p-4 bg-gray-700/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Experience */}
        <div className="bg-gray-900/30 p-6 rounded-xl">
          <h4 className="text-lg font-bold text-white mb-4">💼 Work Experience</h4>
          {structuredData.experience.map((exp, expIndex) => (
            <div key={expIndex} className="mb-6 p-4 bg-gray-800/50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-white font-medium">Experience #{expIndex + 1}</h5>
                {expIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => removeExperience(expIndex)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Job Title</label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => updateExperience(expIndex, 'title', e.target.value)}
                    placeholder="Senior Developer"
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
                    placeholder="TechCorp Inc."
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-2 text-sm">Duration</label>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => updateExperience(expIndex, 'duration', e.target.value)}
                    placeholder="Jan 2020 - Present"
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2 text-sm">Achievements/Highlights</label>
                {exp.highlights.map((highlight, highlightIndex) => (
                  <div key={highlightIndex} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => updateExperienceHighlight(expIndex, highlightIndex, e.target.value)}
                      placeholder="Led a team of 5 developers on a major project"
                      className="flex-1 p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    />
                    {highlightIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => removeExperienceHighlight(expIndex, highlightIndex)}
                        className="px-3 text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addExperienceHighlight(expIndex)}
                  className="mt-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  + Add Highlight
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addExperience}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Add Experience
          </button>
        </div>

        {/* Education */}
        <div className="bg-gray-900/30 p-6 rounded-xl">
          <h4 className="text-lg font-bold text-white mb-4">🎓 Education</h4>
          {structuredData.education.map((edu, eduIndex) => (
            <div key={eduIndex} className="mb-4 p-4 bg-gray-800/50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-white font-medium">Education #{eduIndex + 1}</h5>
                {eduIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(eduIndex)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(eduIndex, 'degree', e.target.value)}
                    placeholder="Bachelor of Science in Computer Science"
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(eduIndex, 'institution', e.target.value)}
                    placeholder="University of California, Berkeley"
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Year</label>
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => updateEducation(eduIndex, 'year', e.target.value)}
                    placeholder="2020"
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addEducation}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Add Education
          </button>
        </div>

        {/* Skills */}
        <div className="bg-gray-900/30 p-6 rounded-xl">
          <h4 className="text-lg font-bold text-white mb-4">💻 Skills</h4>
          {structuredData.skills.map((skill, index) => (
            <div key={index} className="flex gap-2 mb-3">
              <input
                type="text"
                value={skill}
                onChange={(e) => updateSkill(index, e.target.value)}
                placeholder="e.g., Python, React, AWS, PostgreSQL"
                className="flex-1 p-3 bg-gray-700/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="px-4 text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Add Skill
          </button>
        </div>

        {/* Certifications */}
        <div className="bg-gray-900/30 p-6 rounded-xl">
          <h4 className="text-lg font-bold text-white mb-4">📜 Certifications</h4>
          {structuredData.certifications.map((cert, index) => (
            <div key={index} className="flex gap-2 mb-3">
              <input
                type="text"
                value={cert}
                onChange={(e) => updateCertification(index, e.target.value)}
                placeholder="e.g., AWS Solutions Architect, Google Cloud Professional"
                className="flex-1 p-3 bg-gray-700/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="px-4 text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addCertification}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Add Certification
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !structuredData.target_role.trim() || !structuredData.personal_info.name.trim() || !structuredData.personal_info.email.trim() || !isSignedIn}
          className={`px-8 py-4 rounded-xl font-semibold transition-all w-full ${loading || !structuredData.target_role.trim() || !structuredData.personal_info.name.trim() || !structuredData.personal_info.email.trim() || !isSignedIn
            ? 'bg-gray-700 cursor-not-allowed text-gray-400'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white hover:scale-105'
            }`}
        >
          {loading ? 'Generating...' : 'Generate Resume'}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8 relative">
      {/* Neon Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        {/* User Info Display */}
        {isSignedIn && user && (
          <div className="mb-6 p-4 bg-gray-800/30 rounded-xl border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">
                  Signed in as:{' '}
                  <span className="text-white font-semibold">
                    {user.username || user.primaryEmailAddress?.emailAddress || user.id}
                  </span>
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  User ID for API: <code className="bg-gray-700 px-2 py-1 rounded">{userId}</code>
                </p>
              </div>
              {!user.username && (
                <div className="text-yellow-400 text-sm">
                  ⚠️ Set a username in Clerk for better identification
                </div>
              )}
            </div>
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
          Resume Analyzer Pro
          {!isSignedIn && (
            <span className="block text-sm text-yellow-400 mt-2">
              (Sign in to save your analysis history)
            </span>
          )}
        </h1>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-8">
          {['analyze', 'enhance', 'generate'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all capitalize ${activeTab === tab
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
            >
              {tab === 'analyze' ? '📊 Analyze' : tab === 'enhance' ? '✨ Enhance' : '📝 Generate'}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 md:p-8 mb-8">
          {activeTab === 'analyze' || activeTab === 'enhance' ? (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-white">Resume Text:</label>
                  <div className="flex items-center gap-3">
                    {pdfFileName && (
                      <span className="text-sm text-purple-300">📄 {pdfFileName}</span>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      ref={fileInputRef}
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={pdfParsing}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pdfParsing ? '⏳ Parsing...' : '📎 Upload PDF'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here or upload a PDF..."
                  className="w-full h-64 p-6 bg-gray-700/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              <div className="mb-8">
                <label className="block text-white mb-3">Target Role:</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Backend Engineer, Frontend Developer"
                  className="w-full p-6 bg-gray-700/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              <button
                onClick={activeTab === 'analyze' ? handleAnalyze : handleEnhance}
                disabled={loading || !resumeText.trim() || !targetRole.trim() || !isSignedIn}
                className={`px-8 py-4 rounded-xl font-semibold transition-all ${loading || !resumeText.trim() || !targetRole.trim() || !isSignedIn
                  ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:scale-105'
                  }`}
              >
                {loading ? 'Processing...' : activeTab === 'analyze' ? 'Analyze Resume' : 'Enhance Resume'}
              </button>
              {!isSignedIn && (
                <p className="mt-4 text-yellow-400 text-sm">
                  Please sign in to use this feature
                </p>
              )}
            </>
          ) : (
            renderGenerateForm()
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8">
            <p className="text-red-300">Error: {error}</p>
          </div>
        )}

        {/* Result Display */}
        {renderResult()}

        {/* Raw JSON Debugging */}
        {result && (
          <details className="bg-gray-900/30 border border-gray-700/50 rounded-2xl p-6 mt-8">
            <summary className="text-gray-300 cursor-pointer">View Raw API Response</summary>
            <pre className="mt-4 text-gray-400 bg-gray-900/50 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

export default ResumeAnalyser;