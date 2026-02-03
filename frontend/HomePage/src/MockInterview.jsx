import React, { useState, useEffect } from 'react';
import {
  MessageCircle, Mic, MicOff, Send, Home, Moon, Sun,
  User, Bot, ArrowRight, Play, CheckCircle, Award,
  BarChart, AlertCircle
} from 'lucide-react';

function MockInterview({ userData, onBack, isDarkMode, toggleDarkMode }) {
  const [mode, setMode] = useState(null); // 'text' or 'voice'
  const [selectedRound, setSelectedRound] = useState(null);
  const [position, setPosition] = useState('');
  const [started, setStarted] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const rounds = [
    {
      id: 'technical',
      name: 'Technical Round',
      icon: '💻',
      questions: 5,
      passScore: 60,
      color: '#6C5CE7'
    },
    {
      id: 'managerial',
      name: 'Managerial Round',
      icon: '📊',
      questions: 4,
      passScore: 60,
      color: '#FD9644'
    },
    {
      id: 'hr',
      name: 'HR Round',
      icon: '👥',
      questions: 4,
      passScore: 60,
      color: '#00D9C0'
    }
  ];

  const questions = {
    technical: [
      "Tell me about a technical challenge you faced and how you overcame it.",
      "Explain the difference between async and await in JavaScript.",
      "How would you optimize a slow-loading web application?",
      "Describe your experience with system design. Can you give an example?",
      "What is your approach to debugging complex issues?"
    ],
    managerial: [
      "How do you prioritize tasks when you have multiple deadlines?",
      "Tell me about a time you had to work with a difficult team member.",
      "How do you handle feedback and criticism?",
      "Describe a project where you took the lead. What was the outcome?"
    ],
    hr: [
      "Why are you interested in this position?",
      "Where do you see yourself in 5 years?",
      "What are your salary expectations?",
      "Do you have any questions for us?"
    ]
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';
      
      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setIsListening(false);
      };
      
      recog.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recog.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recog);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window && mode === 'voice') {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startInterview = () => {
    setStarted(true);
    const firstQuestion = questions[selectedRound][0];
    setConversation([
      {
        role: 'bot',
        text: `Welcome to the ${rounds.find(r => r.id === selectedRound).name}! Let's begin.`,
        timestamp: new Date()
      },
      {
        role: 'bot',
        text: firstQuestion,
        timestamp: new Date()
      }
    ]);
    
    if (mode === 'voice') {
      setTimeout(() => {
        speakText(`Welcome to the ${rounds.find(r => r.id === selectedRound).name}! Let's begin.`);
        setTimeout(() => {
          speakText(firstQuestion);
        }, 3000);
      }, 500);
    }
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    // Add user message
    const newConversation = [
      ...conversation,
      {
        role: 'user',
        text: currentMessage,
        timestamp: new Date()
      }
    ];

    // Calculate response score (simplified)
    const wordCount = currentMessage.split(' ').length;
    let messageScore = 0;
    if (wordCount > 50) messageScore = 20;
    else if (wordCount > 30) messageScore = 15;
    else if (wordCount > 10) messageScore = 10;
    else messageScore = 5;

    setScore(score + messageScore);
    setCurrentMessage('');

    // Check if interview is complete
    if (currentQuestion + 1 >= questions[selectedRound].length) {
      newConversation.push({
        role: 'bot',
        text: "Thank you for your responses. The interview is now complete!",
        timestamp: new Date()
      });
      setCompleted(true);
      
      if (mode === 'voice') {
        setTimeout(() => {
          speakText("Thank you for your responses. The interview is now complete!");
        }, 500);
      }
    } else {
      // Next question
      const nextQuestion = questions[selectedRound][currentQuestion + 1];
      newConversation.push({
        role: 'bot',
        text: nextQuestion,
        timestamp: new Date()
      });
      setCurrentQuestion(currentQuestion + 1);
      
      if (mode === 'voice') {
        setTimeout(() => {
          speakText(nextQuestion);
        }, 1000);
      }
    }

    setConversation(newConversation);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const calculateFinalScore = () => {
    const maxScore = questions[selectedRound].length * 20;
    return Math.round((score / maxScore) * 100);
  };

  // Initial Selection Screen
  if (!mode) {
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

        <div className="interview-selection">
          <div className="interview-header">
            <div className="interview-icon">
              <MessageCircle size={48} />
            </div>
            <h1>Mock Interview</h1>
            <p>Practice interviews across 3 rounds</p>
          </div>

          <div className="mode-selection-card">
            <h2>Select Interview Mode</h2>
            <div className="mode-buttons">
              <button className="mode-button" onClick={() => setMode('text')}>
                <MessageCircle size={32} />
                <h3>Text Mode</h3>
                <p>Type your responses</p>
              </button>
              <button className="mode-button" onClick={() => setMode('voice')}>
                <Mic size={32} />
                <h3>Voice Mode</h3>
                <p>Speak your responses</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Round and Position Selection
  if (!started) {
    return (
      <div className="page-container">
        <div className="page-header">
          <button className="back-button" onClick={() => setMode(null)}>
            <Home size={20} />
            Back
          </button>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="interview-setup">
          <div className="setup-header">
            <h1>Setup Interview</h1>
            <p>Choose position and round to begin</p>
          </div>

          <div className="setup-form">
            <div className="form-group-interview">
              <label>What position are you interviewing for?</label>
              <input
                type="text"
                placeholder="e.g., Software Engineer, Product Manager"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="position-input"
              />
            </div>

            <div className="form-group-interview">
              <label>Select Interview Round</label>
              <div className="rounds-grid">
                {rounds.map(round => (
                  <div
                    key={round.id}
                    className={`round-card ${selectedRound === round.id ? 'selected' : ''}`}
                    onClick={() => setSelectedRound(round.id)}
                    style={{ borderColor: selectedRound === round.id ? round.color : 'var(--border-color)' }}
                  >
                    <div className="round-icon">{round.icon}</div>
                    <h3>{round.name}</h3>
                    <p>{round.questions} questions • {round.passScore}% to pass</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn-primary-large"
              onClick={startInterview}
              disabled={!position || !selectedRound}
            >
              <Play size={20} />
              Start {mode === 'text' ? 'Text' : 'Voice'} Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interview in Progress
  if (!completed) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="interview-progress-header">
            <h3>{rounds.find(r => r.id === selectedRound).name} ({mode === 'text' ? '📝 Text' : '🎤 Voice'} Mode)</h3>
            <span className="question-counter">
              Question {currentQuestion + 1} of {questions[selectedRound].length}
            </span>
          </div>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="interview-chat-container">
          <div className="chat-messages">
            {conversation.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <div className="message-icon">
                  {msg.role === 'bot' ? <Bot size={24} /> : <User size={24} />}
                </div>
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-input-container">
            {mode === 'voice' && (
              <button
                className={`voice-button ${isListening ? 'listening' : ''}`}
                onClick={isListening ? stopListening : startListening}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                {isListening ? 'Stop Listening' : 'Speak Now'}
              </button>
            )}
            
            <div className="chat-input-wrapper">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={mode === 'voice' ? 'Your response will appear here...' : 'Type your response...'}
                className="chat-input"
                rows="3"
              />
              <button className="send-button" onClick={sendMessage} disabled={!currentMessage.trim()}>
                <Send size={20} />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview Completed
  const finalScore = calculateFinalScore();
  const passed = finalScore >= rounds.find(r => r.id === selectedRound).passScore;

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

      <div className="interview-results">
        <div className="results-header">
          <div className={`results-icon ${passed ? 'success' : 'warning'}`}>
            {passed ? <CheckCircle size={64} /> : <AlertCircle size={64} />}
          </div>
          <h1>{passed ? 'Great Performance!' : 'Keep Practicing!'}</h1>
          <p>Review your interview results below</p>
        </div>

        <div className="score-card-large">
          <h2>Your Score</h2>
          <div className="score-display">
            <span className="score-number">{finalScore}%</span>
          </div>
          <p className="score-subtitle">
            {passed ? 'You passed the interview!' : 'Keep practicing to improve'}
          </p>
          <div className="score-bar">
            <div 
              className="score-fill" 
              style={{ 
                width: `${finalScore}%`,
                background: finalScore >= 60 ? '#00B894' : '#FD9644'
              }}
            />
          </div>
        </div>

        <div className="results-actions">
          <button className="btn-secondary-large" onClick={() => window.location.reload()}>
            Practice Again
          </button>
          <button className="btn-primary-large" onClick={onBack}>
            Back to Dashboard
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MockInterview;