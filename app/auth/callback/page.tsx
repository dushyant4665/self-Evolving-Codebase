'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

function AuthCallbackContent() {
  const [status, setStatus] = useState('Processing...')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      const code = searchParams.get('code')
      
      if (!code) {
        setStatus('No authorization code received')
        return
      }

      // Check if code was already used
      const usedCode = sessionStorage.getItem('github_code')
      if (usedCode === code) {
        setStatus('Authorization code already used. Please try logging in again.')
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

      const { user, accessToken } = await response.json()
      
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
      localStorage.setItem('github_user', JSON.stringify({
        id: user.id.toString(),
        login: user.login,
        avatar_url: user.avatar_url,
        access_token: accessToken
      }))

      setStatus('Success! Redirecting...')
      router.push('/')
      
    } catch (error) {
      console.error('Auth callback error:', error)
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      setTimeout(() => {
        router.push('/')
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">{status}</p>
        {status.startsWith('Error:') && (
          <p className="text-sm text-muted-foreground mt-2">
            Redirecting to home page in a few seconds...
          </p>
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

