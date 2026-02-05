"use client"

import React, { useState, useMemo } from 'react';
import { FileText, GraduationCap, TrendingUp, Briefcase, CheckCircle, Sparkles } from 'lucide-react';

export default function ServicesPage() {
  const [theme, setTheme] = useState('dark');
  const isDark = theme === 'dark';

  const services = useMemo(() => [
    {
      icon: <FileText className="w-10 h-10" />,
      title: "AI Resume Evaluator",
      description: "Get comprehensive AI-powered analysis of your resume with actionable insights to improve your job application success.",
      color: "from-purple-500 to-pink-500",
      features: [
        "Instant resume analysis and scoring",
        "ATS compatibility checking",
        "Keyword optimization suggestions",
        "Format and structure recommendations",
        "Industry-specific feedback"
      ]
    },
    {
      icon: <GraduationCap className="w-10 h-10" />,
      title: "Personalized Training",
      description: "Access tailored learning paths designed to help you master the skills needed for your dream career.",
      color: "from-blue-500 to-cyan-500",
      features: [
        "Customized learning roadmaps",
        "Interactive course materials",
        "Skill gap analysis",
        "Progress tracking and milestones",
        "Expert-curated content"
      ]
    },
    {
      icon: <TrendingUp className="w-10 h-10" />,
      title: "Career Path Planner",
      description: "Visualize and plan your career trajectory with AI-powered insights tailored to your goals and market trends.",
      color: "from-green-500 to-emerald-500",
      features: [
        "Personalized career roadmaps",
        "Market trend analysis",
        "Salary expectations and growth",
        "Skills required for advancement",
        "Alternative career path suggestions"
      ]
    },
    {
      icon: <Briefcase className="w-10 h-10" />,
      title: "Interview Preparation",
      description: "Practice and perfect your interview skills with AI-driven mock interviews and real-time feedback.",
      color: "from-orange-500 to-red-500",
      features: [
        "AI-powered mock interviews",
        "Real-time response feedback",
        "Common interview questions database",
        "Body language and communication tips",
        "Company-specific preparation"
      ]
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
            <Sparkles className={`w-6 h-6 ${isDark ? 'text-cyan-400' : 'text-purple-600'}`} />
            <span className={`text-sm font-semibold ${isDark ? 'text-cyan-400' : 'text-purple-600'}`}>
              Our Services
            </span>
          </div>
          
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            AI-Powered Career Solutions
          </h1>
          
          <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Comprehensive tools and services to help you succeed at every stage of your career journey
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="relative max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl border p-8 ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200 shadow-lg'}`}
            >
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-xl mb-6 bg-gradient-to-br ${service.color}`}>
                <div className="text-white">{service.icon}</div>
              </div>

              {/* Title */}
              <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {service.title}
              </h3>

              {/* Description */}
              <p className={`text-base mb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {service.description}
              </p>

              {/* Features List */}
              <div className={`pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Key Features:
                </h4>
                <ul className="space-y-3">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-cyan-400' : 'text-purple-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            How It Works
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Get started in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Sign Up",
              description: "Create your account and tell us about your career goals and aspirations."
            },
            {
              step: "02",
              title: "Choose Services",
              description: "Select the services that match your needs and start your journey."
            },
            {
              step: "03",
              title: "Achieve Goals",
              description: "Follow personalized guidance and watch your career transform."
            }
          ].map((step, index) => (
            <div
              key={index}
              className={`text-center p-8 rounded-2xl border ${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200 shadow-lg'}`}
            >
              <div className={`text-5xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent`}>
                {step.step}
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {step.title}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {step.description}
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
              Ready to Get Started?
            </h2>
            <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Choose the service that fits your needs and start advancing your career today
            </p>
          </div>
        </div>  
      </div>
    </div>
  );
}