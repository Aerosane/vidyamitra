"use client"
import Link from "next/link";
import NavBar from "@/components/navbar";
import { ArrowRight, CheckCircle, Zap, Shield, Smile } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <NavBar />

      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-6 animate-fade-in-up">
            Elevate Your Career <br /> with AI Precision
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Unlock your full potential with our suite of AI-powered tools. From resume analysis to mock interviews, we guide you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 text-white">
              Get Started for Free
            </Link>
            <Link href="/services" className="px-8 py-4 bg-gray-800 border border-gray-700 rounded-full font-bold text-lg hover:bg-gray-700 transition-all duration-300 text-white">
              Explore Services
            </Link>
          </div>
        </div>
      </div>

      <section id="services" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Our Premium Services</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to land your dream job, all in one place.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Resume Analysis",
                desc: "Get instant feedback on your resume with ATS compatibility scores and keyword optimization.",
                icon: <CheckCircle className="w-10 h-10 text-green-400" />
              },
              {
                title: "Mock Interviews",
                desc: "Practice with AI interviewers that adapt to your role and provide real-time feedback.",
                icon: <Zap className="w-10 h-10 text-yellow-400" />
              },
              {
                title: "Career Planning",
                desc: "Map out your career trajectory with personalized milestones and learning resources.",
                icon: <ArrowRight className="w-10 h-10 text-blue-400" />
              }
            ].map((service, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20 group">
                <div className="mb-6 p-4 bg-gray-800 rounded-xl inline-block group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-6">{service.desc}</p>
                <Link href="/services" className="text-purple-400 font-semibold group-hover:text-purple-300 flex items-center gap-2">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">We're Here to Help</h2>
            <p className="text-xl text-gray-300 mb-8">
              Have questions about our platform or need support? Our team is dedicated to your success. Reach out to us anytime.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="p-3 bg-gray-800 rounded-full"><Shield className="w-6 h-6 text-purple-500" /></div>
                <span>24/7 Support for Premium Members</span>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <div className="p-3 bg-gray-800 rounded-full"><Smile className="w-6 h-6 text-pink-500" /></div>
                <span>Community Driven Development</span>
              </div>
            </div>
            <div className="mt-10">
              <Link href="/contact" className="inline-block px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300">
                Contact Us
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl transform rotate-3 blur-lg opacity-30"></div>
            <div className="relative bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl border border-gray-700">
              <h3 className="text-2xl font-bold mb-4 text-white">Get in Touch</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none h-32"
                    placeholder="How can we help?"
                  ></textarea>
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:opacity-90 transition-opacity text-white">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 bg-gray-950 text-center text-gray-500 border-t border-gray-900 relative z-10">
        <p>&copy; {new Date().getFullYear()} VidyaMitra. All rights reserved.</p>
      </footer>
    </div>
  );
}