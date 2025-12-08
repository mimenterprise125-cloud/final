import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthProvider'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-8">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default AuthGuard
