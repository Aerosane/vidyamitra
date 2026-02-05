import { SignUp } from '@clerk/nextjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Sign Up - Your App',
    description: 'Create a new account',
}

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-600 mt-2">Join thousands of users improving their careers</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                    <SignUp
                        routing="path"
                        path="/sign-up"
                        signInUrl="/sign-in"
                        fallbackRedirectUrl="/dashboard"
                        forceRedirectUrl="/dashboard"
                        appearance={{
                            elements: {
                                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200",
                                card: "shadow-none",
                                headerTitle: "text-xl font-bold text-gray-900",
                                headerSubtitle: "text-gray-600",
                                socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
                                footerActionLink: "text-blue-600 hover:text-blue-800 font-medium",
                                formFieldInput: "border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg",
                            }
                        }}
                    />
                </div>

                <div className="text-center mt-6 text-gray-600 text-sm">
                    <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
                </div>
            </div>
        </div>
    )
}
