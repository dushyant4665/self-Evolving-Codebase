'use client'

import { useState, useEffect } from 'react'
import { GitHubService } from '@/lib/github'
import { GitBranch, Star, Clock, ChevronRight } from 'lucide-react'

interface RepositoryListProps {
  githubService: GitHubService
  onSelectRepo: (repo: any) => void
}

export function RepositoryList({ githubService, onSelectRepo }: RepositoryListProps) {
  const [repositories, setRepositories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRepositories()
  }, [githubService])

  const loadRepositories = async () => {
    try {
      setLoading(true)
      const repos = await githubService.getRepositories()
      setRepositories(repos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Repositories</h2>
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
              <div className="flex space-x-4">
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={loadRepositories}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Repositories</h2>
        <p className="text-muted-foreground">{repositories.length} repositories</p>
      </div>

      <div className="grid gap-4">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            onClick={() => onSelectRepo(repo)}
            className="border border-border rounded-lg p-6 hover:bg-accent/50 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {repo.name}
                  </h3>
                  {repo.private && (
                    <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                      Private
                    </span>
                  )}
                </div>
                
                {repo.description && (
                  <p className="text-muted-foreground mb-4">{repo.description}</p>
                )}
                
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  {repo.language && (
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span>{repo.language}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <GitBranch className="h-4 w-4" />
                    <span>{repo.forks_count}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {repositories.length === 0 && (
        <div className="text-center py-12">
          <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No repositories found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Create some repositories on GitHub to get started
          </p>
        </div>
      )}
    </div>
  )
}
