import { Navigate } from 'react-router'
import { useUser } from '@clerk/clerk-react'
import { useAppStore } from '../store/useAppStore.js'
import { useEffect } from 'react'

export default function ProtectedRoute({ children, requireOnboarding = true }) {
  const { isLoaded, isSignedIn } = useUser()
  const { userProfile, isNewUser, markAsReturningUser } = useAppStore()

  // Check if user has existing profile data on mount
  useEffect(() => {
    if (isLoaded && isSignedIn && userProfile?.onboardingCompleted) {
      markAsReturningUser()
    }
  }, [isLoaded, isSignedIn, userProfile, markAsReturningUser])

  // Development bypass - check for skip onboarding in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('skipOnboarding') === 'true') {
      console.log('🚀 Bypassing onboarding...');
      // Create a minimal profile for testing
      const { updateUserProfile } = useAppStore.getState()
      const testProfile = {
        personalInfo: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          annualIncome: 600000,
          age: 28,
          maritalStatus: 'single',
          dependents: 0,
          city: 'Mumbai',
          isMetroCity: true
        },
        userType: 'salaried',
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      }
      console.log('✅ Creating test profile:', testProfile);
      updateUserProfile(testProfile)
      
      // Check if there's any pending Gemini data to restore
      setTimeout(() => {
        try {
          const geminiResponses = JSON.parse(localStorage.getItem('gemini-responses') || '[]');
          if (geminiResponses.length > 0) {
            const latestResponse = geminiResponses[geminiResponses.length - 1];
            const timeDiff = new Date() - new Date(latestResponse.timestamp);
            // If response is less than 2 minutes old, restore it
            if (timeDiff < 120000) {
              console.log('🔄 Restoring recent Gemini data:', latestResponse);
              const { setTempExtractedData } = useAppStore.getState();
              setTempExtractedData(latestResponse.processedResult.extractedData);
            }
          }
        } catch (error) {
          console.error('Failed to restore Gemini data:', error);
        }
      }, 1000); // Wait 1 second for profile to be set
    }
  }, [isLoaded, isSignedIn])

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/signin" replace />
  }

  // For routes that don't require onboarding (like /onboarding itself)
  if (!requireOnboarding) {
    // If onboarding is already completed, redirect to home
    if (userProfile?.onboardingCompleted) {
      return <Navigate to="/home" replace />
    }
    return children
  }

  // For routes that require onboarding
  // New users or users without completed onboarding should go to onboarding
  if (isNewUser || !userProfile?.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
