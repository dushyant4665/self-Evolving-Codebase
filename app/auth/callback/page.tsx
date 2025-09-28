'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

interface GitHubUser {
  id: number
  login: string
  avatar_url: string
  name?: string
  email?: string
}

interface AuthResponse {
  user: GitHubUser
  accessToken: string
}

function AuthCallbackContent() {
  const [status, setStatus] = useState('Processing...')
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleCallback = useCallback(async () => {
    try {
      const code = searchParams.get('code')
      
      if (!code) {
        setError('No authorization code received')
        setStatus('Authentication failed')
        return
      }

      // Check if code was already used
      const usedCode = sessionStorage.getItem('github_code')
      if (usedCode === code) {
        setError('Authorization code already used')
        setStatus('Please try logging in again')
        setTimeout(() => router.push('/'), 2000)
        return
      }

      setStatus('Exchanging code for token...')
      
      // Mark code as used
      sessionStorage.setItem('github_code', code)
      
      // Exchange code for access token
      const response = await fetch('/api/auth/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('Failed to authenticate with GitHub')
      }

      const { user, accessToken }: AuthResponse = await response.json()
      
      setStatus('Creating user session...')
      
      // Store user data directly in database
      setStatus('Storing user data...')

      // Store GitHub access token in user metadata
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: user.id.toString(),
          github_username: user.login,
          github_access_token: accessToken,
        })

      if (dbError) {
        console.error('Database error:', dbError)
        // Continue anyway - we can store in localStorage
      }

      // Store user session in localStorage
      const userSession = {
        id: user.id.toString(),
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name,
        email: user.email,
        access_token: accessToken
      }
      
      localStorage.setItem('github_user', JSON.stringify(userSession))

      setStatus('Success! Redirecting...')
      router.push('/')
      
    } catch (error) {
      console.error('Auth callback error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      setStatus('Authentication failed')
      
      setTimeout(() => {
        router.push('/')
      }, 3000)
    }
  }, [searchParams, router])

  useEffect(() => {
    handleCallback()
  }, [handleCallback])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">{status}</p>
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Redirecting to home page in a few seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}

