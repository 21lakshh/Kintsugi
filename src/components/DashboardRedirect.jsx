import { Navigate } from 'react-router'
import { useAppStore } from '../store/useAppStore.js'

export default function DashboardRedirect() {
  const { userProfile, isNewUser } = useAppStore()

  // If user is new or hasn't completed onboarding, go to onboarding
  if (isNewUser || !userProfile?.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  // If user has completed onboarding, go to home
  return <Navigate to="/home" replace />
}
