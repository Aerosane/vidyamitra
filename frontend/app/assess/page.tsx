"use client"
import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { CheckCircle, XCircle, AlertCircle, Trophy } from 'lucide-react';

function SkillQuiz() {
  const { user, isLoaded } = useUser();
  const [skill, setSkill] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const FAST_API_URL = 'http://localhost:8000';

  // Get username from Clerk
  const getUserId = () => {
    if (!user) return "user_123";
    return user.username || user.firstName || user.id || "user_123";
  };

  // Generate quiz
  const generateQuiz = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setUserAnswers({});
    setSubmitted(false);
    setEvaluation(null);

    const userId = getUserId();

    const payload = {
      user_id: userId,
      data: {
        skill: skill,
        difficulty: difficulty,
        num_questions: numQuestions
      }
    };

    try {
      const response = await fetch(`${FAST_API_URL}/api/webhook/quiz/generate`, {
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
        throw new Error('Failed to generate quiz');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Evaluate quiz
  const evaluateQuiz = async () => {
    if (!result || !result.questions) return;

    setEvaluating(true);
    setError('');
    const userId = getUserId();

    // Prepare answers array in correct order
    const answers = Array.from({ length: result.questions.length }, (_, i) => userAnswers[i] || '');

    const payload = {
      user_id: userId,
      data: {
        skill: result.skill || skill,
        questions: result.questions.map((q, index) => ({
          question: q.question || q.text || `Question ${index + 1}`,
          options: q.options || q.choices || [],
          correct: q.correct || ''
        })),
        answers: answers
      }
    };

    try {
      const response = await fetch(`${FAST_API_URL}/api/webhook/quiz/evaluate`, {
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
        setEvaluation(data);
        setSubmitted(true);
      } else {
        throw new Error('Failed to evaluate quiz');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    if (!submitted) {
      setUserAnswers(prev => ({
        ...prev,
        [questionIndex]: answer
      }));
    }
  };

  // Get answer letter from option string
  const getAnswerLetter = (option) => {
    const match = option.match(/^([A-D1-4][).]?)\s*(.*)/);
    if (match) {
      return match[1].replace(/[).]/g, ''); // Clean up: "A)", "B.", "1)" -> "A", "B", "1"
    }
    return '';
  };

  // Get answer text without the letter prefix
  const getAnswerText = (option) => {
    const match = option.match(/^([A-D1-4][).]?)\s*(.*)/);
    if (match) {
      return match[2];
    }
    return option;
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

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        <h1 className="text-3xl font-bold text-white mb-2">Skill Assessment Quiz</h1>
        <p className="text-gray-400 mb-8">Welcome, {getUserId()}! Test your skills with AI-powered assessments.</p>

        {/* Quiz Configuration Form */}
        {!result && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 md:p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div>
                <label className="block text-white mb-2 md:mb-3">Skill:</label>
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder="e.g., Python, JavaScript, React"
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
                  <option value={15}>15 Questions</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateQuiz}
              disabled={loading || !skill.trim()}
              className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all ${loading || !skill.trim()
                  ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:scale-105'
                }`}
            >
              {loading ? 'Generating Quiz...' : 'Generate Quiz'}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 md:p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Quiz Questions Display */}
        {result && result.status === "ok" && result.questions && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white">Quiz: {result.skill || skill}</h3>
                <p className="text-gray-300 mt-2">{result.questions.length} Questions • {difficulty} level</p>
              </div>

              {evaluation?.result && (
                <div className={`px-4 md:px-6 py-3 md:py-4 rounded-xl ${evaluation.result.passed
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-orange-500 to-red-500'
                  }`}>
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-white" />
                    <div>
                      <div className="text-2xl font-bold text-white">{evaluation.result.score}%</div>
                      <div className="text-white text-sm">
                        {evaluation.result.correct}/{evaluation.result.total} correct
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quiz Questions */}
            <div className="space-y-6">
              {result.questions.map((question, index) => {
                const questionText = question.question || question.text || `Question ${index + 1}`;
                const options = question.options || question.choices || [];
                const correctAnswer = question.correct || '';
                const explanation = question.explanation || '';

                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === correctAnswer;
                const evaluationDetail = evaluation?.result?.details?.find(d => d.question === index + 1);

                return (
                  <div key={index} className="bg-gray-700/30 p-4 md:p-6 rounded-xl border border-gray-600/50">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="text-lg font-semibold text-white flex-1">{questionText}</div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {options.map((option, optIndex) => {
                        const optionLetter = getAnswerLetter(option);
                        const optionText = getAnswerText(option);
                        const isSelected = userAnswer === optionLetter;
                        const isCorrectOption = optionLetter === correctAnswer;
                        const isWrongSelected = submitted && isSelected && !isCorrectOption;

                        return (
                          <div
                            key={optIndex}
                            onClick={() => !submitted && handleAnswerSelect(index, optionLetter)}
                            className={`p-3 md:p-4 rounded-xl cursor-pointer transition-all ${!submitted
                                ? isSelected
                                  ? 'bg-purple-500/30 border border-purple-500/50'
                                  : 'bg-gray-700/50 border border-gray-600/50 hover:bg-gray-600/50'
                                : isCorrectOption
                                  ? 'bg-green-500/20 border border-green-500/30'
                                  : isWrongSelected
                                    ? 'bg-red-500/20 border border-red-500/30'
                                    : 'bg-gray-700/50 border border-gray-600/50'
                              }`}
                          >
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${!submitted
                                  ? isSelected
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-600 text-gray-300'
                                  : isCorrectOption
                                    ? 'bg-green-500 text-white'
                                    : isWrongSelected
                                      ? 'bg-red-500 text-white'
                                      : 'bg-gray-600 text-gray-300'
                                }`}>
                                {optionLetter}
                              </div>
                              <span className={`font-medium ${!submitted
                                  ? isSelected ? 'text-purple-200' : 'text-gray-300'
                                  : isCorrectOption ? 'text-green-300' : isWrongSelected ? 'text-red-300' : 'text-gray-400'
                                }`}>
                                {optionText}
                              </span>

                              {/* Icons for submitted state */}
                              {submitted && (
                                <div className="ml-auto">
                                  {isCorrectOption && (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                  )}
                                  {isWrongSelected && (
                                    <XCircle className="w-5 h-5 text-red-400" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation or Evaluation Detail */}
                    {(explanation || evaluationDetail) && (
                      <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="font-semibold text-blue-300">Explanation:</span>
                        </div>
                        <p className="text-gray-300">
                          {evaluationDetail?.explanation || explanation}
                        </p>

                        {/* User's answer vs correct answer */}
                        {submitted && userAnswer && evaluationDetail && (
                          <div className="mt-4 grid md:grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-700/30 rounded-lg">
                              <div className="text-sm text-gray-400 mb-1">Your Answer</div>
                              <div className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                {userAnswer}. {options.find(opt => getAnswerLetter(opt) === userAnswer)
                                  ? getAnswerText(options.find(opt => getAnswerLetter(opt) === userAnswer))
                                  : 'Not answered'}
                              </div>
                            </div>
                            <div className="p-3 bg-gray-700/30 rounded-lg">
                              <div className="text-sm text-gray-400 mb-1">Correct Answer</div>
                              <div className="font-medium text-green-400">
                                {correctAnswer}. {options.find(opt => getAnswerLetter(opt) === correctAnswer)
                                  ? getAnswerText(options.find(opt => getAnswerLetter(opt) === correctAnswer))
                                  : ''}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            {!submitted && result.questions.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={evaluateQuiz}
                  disabled={evaluating || Object.keys(userAnswers).length !== result.questions.length}
                  className={`px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold transition-all ${evaluating || Object.keys(userAnswers).length !== result.questions.length
                      ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:scale-105'
                    }`}
                >
                  {evaluating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Evaluating...
                    </span>
                  ) : 'Submit Quiz'}
                </button>
                <p className="text-gray-400 mt-4">
                  Answered: {Object.keys(userAnswers).length} of {result.questions.length} questions
                </p>
              </div>
            )}

            {/* Results and Feedback */}
            {submitted && evaluation && (
              <div className="mt-8 space-y-6">
                {/* Overall Feedback */}
                <div className="bg-gray-700/30 p-4 md:p-6 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <h4 className="text-xl font-bold text-white">Quiz Results</h4>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <div className="text-gray-400 text-sm mb-1">Score</div>
                      <div className={`text-3xl font-bold ${evaluation.result.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {evaluation.result.score}%
                      </div>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <div className="text-gray-400 text-sm mb-1">Correct</div>
                      <div className="text-3xl font-bold text-white">
                        {evaluation.result.correct}/{evaluation.result.total}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <div className="text-gray-400 text-sm mb-1">Status</div>
                      <div className={`text-xl font-bold ${evaluation.result.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {evaluation.result.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-xl">
                      <div className="text-gray-400 text-sm mb-1">Quiz ID</div>
                      <div className="text-sm font-mono text-gray-300 truncate">
                        {evaluation.quiz_id || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  {evaluation.result.feedback && (
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold text-white">Feedback</span>
                      </div>
                      <p className="text-gray-300">{evaluation.result.feedback}</p>
                    </div>
                  )}
                </div>

                {/* Detailed Results */}
                {evaluation.result.details && (
                  <div className="bg-gray-700/30 p-4 md:p-6 rounded-xl">
                    <h4 className="text-xl font-bold text-white mb-4">Question-by-Question Breakdown</h4>
                    <div className="space-y-3">
                      {evaluation.result.details.map((detail, index) => {
                        const question = result.questions[index];
                        const questionText = question?.question || question?.text || `Question ${index + 1}`;

                        return (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${detail.correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium line-clamp-1">{questionText}</div>
                              <div className="text-sm text-gray-400 mt-1">
                                You answered: <span className={detail.correct ? 'text-green-400' : 'text-red-400'}>
                                  {detail.your_answer || 'Not answered'}
                                </span> •
                                Correct: <span className="text-green-400">{detail.correct_answer}</span>
                              </div>
                            </div>
                            <div>
                              {detail.correct ? (
                                <CheckCircle className="w-6 h-6 text-green-400" />
                              ) : (
                                <XCircle className="w-6 h-6 text-red-400" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Retry Button */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setResult(null);
                      setUserAnswers({});
                      setSubmitted(false);
                      setEvaluation(null);
                    }}
                    className="flex-1 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all hover:scale-105"
                  >
                    Take Another Quiz
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

export default SkillQuiz;