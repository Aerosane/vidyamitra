"use client"

import React, { useState, useMemo } from 'react';
import { Target, Users, Award, Lightbulb, Heart, Rocket } from 'lucide-react';

export default function AboutPage() {
  const [theme, setTheme] = useState('dark');
  const isDark = theme === 'dark';

  const values = useMemo(() => [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Mission-Driven",
      description: "Empowering professionals to unlock their full potential through AI-powered career guidance.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community First",
      description: "Building a supportive ecosystem where career growth is collaborative and accessible to all.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excellence",
      description: "Delivering world-class tools and resources backed by cutting-edge AI technology.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "Continuously evolving our platform to meet the changing demands of the modern workforce.",
      color: "from-orange-500 to-red-500"
    }
  ], []);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Neon Background - Dark Mode Only */}
      {isDark && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      )}

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <Heart className={`w-6 h-6 ${isDark ? 'text-cyan-400' : 'text-purple-600'}`} />
            <span className={`text-sm font-semibold ${isDark ? 'text-cyan-400' : 'text-purple-600'}`}>
              About Us
            </span>
          </div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Transforming Careers with AI
          </h1>
          
          <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            We believe everyone deserves access to intelligent career guidance. 
            Our mission is to democratize career success through cutting-edge AI technology.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="relative max-w-6xl mx-auto px-6 pb-20">
        <div className={`rounded-2xl p-8 md:p-12 border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200 shadow-lg'}`}>
          <div className="flex items-center gap-3 mb-6">
            <Rocket className={`w-8 h-8 ${isDark ? 'text-cyan-400' : 'text-purple-600'}`} />
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Our Story</h2>
          </div>
          <div className={`space-y-4 text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <p>
              Intelligent Career Agent was born from a simple observation: 
              career guidance was either too expensive, too generic, or simply unavailable for most professionals.
            </p>
            <p>
              We assembled a team of AI researchers, career coaches, and technologists to build a platform 
              that combines the best of human expertise with the power of artificial intelligence.
            </p>
            <p>
              Today, we're proud to serve professionals worldwide, helping them navigate career 
              transitions, optimize their resumes, and achieve their professional goals.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="relative max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Our Core Values
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl border p-8 ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200 shadow-lg'}`}
            >
              <div className={`inline-flex p-4 rounded-xl mb-6 bg-gradient-to-br ${value.color}`}>
                <div className="text-white">{value.icon}</div>
              </div>

              <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {value.title}
              </h3>

              <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative max-w-6xl mx-auto px-6 pb-20">
        <div className={`relative overflow-hidden rounded-3xl p-12 text-center border ${
          isDark 
            ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30' 
            : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200'
        }`}>
          <div className="relative">
            <h2 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Join Our Journey
            </h2>
            <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Be part of the career revolution. Start transforming your professional life today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}