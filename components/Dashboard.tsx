'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { GitHubService } from '@/lib/github'
import { RepositoryList } from './RepositoryList'
import { RepositoryViewer } from './RepositoryViewer'
import { EvolutionLogs } from './EvolutionLogs'
import { LogOut } from 'lucide-react'

interface GitHubUser {
  access_token: string
  login: string
  avatar_url: string
  name?: string
  email?: string
}

interface Repository {
  id: number
  name: string
  full_name: string
  description?: string
  private: boolean
  owner: {
    login: string
    avatar_url: string
  }
}

interface UserProfile {
  login: string
  avatar_url: string
  name?: string | null
  email?: string | null
}

interface DashboardProps {
  user: GitHubUser
}

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'repos' | 'viewer' | 'logs'>('repos')
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [githubService, setGithubService] = useState<GitHubService | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const initializeGitHub = useCallback(async () => {
    try {
      setError(null)
      // Use access token from user object (stored in localStorage)
      if (user?.access_token) {
        const service = new GitHubService(user.access_token)
        setGithubService(service)
        
        // Get GitHub user profile
        const profile = await service.getUser()
        setUserProfile(profile)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize GitHub'
      setError(errorMessage)
      console.error('Failed to initialize GitHub:', error)
    }
  }, [user?.access_token])

  useEffect(() => {
    initializeGitHub()
  }, [initializeGitHub])

  const handleLogout = useCallback(async () => {
    try {
      localStorage.removeItem('github_user')
      window.location.reload()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [])

  const handleSelectRepo = useCallback((repo: Repository) => {
    setSelectedRepo(repo)
    setActiveTab('viewer')
  }, [])

  const handleTabChange = useCallback((tab: 'repos' | 'viewer' | 'logs') => {
    setActiveTab(tab)
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <p className="text-lg font-semibold">Connection Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={initializeGitHub}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  if (!githubService) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Connecting to GitHub...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background" role="banner">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-bold">Self-Evolving Codebase</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {userProfile && (
                <div className="flex items-center space-x-2" role="img" aria-label={`User: ${userProfile.login}`}>
                  <img
                    src={userProfile.avatar_url}
                    alt={`${userProfile.login}'s avatar`}
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="text-sm">{userProfile.login}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Logout from application"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-4">
          <div className="flex space-x-6" role="tablist">
            <button
              onClick={() => handleTabChange('repos')}
              className={`flex items-center px-1 py-3 text-xs font-medium border-b transition-colors ${
                activeTab === 'repos'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              role="tab"
              aria-selected={activeTab === 'repos'}
              aria-controls="repos-panel"
            >
              Repos
            </button>
            
            {selectedRepo && (
              <button
                onClick={() => handleTabChange('viewer')}
                className={`flex items-center px-1 py-3 text-xs font-medium border-b transition-colors ${
                  activeTab === 'viewer'
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                role="tab"
                aria-selected={activeTab === 'viewer'}
                aria-controls="viewer-panel"
              >
                {selectedRepo.name}
              </button>
            )}
            
            <button
              onClick={() => handleTabChange('logs')}
              className={`flex items-center px-1 py-3 text-xs font-medium border-b transition-colors ${
                activeTab === 'logs'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              role="tab"
              aria-selected={activeTab === 'logs'}
              aria-controls="logs-panel"
            >
              Logs
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6" role="main">
        {activeTab === 'repos' && (
          <div id="repos-panel" role="tabpanel" aria-labelledby="repos-tab">
            <RepositoryList
              githubService={githubService}
              onSelectRepo={handleSelectRepo}
            />
          </div>
        )}
        
        {activeTab === 'viewer' && selectedRepo && (
          <div id="viewer-panel" role="tabpanel" aria-labelledby="viewer-tab">
            <RepositoryViewer
              repository={selectedRepo}
              githubService={githubService}
              user={user}
            />
          </div>
        )}
        
        {activeTab === 'logs' && (
          <div id="logs-panel" role="tabpanel" aria-labelledby="logs-tab">
            <EvolutionLogs selectedRepo={selectedRepo} />
          </div>
        )}
      </main>
    </div>
  )
}

