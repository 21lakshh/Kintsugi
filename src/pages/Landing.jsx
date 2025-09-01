import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react'
import { Link } from 'react-router'

export default function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Navigation */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
                <div className="text-2xl font-bold text-indigo-600">
                    YourApp
                </div>
                <div className="flex gap-4">
                    <SignedOut>
                        <Link to="/signin" className="px-4 py-2 text-indigo-600 hover:text-indigo-800 transition-colors">
                            Sign In
                        </Link>
                        <Link to="/signup" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Sign Up
                        </Link>
                    </SignedOut>
                    <SignedIn>
                        <Link to="/home" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Dashboard
                        </Link>
                    </SignedIn>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Welcome to <span className="text-indigo-600">YourApp</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        We help you build amazing things. Our platform provides the tools and services 
                        you need to bring your ideas to life and scale your business.
                    </p>
                    
                    <SignedOut>
                        <div className="flex gap-4 justify-center">
                            <Link to="/signup" className="px-8 py-3 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 transition-colors">
                                Get Started
                            </Link>
                            <Link to="/signin" className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 text-lg rounded-lg hover:bg-indigo-50 transition-colors">
                                Sign In
                            </Link>
                        </div>
                    </SignedOut>
                    
                    <SignedIn>
                        <Link to="/home" className="px-8 py-3 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 transition-colors">
                            Go to Dashboard
                        </Link>
                    </SignedIn>
                </div>

                {/* Features Section */}
                <div className="mt-20 grid md:grid-cols-3 gap-8">
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Fast & Reliable</h3>
                        <p className="text-gray-600">Lightning-fast performance with 99.9% uptime guarantee.</p>
                    </div>
                    
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Secure</h3>
                        <p className="text-gray-600">Enterprise-grade security to keep your data safe.</p>
                    </div>
                    
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
                        <p className="text-gray-600">Intuitive interface designed for productivity.</p>
                    </div>
                </div>
            </main>
        </div>
    )
}