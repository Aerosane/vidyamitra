"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from "@clerk/nextjs";
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, Play, Pause } from 'lucide-react';

function MockInterview() {
  const { user, isLoaded } = useUser();
  const [domain, setDomain] = useState('');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [evaluations, setEvaluations] = useState({});
  const [evaluating, setEvaluating] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechEnabled, setSpeechEnabled] = useState(true);

  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const FAST_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript;
            } else {
              interim += transcript;
            }
          }

          if (final) {
            setVoiceTranscript(prev => prev + (prev ? ' ' : '') + final);
            setInterimTranscript('');
          }

          if (interim) {
            setInterimTranscript(interim);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone permissions.');
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } else {
        console.warn('Speech Recognition API not supported in this browser.');
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        speechSynthesisRef.current = window.speechSynthesis;
      } else {
        console.warn('Speech Synthesis API not supported in this browser.');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  // Get username from Clerk
  const getUserId = () => {
    if (!user) return "user_123";
    return user.username || user.firstName || user.id || "user_123";
  };

  // Start voice recording
  const startVoiceRecording = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    try {
      recognitionRef.current.start();
      setVoiceTranscript('');
      setInterimTranscript('');
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Error accessing microphone.');
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  // Speak text using speech synthesis
  const speakText = (text) => {
    if (!speechSynthesisRef.current || !speechEnabled) return;

    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesisRef.current.speak(utterance);
  };

  // Toggle speech synthesis
  const toggleSpeech = () => {
    if (speechSynthesisRef.current && isSpeaking) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
    setSpeechEnabled(!speechEnabled);
  };

  // Process voice response and send to API
  const processVoiceResponse = async () => {
    if ((!voiceTranscript.trim() && !userAnswers[currentQuestionIndex]) || !result || !result.questions) {
      setError('Please speak or type an answer before sending.');
      return;
    }

    setVoiceProcessing(true);
    setError('');
    const userId = getUserId();

    // Get current question from result
    const currentQuestion = result.questions[currentQuestionIndex];
    const currentQuestionText = currentQuestion?.text || currentQuestion?.question || `Question ${currentQuestionIndex + 1}`;

    // Get next question text
    let nextQuestionText = "Interview completed";
    if (currentQuestionIndex < result.questions.length - 1) {
      const nextQuestion = result.questions[currentQuestionIndex + 1];
      nextQuestionText = nextQuestion?.text || nextQuestion?.question || `Question ${currentQuestionIndex + 2}`;
    }

    // Use voice transcript if available, otherwise use typed answer
    const transcriptToSend = voiceTranscript || userAnswers[currentQuestionIndex] || '';

    const payload = {
      user_id: userId,
      data: {
        transcript: transcriptToSend,
        current_question: currentQuestionText,
        context: {
          question_index: currentQuestionIndex,
          total_questions: result.questions.length,
          next_question: nextQuestionText
        }
      }
    };

    try {
      const response = await fetch(`${FAST_API_URL}/api/webhook/voice/process`, {
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
      setVoiceResponse(data);

      // Store evaluation if provided
      if (data.evaluation) {
        const evaluation = data.evaluation;
        setEvaluations(prev => ({
          ...prev,
          [currentQuestionIndex]: evaluation
        }));
      }

      // Store the answer
      if (transcriptToSend) {
        setUserAnswers(prev => ({
          ...prev,
          [currentQuestionIndex]: transcriptToSend
        }));
      }

      // Clear voice transcript for next question
      setVoiceTranscript('');
      setInterimTranscript('');

      // Speak AI response if enabled
      if (speechEnabled && data.response_text) {
        speakText(data.response_text);
      }

      // Move to next question if interview is not complete
      if (!data.is_complete && currentQuestionIndex < result.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }, 1000);
      } else if (data.is_complete) {
        setInterviewCompleted(true);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setVoiceProcessing(false);
    }
  };

  // Start interview session
  const startInterviewSession = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setUserAnswers({});
    setEvaluations({});
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setCurrentQuestionIndex(0);
    setVoiceResponse(null);
    setVoiceTranscript('');
    setInterimTranscript('');

    const userId = getUserId();

    const payload = {
      user_id: userId,
      data: {
        domain: domain,
        role: role,
        difficulty: difficulty,
        num_questions: numQuestions
      }
    };

    try {
      const response = await fetch(`${FAST_API_URL}/api/webhook/interview/start`, {
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
      } else {
        throw new Error('Failed to start interview session');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Evaluate a single answer (for non-voice mode)
  const evaluateAnswer = async (questionIndex) => {
    if (!result || !result.questions || !result.questions[questionIndex]) return;

    const question = result.questions[questionIndex];
    const userAnswer = userAnswers[questionIndex] || '';

    if (!userAnswer.trim()) {
      setError('Please provide an answer before evaluation.');
      return;
    }

    setEvaluating(true);
    setError('');
    const userId = getUserId();

    const payload = {
      user_id: userId,
      data: {
        question: question.text || question.question || `Question ${questionIndex + 1}`,
        answer: userAnswer,
        expected_points: question.expected_points || question.key_points || []
      }
    };

    try {
      const response = await fetch(`${FAST_API_URL}/api/webhook/interview/evaluate`, {
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

      if (data.status === "ok" && data.evaluation) {
        setEvaluations(prev => ({
          ...prev,
          [questionIndex]: data.evaluation
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    setCurrentQuestionIndex(0);
  };

  const handleAnswerChange = (answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < result.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setVoiceResponse(null);
      setVoiceTranscript('');
      setInterimTranscript('');
    } else {
      setInterviewCompleted(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setVoiceResponse(null);
    }
  };

  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium':
      case 'intermediate': return 'text-yellow-400';
      case 'hard':
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'technical': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'behavioral': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'system design': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGradeColor = (grade) => {
    if (grade.includes('A') || grade.includes('B')) return 'text-green-400';
    if (grade.includes('C')) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHireColor = (wouldHire) => {
    return wouldHire ? 'text-green-400' : 'text-red-400';
  };

  const calculateOverallStats = () => {
    if (Object.keys(evaluations).length === 0) return null;

    const evaluationValues = Object.values(evaluations);
    const totalScore = evaluationValues.reduce((sum, evalItem) => sum + evalItem.score, 0);
    const avgScore = Math.round(totalScore / evaluationValues.length);
    const hireCount = evaluationValues.filter(e => e.would_hire).length;
    const hireRate = Math.round((hireCount / evaluationValues.length) * 100);

    return { avgScore, hireRate };
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

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        <h1 className="text-3xl font-bold text-white mb-2">Mock Interview Practice</h1>
        <p className="text-gray-400 mb-8">Welcome, {getUserId()}! Practice your interview skills with AI evaluation.</p>

        {/* Interview Configuration Form */}
        {!result && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 md:p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div>
                <label className="block text-white mb-2 md:mb-3">Domain:</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g., backend, frontend, data science, devops"
                  className="w-full p-3 md:p-4 bg-gray-700/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white mb-2 md:mb-3">Target Role:</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Python Developer, React Developer, Data Engineer"
                  className="w-full p-3 md:p-4 bg-gray-700/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white mb-2 md:mb-3">Difficulty:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 md:p-4 bg-gray-700/50 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2 md:mb-3">Number of Questions:</label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full p-3 md:p-4 bg-gray-700/50 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={startInterviewSession}
                disabled={loading || !domain.trim() || !role.trim()}
                className={`flex-1 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all ${loading || !domain.trim() || !role.trim()
                  ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:scale-105'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Interview...
                  </span>
                ) : 'Generate Interview Questions'}
              </button>

              <div className="flex items-center gap-3 p-3 md:p-4 bg-gray-700/30 rounded-xl">
                <input
                  type="checkbox"
                  id="voiceMode"
                  checked={voiceMode}
                  onChange={(e) => setVoiceMode(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="voiceMode" className="text-white text-sm">
                  Enable Voice Interview Mode
                </label>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 md:p-6 mb-8">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Interview Questions Display */}
        {result && result.status === "ok" && result.questions && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 md:p-8 mb-8">
            {/* Interview Header */}
            {!interviewStarted && !interviewCompleted && (
              <div className="mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-2xl font-bold text-white">Interview Setup Complete</h3>
                  <div className="text-gray-300 text-sm">
                    Interview ID: <span className="font-mono">{result.interview_id || 'N/A'}</span>
                  </div>
                </div>

                <div className="bg-gray-700/30 p-4 md:p-6 rounded-xl mb-6">
                  <h4 className="text-xl font-bold text-white mb-4">Interview Details</h4>
                  <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <span className="text-gray-300">Domain:</span>
                      <span className="text-white font-semibold ml-2">{domain}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">Role:</span>
                      <span className="text-white font-semibold ml-2">{role}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">Difficulty:</span>
                      <span className={`font-semibold ml-2 ${getDifficultyColor(difficulty)}`}>
                        {difficulty}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-300">Total Questions:</span>
                      <span className="text-white font-semibold ml-2">{result.questions.length}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-300">User ID:</span>
                      <span className="text-white font-semibold ml-2">{getUserId()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={startInterview}
                    className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all hover:scale-105"
                  >
                    Start Mock Interview
                  </button>
                  {voiceMode && (
                    <div className="flex items-center gap-3 p-3 md:p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <span className="text-blue-400">🎤</span>
                      <span className="text-white text-sm">Voice Mode Enabled</span>
                    </div>
                  )}
                  <button
                    onClick={toggleSpeech}
                    className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gray-700/50 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all"
                  >
                    {speechEnabled ? (
                      <>
                        <VolumeX className="w-5 h-5" />
                        Disable Speech
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5" />
                        Enable Speech
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Interview in Progress */}
            {interviewStarted && !interviewCompleted && result.questions.length > 0 && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Mock Interview</h3>
                    <p className="text-gray-300 mt-2">
                      Question {currentQuestionIndex + 1} of {result.questions.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-gray-300">
                      <div className="h-2 w-32 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                          style={{ width: `${((currentQuestionIndex + 1) / result.questions.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    {isSpeaking && (
                      <div className="flex items-center gap-2 text-blue-400">
                        <Volume2 className="w-5 h-5 animate-pulse" />
                        <span className="text-sm">AI Speaking...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Question */}
                {(() => {
                  const question = result.questions[currentQuestionIndex];
                  const questionText = question?.text || question?.question || `Question ${currentQuestionIndex + 1}`;
                  const questionType = question?.type || 'technical';
                  const questionDifficulty = question?.difficulty || difficulty;
                  const expectedPoints = question?.expected_points || question?.key_points || [];
                  const evaluation = evaluations[currentQuestionIndex];

                  return (
                    <div className="bg-gray-700/30 p-4 md:p-6 rounded-xl border border-gray-600/50">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {currentQuestionIndex + 1}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getTypeColor(questionType)}`}>
                              {questionType}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getDifficultyColor(questionDifficulty)}`}>
                              {questionDifficulty}
                            </span>
                          </div>
                        </div>

                        {evaluation && (
                          <div className="bg-gray-800/50 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                                {evaluation.score}%
                              </span>
                              <div>
                                <div className={`font-bold ${getGradeColor(evaluation.grade)}`}>
                                  Grade: {evaluation.grade}
                                </div>
                                <div className={`text-sm ${getHireColor(evaluation.would_hire)}`}>
                                  {evaluation.would_hire ? '✓ Would hire' : '✗ Needs improvement'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mb-6 md:mb-8">
                        <h4 className="text-xl font-bold text-white mb-4">{questionText}</h4>

                        {expectedPoints.length > 0 && (
                          <div className="mb-6">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="font-semibold text-white">Expected Points to Cover:</span>
                            </div>
                            <div className="space-y-2">
                              {expectedPoints.map((point, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-300">{point}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Voice Mode Interface */}
                      {voiceMode ? (
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-white">Voice Response:</label>
                            {isRecording && (
                              <div className="flex items-center gap-2 text-red-400">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-sm">Recording...</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                              <button
                                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                                className={`p-3 rounded-xl transition-all ${isRecording
                                  ? 'bg-red-500 hover:bg-red-600 text-white'
                                  : 'bg-gray-700/50 hover:bg-gray-700 text-white'
                                  }`}
                              >
                                {isRecording ? (
                                  <MicOff className="w-5 h-5" />
                                ) : (
                                  <Mic className="w-5 h-5" />
                                )}
                              </button>

                              <input
                                type="text"
                                value={voiceTranscript}
                                onChange={(e) => setVoiceTranscript(e.target.value)}
                                placeholder="Type or speak your answer..."
                                className="flex-1 p-3 bg-gray-700/50 border border-blue-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-colors"
                              />

                              <button
                                onClick={processVoiceResponse}
                                disabled={voiceProcessing || (!voiceTranscript.trim() && !userAnswers[currentQuestionIndex])}
                                className={`p-3 rounded-xl font-semibold transition-all ${voiceProcessing || (!voiceTranscript.trim() && !userAnswers[currentQuestionIndex])
                                  ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white hover:scale-105'
                                  }`}
                              >
                                {voiceProcessing ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Send className="w-5 h-5" />
                                )}
                              </button>
                            </div>

                            {interimTranscript && (
                              <div className="p-3 bg-gray-800/30 rounded-xl">
                                <p className="text-gray-400 italic">{interimTranscript}</p>
                              </div>
                            )}

                            {/* AI Response from Voice Processing */}
                            {voiceResponse && (
                              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                <div className="font-semibold text-white mb-2">AI Response:</div>
                                <p className="text-gray-300">{voiceResponse.response_text}</p>
                                <div className="flex justify-end mt-3">
                                  <button
                                    onClick={() => voiceResponse.response_text && speakText(voiceResponse.response_text)}
                                    disabled={isSpeaking || !speechEnabled}
                                    className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors"
                                  >
                                    {isSpeaking ? (
                                      <Pause className="w-4 h-4" />
                                    ) : (
                                      <Play className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Text Mode Interface */
                        <div className="mb-6 md:mb-8">
                          <label className="block text-white mb-3">Your Answer:</label>
                          <textarea
                            value={userAnswers[currentQuestionIndex] || ''}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            placeholder="Type your answer here... (This is practice, be detailed!)"
                            className="w-full h-48 p-4 bg-gray-700/50 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
                          />
                          <p className="text-gray-400 text-sm mt-2">
                            Character count: {(userAnswers[currentQuestionIndex] || '').length}
                          </p>
                        </div>
                      )}

                      {/* Evaluation Section */}
                      {evaluation && (
                        <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-600/50">
                          <h5 className="font-bold text-white mb-3">Evaluation:</h5>
                          <p className="text-gray-300 mb-3">{evaluation.feedback}</p>

                          <div className="grid md:grid-cols-2 gap-4">
                            {evaluation.strengths && evaluation.strengths.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <span className="font-semibold text-white">Strengths:</span>
                                </div>
                                <ul className="space-y-1">
                                  {evaluation.strengths.map((strength, idx) => (
                                    <li key={idx} className="text-gray-300 text-sm">• {strength}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {evaluation.improvements && evaluation.improvements.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                  <span className="font-semibold text-white">Improvements:</span>
                                </div>
                                <ul className="space-y-1">
                                  {evaluation.improvements.map((improvement, idx) => (
                                    <li key={idx} className="text-gray-300 text-sm">• {improvement}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Navigation and Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex gap-3">
                          <button
                            onClick={prevQuestion}
                            disabled={currentQuestionIndex === 0}
                            className={`px-4 md:px-6 py-3 rounded-xl font-semibold transition-all ${currentQuestionIndex === 0
                              ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                              : 'bg-gray-700/50 hover:bg-gray-700 text-white'
                              }`}
                          >
                            Previous
                          </button>

                          <button
                            onClick={nextQuestion}
                            className="px-4 md:px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all hover:scale-105"
                          >
                            {currentQuestionIndex === result.questions.length - 1
                              ? 'Complete Interview'
                              : 'Next Question'}
                          </button>
                        </div>

                        {!voiceMode && !evaluation && (
                          <button
                            onClick={() => evaluateAnswer(currentQuestionIndex)}
                            disabled={evaluating || !userAnswers[currentQuestionIndex]?.trim()}
                            className={`px-4 md:px-6 py-3 rounded-xl font-semibold transition-all ${evaluating || !userAnswers[currentQuestionIndex]?.trim()
                              ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105'
                              }`}
                          >
                            {evaluating ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Evaluating...
                              </span>
                            ) : 'Evaluate Answer'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Interview Completed */}
            {interviewCompleted && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl md:text-3xl">🎉</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Interview Completed!</h3>
                  <p className="text-gray-300 mb-6">
                    Great job completing the mock interview. Review your evaluations below.
                  </p>

                  {/* Overall Stats */}
                  {(() => {
                    const stats = calculateOverallStats();
                    return stats && (
                      <div className="grid md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gray-700/30 p-4 rounded-xl">
                          <div className="text-gray-400 text-sm mb-1">Average Score</div>
                          <div className="text-3xl font-bold text-white">
                            {stats.avgScore}%
                          </div>
                        </div>

                        <div className="bg-gray-700/30 p-4 rounded-xl">
                          <div className="text-gray-400 text-sm mb-1">Would Hire Rate</div>
                          <div className="text-3xl font-bold text-green-400">
                            {stats.hireRate}%
                          </div>
                        </div>

                        <div className="bg-gray-700/30 p-4 rounded-xl">
                          <div className="text-gray-400 text-sm mb-1">Questions Answered</div>
                          <div className="text-3xl font-bold text-white">
                            {Object.keys(userAnswers).length}/{result.questions.length}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-6">
                  {result.questions.map((question, index) => {
                    const questionText = question?.text || question?.question || `Question ${index + 1}`;
                    const questionType = question?.type || 'technical';
                    const expectedPoints = question?.expected_points || question?.key_points || [];
                    const evaluation = evaluations[index];
                    const userAnswer = userAnswers[index] || 'No answer provided';

                    return (
                      <div key={index} className="bg-gray-700/30 p-4 md:p-6 rounded-xl border border-gray-600/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getTypeColor(questionType)}`}>
                                {questionType}
                              </span>
                            </div>
                          </div>

                          {evaluation && (
                            <div className="flex items-center gap-4">
                              <div className={`text-xl font-bold ${getScoreColor(evaluation.score)}`}>
                                {evaluation.score}%
                              </div>
                              <div className={`font-bold ${getGradeColor(evaluation.grade)}`}>
                                {evaluation.grade}
                              </div>
                              <div className={`px-3 py-1 rounded-lg text-sm ${evaluation.would_hire
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-red-500/20 text-red-300'
                                }`}>
                                {evaluation.would_hire ? '✓ Hire' : '✗ Reject'}
                              </div>
                            </div>
                          )}
                        </div>

                        <h4 className="text-lg font-bold text-white mb-3">{questionText}</h4>

                        {expectedPoints.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="font-semibold text-white">Key Points:</span>
                            </div>
                            <div className="space-y-1">
                              {expectedPoints.map((point, pointIndex) => (
                                <div key={pointIndex} className="flex items-start gap-3">
                                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-300">{point}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="font-semibold text-white">Your Answer:</span>
                          </div>
                          <div className="bg-gray-800/50 p-4 rounded-xl">
                            <p className="text-gray-300 whitespace-pre-wrap">{userAnswer}</p>
                          </div>
                        </div>

                        {evaluation && (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              <span className="font-semibold text-white">Feedback:</span>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-xl">
                              <p className="text-gray-300">{evaluation.feedback}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      setResult(null);
                      setUserAnswers({});
                      setEvaluations({});
                      setInterviewStarted(false);
                      setInterviewCompleted(false);
                      setCurrentQuestionIndex(0);
                      setVoiceResponse(null);
                      setVoiceTranscript('');
                      setInterimTranscript('');
                    }}
                    className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all hover:scale-105"
                  >
                    Practice Another Interview
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-6 md:px-8 py-3 md:py-4 bg-gray-700/50 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all"
                  >
                    Print Results
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MockInterview;