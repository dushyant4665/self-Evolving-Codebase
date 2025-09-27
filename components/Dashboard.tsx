'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { GitHubService } from '@/lib/github'
import { RepositoryList } from './RepositoryList'
import { RepositoryViewer } from './RepositoryViewer'
import { EvolutionLogs } from './EvolutionLogs'
import { LogOut } from 'lucide-react'

interface DashboardProps {
  user: any
}

export function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'repos' | 'viewer' | 'logs'>('repos')
  const [selectedRepo, setSelectedRepo] = useState<any>(null)
  const [githubService, setGithubService] = useState<GitHubService | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    initializeGitHub()
  }, [user])

  const initializeGitHub = async () => {
    try {
      // Use access token from user object (stored in localStorage)
      if (user?.access_token) {
        const service = new GitHubService(user.access_token)
        setGithubService(service)
        
        // Get GitHub user profile
        const profile = await service.getUser()
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Failed to initialize GitHub:', error)
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem('github_user')
    window.location.reload()
  }

  const handleSelectRepo = (repo: any) => {
    setSelectedRepo(repo)
    setActiveTab('viewer')
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
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-bold">Self-Evolving Codebase</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {userProfile && (
                <div className="flex items-center space-x-2">
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.login}
                    className="h-6 w-6 rounded-full"
                  />
                  <span className="text-sm">{userProfile.login}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('repos')}
              className={`flex items-center px-1 py-3 text-xs font-medium border-b transition-colors ${
                activeTab === 'repos'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Repos
            </button>
            
            {selectedRepo && (
              <button
                onClick={() => setActiveTab('viewer')}
                className={`flex items-center px-1 py-3 text-xs font-medium border-b transition-colors ${
                  activeTab === 'viewer'
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {selectedRepo.name}
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center px-1 py-3 text-xs font-medium border-b transition-colors ${
                activeTab === 'logs'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Logs
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'repos' && (
          <RepositoryList
            githubService={githubService}
            onSelectRepo={handleSelectRepo}
          />
        )}
        
        {activeTab === 'viewer' && selectedRepo && (
          <RepositoryViewer
            repository={selectedRepo}
            githubService={githubService}
            user={user}
          />
        )}
        
        {activeTab === 'logs' && (
          <EvolutionLogs selectedRepo={selectedRepo} />
        )}
      </main>
    </div>
  )
}

