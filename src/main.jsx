import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/react-router'
import { neobrutalism } from '@clerk/themes'
import Landing from './pages/Landing.jsx'
import SignInPage from './pages/signin.jsx'
import SignUpPage from './pages/signup.jsx'
import Home from './pages/Home.jsx'
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
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/home"
            element={
              <SignedIn>
                <Home />
              </SignedIn>
            }
          />
        </Routes>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
)
