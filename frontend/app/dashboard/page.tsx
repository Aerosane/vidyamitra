"use client"
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { Trophy, TrendingUp, Zap, Sparkles, Brain, Briefcase, MessageSquare } from 'lucide-react';
import { useEffect, useState, useMemo, useCallback, memo, Suspense } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';

const ResumeAnalyserSection = dynamic(() => import('./_components/resume-analyser'), {
    loading: () => <div className="h-96 rounded-2xl bg-gray-800/50 animate-pulse" />,
    ssr: false
});

const JobOpportunitiesSection = dynamic(() => import('./_components/job-opportunities'), {
    loading: () => <div className="h-96 rounded-2xl bg-gray-800/50 animate-pulse" />,
    ssr: false
});

// Memoized SVG component to prevent re-renders
const ArrowRight = memo(({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
));
ArrowRight.displayName = 'ArrowRight';

// Memoized stat card component
const StatCard = memo(({ stat, index }: { stat: any; index: number }) => (
    <div
        className="rounded-2xl p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 transform transition-transform duration-300 hover:scale-105"
        role="article"
        aria-label={`${stat.label}: ${stat.value}`}
    >
        <div className={`inline-flex p-3 rounded-xl mb-4 bg-gradient-to-br ${stat.color}`}>
            <div className="text-white">{stat.icon}</div>
        </div>
        <div className="text-3xl sm:text-4xl font-bold mb-2 text-white">
            {stat.value}
        </div>
        <div className="text-sm font-semibold mb-1 text-white">
            {stat.label}
        </div>
        {stat.progress !== undefined && (
            <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{stat.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-700">
                    <div
                        className={`h-full rounded-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
                        style={{ width: `${stat.progress}%` }}
                        role="progressbar"
                        aria-valuenow={stat.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    />
                </div>
            </div>
        )}
    </div>
));
StatCard.displayName = 'StatCard';


const QuickActionButton = memo(({ action, onClick }: { action: any; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="group relative p-5 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-105 overflow-hidden"
        aria-label={`Go to ${action.label}`}
    >
        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
            <div className="text-white">{action.icon}</div>
        </div>
        <div className="text-sm font-semibold text-white">
            {action.label}
        </div>
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
    </button>
));
QuickActionButton.displayName = 'QuickActionButton';

export default function DashboardPage() {
    const { isSignedIn, user, isLoaded } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    // Memoized user data
    const username = useMemo(() => user?.username || user?.firstName || "User", [user]);
    const email = useMemo(() => user?.primaryEmailAddress?.emailAddress || "", [user]);
    const avatarUrl = useMemo(() => user?.imageUrl || "", [user]);
    const userInitials = useMemo(() => username.substring(0, 2).toUpperCase(), [username]);

    // Fetch dashboard data with error handling and AbortController
    useEffect(() => {
        if (!isLoaded || !isSignedIn || !user) return;

        const controller = new AbortController();

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const statsResponse = await fetch(`${apiUrl}/api/dashboard/stats?user_id=${encodeURIComponent(username)}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                });

                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setUserData(statsData);
                } else {
                    setUserData({
                        stats: {
                            skillsAssessed: 0,
                            achievements: 0,
                            profileScore: 0,
                            streakDays: 0,
                        },
                    });
                }
            } catch (error: any) {
                if (error.name === 'AbortError') return;
                console.error("Error fetching dashboard data:", error);
                setUserData({
                    stats: {
                        skillsAssessed: 0,
                        achievements: 0,
                        profileScore: 0,
                        streakDays: 0,
                    },
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        return () => controller.abort();
    }, [isLoaded, isSignedIn, user, username, email]);

    // Authentication redirects
    useEffect(() => {
        // If not signed in and loaded, redirect to sign-in
        if (isLoaded && !isSignedIn) {
            router.push("/sign-in");
        }
    }, [isLoaded, isSignedIn, router]);

    // Stats memoization with proper typing
    const stats = useMemo(() => {
        const defaultStats = [
            { icon: <Brain className="w-6 h-6" />, value: "0", label: "Quiz Completed", color: "from-purple-500 to-indigo-500", bgColor: 'bg-purple-500/20' },
            { icon: <Trophy className="w-6 h-6" />, value: "0", label: "Achievements", color: "from-cyan-500 to-teal-500", bgColor: 'bg-cyan-500/20' },
            { icon: <TrendingUp className="w-6 h-6" />, value: "0%", label: "Profile Score", color: "from-orange-500 to-pink-500", bgColor: 'bg-orange-500/20', progress: 0 },
            { icon: <Zap className="w-6 h-6" />, value: "0", label: "Streak Days", color: "from-yellow-500 to-orange-500", bgColor: 'bg-yellow-500/20' }
        ];

        if (!userData) return defaultStats;

        return [
            {
                icon: <Brain className="w-6 h-6" />,
                value: userData.stats?.skillsAssessed?.toString() || "0",
                label: "Quiz Completed",
                color: "from-purple-500 to-indigo-500",
                bgColor: 'bg-purple-500/20'
            },
            {
                icon: <Trophy className="w-6 h-6" />,
                value: userData.stats?.achievements?.toString() || "0",
                label: "Achievements",
                color: "from-cyan-500 to-teal-500",
                bgColor: 'bg-cyan-500/20'
            },
            {
                icon: <TrendingUp className="w-6 h-6" />,
                value: `${userData.stats?.profileScore || 0}%`,
                label: "Profile Score",
                color: "from-orange-500 to-pink-500",
                bgColor: 'bg-orange-500/20',
                progress: userData.stats?.profileScore || 0
            },
            {
                icon: <Zap className="w-6 h-6" />,
                value: userData.stats?.streakDays?.toString() || "0",
                label: "Streak Days",
                color: "from-yellow-500 to-orange-500",
                bgColor: 'bg-yellow-500/20'
            }
        ];
    }, [userData]);

    // Quick actions with useCallback for stable references
    const quickActions = useMemo(() => [
        { icon: <Brain className="w-6 h-6" />, label: "Quiz", color: "from-purple-500 to-indigo-500", link: "/assess" },
        { icon: <TrendingUp className="w-6 h-6" />, label: "Job Opportunities", color: "from-cyan-500 to-teal-500", link: "/plan" },
        { icon: <Briefcase className="w-6 h-6" />, label: "Mock Interview", color: "from-yellow-500 to-orange-500", link: "/interview" },
        { icon: <Sparkles className="w-6 h-6" />, label: "Resume Analyser", color: "from-pink-500 to-rose-500", link: "/resume-analyser" }
    ], []);

    // Memoized navigation handlers
    const handleQuickActionClick = useCallback((link: string) => {
        router.push(link);
    }, [router]);

    // Loading state
    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" role="status" aria-label="Loading"></div>
                    <h1 className="text-2xl font-bold text-white">Loading your dashboard...</h1>
                </div>
            </div>
        );
    }

    // If not signed in, we render nothing while redirecting (or could show a skeleton)
    if (!isSignedIn) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-8 relative">
            {/* Neon Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
                {/* Welcome Banner */}
                <header className="rounded-3xl p-6 sm:p-8 mb-8 bg-gradient-to-r from-purple-900/80 to-pink-900/80 backdrop-blur-sm border border-purple-500/20 shadow-2xl shadow-purple-500/10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                Welcome back, {username}! 👋
                            </h1>
                            <p className="text-purple-100 text-lg">
                                Your personalized career journey starts here
                            </p>
                        </div>
                        <div className="flex items-center gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={`${username}'s profile picture`}
                                    width={48}
                                    height={48}
                                    sizes="(max-width: 640px) 40px, 48px"
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/20"
                                    priority
                                />
                            ) : (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl" aria-label={`${username}'s initials`}>
                                    {userInitials}
                                </div>
                            )}
                            <div>
                                <div className="text-white font-semibold text-sm sm:text-base">{username}</div>
                                <div className="text-purple-100 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[200px]">{email}</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8" aria-label="Dashboard statistics">
                    {stats.map((stat, index) => (
                        <StatCard key={`${stat.label}-${index}`} stat={stat} index={index} />
                    ))}
                </section>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Quick Actions & Resume Analyser */}
                    <div className="lg:col-span-2">
                        {/* Quick Actions */}
                        <section className="rounded-2xl p-6 mb-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50" aria-labelledby="quick-actions-heading">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500" aria-hidden="true">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <h2 id="quick-actions-heading" className="text-2xl font-bold text-white">Quick Actions</h2>
                            </div>
                            <nav className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="Quick actions navigation">
                                {quickActions.map((action, index) => (
                                    <QuickActionButton
                                        key={`${action.label}-${index}`}
                                        action={action}
                                        onClick={() => handleQuickActionClick(action.link)}
                                    />
                                ))}
                            </nav>
                        </section>

                        {/* Resume Analyser Section (Lazy Loaded) */}
                        <ResumeAnalyserSection />
                    </div>

                    {/* Job Recommendations Box (Lazy Loaded) */}
                    <AsideWrapper>
                        <JobOpportunitiesSection />
                    </AsideWrapper>
                </div>
            </div>
        </div>
    );
}

// Wrapper for the sidebar to maintain layout while lazy loading
const AsideWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="lg:col-span-1 h-full">
        {children}
    </div>
);
