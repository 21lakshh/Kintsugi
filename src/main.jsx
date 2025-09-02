import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/react-router'
import { neobrutalism } from '@clerk/themes'
import Landing from './pages/Landing.jsx'
import SignInPage from './pages/signin.jsx'
import SignUpPage from './pages/signup.jsx'
import Home from './pages/Home.jsx'
import Transactions from './pages/Transactions.jsx'
import Analysis from './pages/Analysis.jsx'
import Filing from './pages/Filing.jsx'
import Onboarding from './pages/Onboarding.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import DashboardRedirect from './components/DashboardRedirect.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider
        appearance={{
          theme: neobrutalism,
        }}
        publishableKey={PUBLISHABLE_KEY}
        signInUrl="/signin"
        signUpUrl="/signup"
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      >
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              <>
                <SignedOut>
                  <Landing />
                </SignedOut>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
              </>
            } 
          />
          <Route 
            path="/signin" 
            element={
              <>
                <SignedOut>
                  <SignInPage />
                </SignedOut>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
              </>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <>
                <SignedOut>
                  <SignUpPage />
                </SignedOut>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
              </>
            } 
          />
          
          {/* Onboarding Route - only for users who haven't completed onboarding */}
          <Route
            path="/onboarding"
            element={
              <SignedIn>
                <Onboarding />
              </SignedIn>
            }
          />

          {/* Dashboard Route - entry point after successful auth, checks onboarding */}
          <Route
            path="/dashboard"
            element={
              <SignedIn>
                <DashboardRedirect />
              </SignedIn>
            }
          />

          {/* Protected Routes - require completed onboarding */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/filing"
            element={
              <ProtectedRoute>
                <Filing />
              </ProtectedRoute>
            }
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <>
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/" replace />
                </SignedOut>
              </>
            } 
          />
        </Routes>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
)
