import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react'
import { Link } from 'react-router'

export default function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            {/* Navigation */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
                <div className="text-3xl font-bold text-emerald-600">
                    LiveTax
                </div>
                <div className="flex gap-4">
                    <SignedOut>
                        <Link to="/signin" className="px-4 py-2 text-emerald-600 hover:text-emerald-800 transition-colors font-medium">
                            Sign In
                        </Link>
                        <Link to="/signup" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                            Get Started
                        </Link>
                    </SignedOut>
                    <SignedIn>
                        <Link to="/home" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                            Dashboard
                        </Link>
                    </SignedIn>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-900 mb-6">
                        Your Real-Time <span className="text-emerald-600">Tax Companion</span>
                    </h1>
                    <h2 className="text-2xl text-gray-700 mb-8 max-w-4xl mx-auto font-medium">
                        Never Overpay Again.
                    </h2>
                    <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                        Connect your finances, track your tax liability after every transaction, and file with confidence.
                    </p>
                    
                    <SignedOut>
                        <div className="flex gap-4 justify-center mb-12">
                            <Link to="/signin" className="px-8 py-4 bg-emerald-600 text-white text-lg rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-lg">
                                Sign In
                            </Link>
                            <Link to="/signup" className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 text-lg rounded-lg hover:bg-emerald-50 transition-colors font-semibold">
                                Sign Up
                            </Link>
                        </div>
                    </SignedOut>
                    
                    <SignedIn>
                        <Link to="/home" className="px-10 py-4 bg-emerald-600 text-white text-lg rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-lg mb-12 inline-block">
                            Go to Dashboard
                        </Link>
                    </SignedIn>

                    {/* Trust Badges */}
                    <div className="flex justify-center items-center gap-8 mb-16">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">256-bit Encryption</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">ISO Certified</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Read-only Bank Access</span>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-20 grid md:grid-cols-3 gap-8">
                    <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-900">Live Financial Pulse</h3>
                        <p className="text-gray-600">Real-time tax liability updates with every transaction. See your financial health at a glance.</p>
                    </div>
                    
                    <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-900">Proactive AI Assistant</h3>
                        <p className="text-gray-600">Smart recommendations and timely alerts to optimize your tax strategy throughout the year.</p>
                    </div>
                    
                    <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-900">Effortless Filing</h3>
                        <p className="text-gray-600">Pre-filled ITR forms and direct JSON/XML export for seamless tax filing when the time comes.</p>
                    </div>
                </div>
            </main>
        </div>
    )
}