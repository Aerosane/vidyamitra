"use client"
import { Briefcase, TrendingUp } from 'lucide-react';
import { useCallback } from 'react';

export default function JobOpportunitiesSection() {
    const handleJobOpportunitiesClick = useCallback(() => {
        window.location.href = 'https://www.naukri.com/nlogin/login?utm_source=google&utm_medium=cpc&utm_campaign=Brand&gclsrc=aw.ds&gad_source=1&gad_campaignid=19863995494&gbraid=0AAAAADLp3cHQfND7JICwSWl7ABrZEFpKS&gclid=CjwKCAiA1obMBhAbEiwAsUBbImgMOIAkykiuV2OkABrwfUqdzb4yUI8Jkj-ZBPA3kZs2MsUFmEgKiRoCHtEQAvD_BwE';
    }, []);

    return (
        <aside className="rounded-2xl p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50" aria-labelledby="job-opportunities-heading">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500" aria-hidden="true">
                    <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h2 id="job-opportunities-heading" className="text-2xl font-bold text-white">Job Opportunities</h2>
            </div>

            <div className="space-y-6">
                <p className="text-gray-300 mb-6">
                    Discover personalized job recommendations based on your skills and career goals. Get matched with opportunities that fit your profile.
                </p>

                <div className="space-y-4">
                    <article className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                        <div className="p-2 rounded-lg bg-green-500/20" aria-hidden="true">
                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">Smart Matching</h3>
                            <p className="text-sm text-gray-300">Get job recommendations based on your skills and experience</p>
                        </div>
                    </article>

                    <article className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                        <div className="p-2 rounded-lg bg-blue-500/20" aria-hidden="true">
                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">Fast Apply</h3>
                            <p className="text-sm text-gray-300">Apply to multiple jobs quickly with your optimized resume</p>
                        </div>
                    </article>

                    <article className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                        <div className="p-2 rounded-lg bg-purple-500/20" aria-hidden="true">
                            <TrendingUp className="w-5 h-5 text-purple-400" aria-hidden="true" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">Growth Opportunities</h3>
                            <p className="text-sm text-gray-300">Find roles that match your career growth trajectory</p>
                        </div>
                    </article>
                </div>

                <button
                    onClick={handleJobOpportunitiesClick}
                    className="w-full mt-6 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3"
                    aria-label="Explore more job opportunities"
                >
                    <Briefcase className="w-5 h-5" aria-hidden="true" />
                    Explore More Job Opportunities
                </button>
            </div>
        </aside>
    );
}
