'use client'

import { useState, useEffect } from 'react'
import { GitHubService } from '@/lib/github'
import { supabase } from '@/lib/supabase'
import { FileTree } from './FileTree'
import { CodePreviewModal } from './CodePreviewModal'
import { ExternalLink } from 'lucide-react'

interface RepositoryViewerProps {
  repository: any
  githubService: GitHubService
  user?: any
}

export function RepositoryViewer({ repository, githubService, user }: RepositoryViewerProps) {
  const [files, setFiles] = useState<any[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [evolving, setEvolving] = useState(false)
  const [suggestion, setSuggestion] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [evolutionStatus, setEvolutionStatus] = useState<string>('')
  const [creatingPR, setCreatingPR] = useState(false)

  useEffect(() => {
    loadRepositoryFiles()
  }, [repository])

  const loadRepositoryFiles = async () => {
    try {
      setLoading(true)
      const contents = await githubService.getRepositoryContents(
        repository.owner.login,
        repository.name
      )
      setFiles(Array.isArray(contents) ? contents : [contents])
    } catch (error) {
      console.error('Failed to load repository files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEvolveCodebase = async () => {
    // If no files selected, find actual code files
    let filesToAnalyze = selectedFiles.length > 0 ? selectedFiles : []
    
    if (filesToAnalyze.length === 0) {
      // Find code files automatically - NO README, NO CONFIG FILES
      console.log('🔍 Available files:', files.map(f => ({ name: f.name, path: f.path })))
      
      const codeFiles = files.filter(file => {
        const name = (file.name || file.path || '').toLowerCase()
        const isCodeFile = (
          name.endsWith('.ts') || name.endsWith('.tsx') || 
          name.endsWith('.js') || name.endsWith('.jsx') ||
          name.endsWith('.py') || name.endsWith('.java') ||
          name.endsWith('.cpp') || name.endsWith('.c')
        )
        const isNotConfig = !name.includes('readme') && 
                           !name.includes('.md') && 
                           !name.includes('package.json') &&
                           !name.includes('tsconfig') &&
                           !name.includes('next.config') &&
                           !name.includes('tailwind.config') &&
                           !name.includes('postcss.config') &&
                           !name.includes('.gitignore')
        
        console.log(`File: ${name}, isCodeFile: ${isCodeFile}, isNotConfig: ${isNotConfig}`)
        return isCodeFile && isNotConfig
      }).map(f => f.path || f.name)
      
      console.log('🎯 Selected code files:', codeFiles)
      filesToAnalyze = codeFiles.length > 0 ? codeFiles.slice(0, 5) : []
      
      if (filesToAnalyze.length === 0) {
        // Force select ANY code files from repository
        const allCodeFiles = files.filter(file => {
          const name = (file.name || file.path || '').toLowerCase()
          return name && (
            name.endsWith('.ts') || name.endsWith('.tsx') || 
            name.endsWith('.js') || name.endsWith('.jsx')
          )
        }).map(f => f.path || f.name)
        
        console.log('🚨 Fallback code files:', allCodeFiles)
        filesToAnalyze = allCodeFiles.slice(0, 3) // Take first 3 code files
      }
    }
    
    if (filesToAnalyze.length === 0) {
      alert('No files available to analyze')
      return
    }

    setEvolving(true)
    setEvolutionStatus('Analyzing codebase...')

    try {
      // Get file contents
      const fileContents = await Promise.all(
        filesToAnalyze.map(async (filePath) => {
          try {
            const { content } = await githubService.getFileContent(
              repository.owner.login,
              repository.name,
              filePath
            )
            return { path: filePath, content }
          } catch (error) {
            console.error(`Failed to get content for ${filePath}:`, error)
            return { path: filePath, content: '// Failed to load content' }
          }
        })
      )

      setEvolutionStatus('Generating AI suggestions...')
      
      // Get access token
      let accessToken = user?.access_token
      if (!accessToken) {
        const githubUser = localStorage.getItem('github_user')
        if (githubUser) {
          accessToken = JSON.parse(githubUser).access_token
        }
      }
      
      if (!accessToken) {
        throw new Error('No access token found. Please login again.')
      }
      
      // Call real AI API to generate suggestions
      const response = await fetch('/api/evolution/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repository,
          filePaths: filesToAnalyze,
          accessToken
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate AI suggestions')
      }

      const result = await response.json()
      const aiSuggestion = result.suggestion
      setSuggestion(aiSuggestion)
      
      // Store suggestion in database
      const { data: evolutionLog } = await supabase
        .from('evolution_logs')
        .insert({
          repository_id: repository.id.toString(),
          suggestion_text: aiSuggestion.description,
          status: 'pending',
          diff_content: JSON.stringify(aiSuggestion.files),
        })
        .select()
        .single()

      if (evolutionLog) {
        setSuggestion({ ...aiSuggestion, logId: evolutionLog.id })
      }
      
      setShowPreview(true)
      setEvolutionStatus('Suggestion generated successfully!')
      
    } catch (error) {
      console.error('Evolution error:', error)
      setEvolutionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setEvolving(false)
    }
  }

  const handleCreatePR = async () => {
    setCreatingPR(true)
    setEvolutionStatus('Creating pull request...')
    if (!suggestion) return

    try {
      setEvolutionStatus('Creating pull request...')
      
      // Create a new branch
      const branchName = `dushyant4665-${Date.now()}`
      const defaultBranch = await githubService.getDefaultBranch(
        repository.owner.login,
        repository.name
      )
      const latestSha = await githubService.getLatestCommitSha(
        repository.owner.login,
        repository.name,
        defaultBranch
      )
      
      await githubService.createBranch(
        repository.owner.login,
        repository.name,
        branchName,
        latestSha
      )

      // Update files with real changes
      for (const file of suggestion.files) {
        if (file.action === 'modify' || file.action === 'create') {
          try {
            let fileSha = ''
            
            // For modify action, get existing file SHA
            if (file.action === 'modify') {
              try {
                const { sha } = await githubService.getFileContent(
                  repository.owner.login,
                  repository.name,
                  file.path
                )
                fileSha = sha
              } catch (error) {
                console.log(`File ${file.path} doesn't exist, creating new file`)
                // File doesn't exist, treat as create
              }
            }

            // Create/update the file
            await githubService.updateFile(
              repository.owner.login,
              repository.name,
              file.path,
              file.content,
              `AI Evolution: ${suggestion.title}`,
              fileSha,
              branchName
            )
            
            console.log(`Successfully updated ${file.path}`)
          } catch (error) {
            console.error(`Failed to update file ${file.path}:`, error)
          }
        }
      }
      
      // Also update README with AI evolution note
      try {
        const { content: readmeContent, sha: readmeSha } = await githubService.getFileContent(
          repository.owner.login,
          repository.name,
          'README.md'
        )
        
        const updatedReadme = readmeContent + `\n\n## 🤖 AI Evolution\n\nThis repository was enhanced by AI on ${new Date().toLocaleDateString()}.\n\n**Latest Enhancement:** ${suggestion.title}\n${suggestion.description}`
        
        await githubService.updateFile(
          repository.owner.login,
          repository.name,
          'README.md',
          updatedReadme,
          `AI Evolution: Update README with enhancement details`,
          readmeSha,
          branchName
        )
        
        console.log('Successfully updated README.md')
      } catch (error) {
        console.error('Failed to update README:', error)
      }

      // Create pull request
      const prBody = `## AI-Generated Evolution

**Type:** ${suggestion.type}

**Description:**
${suggestion.description}

**Reasoning:**
${suggestion.reasoning}

---
*This pull request was automatically generated by the Self-Evolving Codebase system.*`

      const pr = await githubService.createPullRequest(
        repository.owner.login,
        repository.name,
        suggestion.title,
        prBody,
        branchName,
        defaultBranch
      )

      // Update evolution log
      if (suggestion.logId) {
        await supabase
          .from('evolution_logs')
          .update({
            status: 'pr_created',
            pr_url: pr.html_url,
          })
          .eq('id', suggestion.logId)
      }

      setEvolutionStatus('Pull request created successfully!')
      
      // Open PR in new tab immediately
      if (pr.html_url) {
        window.open(pr.html_url, '_blank')
      }
      
      setShowPreview(false)
      setSuggestion(null)

    } catch (error) {
      console.error('PR creation error:', error)
      setEvolutionStatus(`Error: ${error instanceof Error ? error.message : 'Failed to create PR'}`)
    } finally {
      setCreatingPR(false)
    }
  }

  const handleRejectSuggestion = async () => {
    if (suggestion?.logId) {
      await supabase
        .from('evolution_logs')
        .update({ status: 'rejected' })
        .eq('id', suggestion.logId)
    }
    setSuggestion(null)
    setShowPreview(false)
    setEvolutionStatus('Suggestion rejected')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border border-border rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Repository Header */}
      <div className="border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{repository.full_name}</h2>
            {repository.description && (
              <p className="text-muted-foreground mb-4">{repository.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Language: {repository.language || 'Unknown'}</span>
              <span>Default Branch: {repository.default_branch}</span>
              <a
                href={repository.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:underline"
              >
                View on GitHub
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Evolution Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleEvolveCodebase}
              disabled={evolving}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground font-medium rounded border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {evolving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Evolving...
                </>
              ) : (
                <>
                  Evolve Codebase
                </>
              )}
            </button>
            
            <div className="text-sm text-muted-foreground">
              {selectedFiles.length} file(s) selected
            </div>
          </div>

          {evolutionStatus && (
            <div className={`text-sm ${
              evolutionStatus.startsWith('Error') ? 'text-muted-foreground' : 'text-foreground'
            }`}>
              <span>{evolutionStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* File Tree */}
      <div className="border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Repository Files
        </h3>
        <FileTree
          files={files}
          selectedFiles={selectedFiles}
          onFileSelect={setSelectedFiles}
          githubService={githubService}
          repository={repository}
        />
      </div>

      {/* Code Preview Modal */}
      {showPreview && suggestion && (
        <CodePreviewModal
          suggestion={suggestion}
          onAccept={handleCreatePR}
          onReject={handleRejectSuggestion}
          onClose={() => setShowPreview(false)}
          isCreatingPR={creatingPR}
        />
      )}
    </div>
  )
}
