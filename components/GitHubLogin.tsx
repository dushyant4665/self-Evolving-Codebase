'use client'

import { useState } from 'react'

interface GitHubLoginProps {
  onSuccess: () => void
}

export function GitHubLogin({ onSuccess }: GitHubLoginProps) {
  const [loading, setLoading] = useState(false)

  const handleGitHubLogin = async () => {
    setLoading(true)
    try {
      // Get client ID from environment
      const response = await fetch('/api/auth/config')
      if (!response.ok) {
        throw new Error('Failed to get client ID')
      }
      const { clientId } = await response.json()
      
      // Redirect to GitHub OAuth
      const redirectUri = `${window.location.origin}/auth/callback`
      const scope = 'repo,user:email'
      
      const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
      window.location.href = githubUrl
    } catch (error) {
      console.error('GitHub login error:', error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGitHubLogin}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded bg-secondary hover:bg-accent text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Connecting...' : 'Connect GitHub'}
    </button>
  )
}
