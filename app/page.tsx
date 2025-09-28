'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { GitHubLogin } from '@/components/GitHubLogin'
import { Dashboard } from '@/components/Dashboard'

interface GitHubUser {
  access_token: string
  login: string
  avatar_url: string
  name?: string
  email?: string
}

export default function Home() {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [loading, setLoading] = useState(true)

  const checkUser = useCallback(async () => {
    try {
      // Check localStorage for GitHub user
      const githubUser = localStorage.getItem('github_user')
      if (githubUser) {
        const userData = JSON.parse(githubUser) as GitHubUser
        setUser(userData)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Self-Evolving Codebase
            </h1>
            <p className="text-muted-foreground mb-8">
              AI-powered code analysis and improvement system
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="border border-border rounded p-3">
              <h3 className="font-semibold mb-1">Code Analysis</h3>
              <p className="text-xs text-muted-foreground">
                Analyzes repository structure
              </p>
            </div>
            <div className="border border-border rounded p-3">
              <h3 className="font-semibold mb-1">Smart Suggestions</h3>
              <p className="text-xs text-muted-foreground">
                Intelligent improvement recommendations
              </p>
            </div>
            <div className="border border-border rounded p-3">
              <h3 className="font-semibold mb-1">Auto PRs</h3>
              <p className="text-xs text-muted-foreground">
                Automated pull request creation
              </p>
            </div>
          </div>

          <div className="border border-border rounded p-6">
            <h2 className="text-xl font-semibold mb-2">Connect GitHub</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Start analyzing your repositories
            </p>
            <GitHubLogin onSuccess={checkUser} />
          </div>
        </div>
      </div>
    )
  }

  return <Dashboard user={user} />
}

