"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Briefcase, FileText, GraduationCap, TrendingUp, Sparkles } from 'lucide-react';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    const [scrollY, setScrollY] = useState(0);
    const [theme, setTheme] = useState('dark');
    const ticking = useRef(false);
    const isDark = theme === 'dark';

    useEffect(() => {
        const handleScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    setScrollY(window.scrollY);
                    ticking.current = false;
                });
                ticking.current = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const themeClasses = useMemo(() => ({
        bg: isDark ? 'bg-slate-900' : 'bg-gray-50',
        text: isDark ? 'text-white' : 'text-gray-900',
        subtext: isDark ? 'text-slate-300' : 'text-gray-600',
        card: isDark ? 'bg-white/5 backdrop-blur-lg border-white/10' : 'bg-white border-gray-200 shadow-lg',
        accent: isDark ? 'text-purple-400' : 'text-purple-600',
        ctaBg: isDark ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-white/10' : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200'
    }), [isDark]);

    const features = useMemo(() => [
        {
            icon: <FileText className="w-12 h-12" />,
            title: "AI Resume Evaluator",
            description: "Get instant, intelligent feedback on your resume with our advanced AI analysis. Identify strengths, weaknesses, and optimization opportunities.",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: <GraduationCap className="w-12 h-12" />,
            title: "Personalized Training",
            description: "Access tailored learning paths based on your career goals. Master in-demand skills with our expert-curated courses and interactive exercises.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: <TrendingUp className="w-12 h-12" />,
            title: "Career Path Planner",
            description: "Visualize your career trajectory with AI-powered insights. Get personalized roadmaps that align with market trends and your aspirations.",
            color: "from-green-500 to-emerald-500"
        },
        {
            icon: <Briefcase className="w-12 h-12" />,
            title: "Interview Preparation",
            description: "Practice with AI-driven mock interviews. Receive real-time feedback on your responses, body language, and communication skills.",
            color: "from-orange-500 to-red-500"
        }
    ], []);

    return (
        <div className={`min-h-screen transition-colors duration-500 ${themeClasses.bg}`}>
            {/* Neon Background - Dark Mode Only */}
            {isDark && (
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative z-10 container mx-auto px-6 pt-20 pb-32">
                <div className="text-center mb-16">
                    <div className={`inline-flex items-center gap-2 border rounded-full px-6 py-2 mb-8 transition-all duration-300 ${isDark
                        ? 'bg-purple-500/20 border-purple-500/30'
                        : 'bg-purple-100 border-purple-300'
                        }`}>
                        <Sparkles className={`w-5 h-5 transition-colors duration-300 ${isDark ? 'text-purple-400' : 'text-purple-600'
                            }`} />
                        <span className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-purple-300' : 'text-purple-700'
                            }`}>
                            AI-Powered Career Intelligence
                        </span>
                    </div>

                    <h1 className={`text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-tight transition-opacity duration-500`}>
                        Intelligent Career Agent
                    </h1>

                    <p className={`text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed transition-colors duration-300 ${themeClasses.subtext}`}>
                        Transform Your Career Journey with AI-Powered Resume Analysis, Personalized Training & Strategic Planning
                    </p>

                    <div className="flex justify-center">
                        <SignIn
                            routing="path"
                            path="/sign-in"
                            signUpUrl="/sign-up"
                            forceRedirectUrl="/dashboard"
                            fallbackRedirectUrl="/dashboard"
                        />
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {features.map((feature, index) => {
                        const offset = scrollY > 300 ? (scrollY - 300) * 0.05 * (index % 2 === 0 ? 1 : -1) : 0;

                        return (
                            <div
                                key={index}
                                className={`group relative border rounded-2xl p-8 transition-all duration-500 hover:scale-105 ${themeClasses.card} ${isDark ? 'hover:bg-white/10 hover:shadow-2xl' : 'hover:shadow-xl'
                                    }`}
                                style={{
                                    transform: `translateY(${offset}px)`,
                                    transition: 'transform 0.1s ease-out, all 0.5s ease'
                                }}
                            >
                                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <div className="text-white">{feature.icon}</div>
                                </div>

                                <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${themeClasses.text}`}>
                                    {feature.title}
                                </h3>
                                <p className={`leading-relaxed transition-colors duration-300 ${themeClasses.subtext}`}>
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
