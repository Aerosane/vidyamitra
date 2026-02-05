"use client"
import { Sparkles, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function ResumeAnalyserSection() {
    const router = useRouter();

    const handleResumeAnalyserClick = useCallback(() => {
        router.push("/resume-analyser");
    }, [router]);

    return (
        <section className="rounded-2xl p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50" aria-labelledby="resume-analyser-heading">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500" aria-hidden="true">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 id="resume-analyser-heading" className="text-2xl font-bold text-white">Resume Analyser</h2>
            </div>
            <div className="space-y-4">
                <p className="text-gray-300 mb-4">
                    Upload your resume to get AI-powered feedback on how to improve it and increase your chances of landing interviews.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                    <article className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-green-500/20" aria-hidden="true">
                                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="font-semibold text-white">ATS Score</span>
                        </div>
                        <p className="text-sm text-gray-300">Check how well your resume passes through automated systems</p>
                    </article>
                    <article className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-blue-500/20" aria-hidden="true">
                                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="font-semibold text-white">Keyword Analysis</span>
                        </div>
                        <p className="text-sm text-gray-300">Identify missing keywords for specific job roles</p>
                    </article>
                    <article className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-purple-500/20" aria-hidden="true">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="font-semibold text-white">Improvement Tips</span>
                        </div>
                        <p className="text-sm text-gray-300">Get personalized suggestions to enhance your resume</p>
                    </article>
                </div>
                <button
                    onClick={handleResumeAnalyserClick}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3"
                    aria-label="Analyse your resume now"
                >
                    <Sparkles className="w-5 h-5" aria-hidden="true" />
                    Analyse Your Resume Now
                </button>
            </div>
        </section>
    );
}
