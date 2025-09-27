'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { GitHubService } from '@/lib/github'

// Proper TypeScript interfaces
interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  size?: number
  download_url?: string
  sha: string
}

interface Repository {
  name: string
  owner: {
    login: string
  }
  full_name: string
}

interface FileTreeProps {
  files: GitHubFile[]
  selectedFiles: string[]
  onFileSelect: (files: string[]) => void
  githubService: GitHubService
  repository: Repository
}

interface LoadingState {
  [folderPath: string]: boolean
}

interface ErrorState {
  [folderPath: string]: string | null
}

export function FileTree({ files, selectedFiles, onFileSelect, githubService, repository }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [folderContents, setFolderContents] = useState<Record<string, GitHubFile[]>>({})
  const [loadingState, setLoadingState] = useState<LoadingState>({})
  const [errorState, setErrorState] = useState<ErrorState>({})
  
  // Cleanup ref for cancelled requests
  const abortControllerRef = useRef<Map<string, AbortController>>(new Map())

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current.forEach(controller => controller.abort())
      abortControllerRef.current.clear()
    }
  }, [])

  const toggleFolder = useCallback(async (folderPath: string) => {
    const newExpanded = new Set(expandedFolders)
    
    if (expandedFolders.has(folderPath)) {
      newExpanded.delete(folderPath)
      // Cancel any pending request for this folder
      const controller = abortControllerRef.current.get(folderPath)
      if (controller) {
        controller.abort()
        abortControllerRef.current.delete(folderPath)
      }
    } else {
      newExpanded.add(folderPath)
      
      // Load folder contents if not already loaded
      if (!folderContents[folderPath] && !loadingState[folderPath]) {
        // Cancel any existing request for this folder
        const existingController = abortControllerRef.current.get(folderPath)
        if (existingController) {
          existingController.abort()
        }

        const controller = new AbortController()
        abortControllerRef.current.set(folderPath, controller)

        setLoadingState(prev => ({ ...prev, [folderPath]: true }))
        setErrorState(prev => ({ ...prev, [folderPath]: null }))

        try {
          const contents = await githubService.getRepositoryContents(
            repository.owner.login,
            repository.name,
            folderPath
          )
          
          if (!controller.signal.aborted) {
            const fileArray = Array.isArray(contents) ? contents : [contents]
            setFolderContents(prev => ({
              ...prev,
              [folderPath]: fileArray as GitHubFile[]
            }))
          }
        } catch (error) {
          if (!controller.signal.aborted) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load folder contents'
            console.error(`Failed to load folder contents for ${folderPath}:`, error)
            setErrorState(prev => ({ ...prev, [folderPath]: errorMessage }))
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoadingState(prev => ({ ...prev, [folderPath]: false }))
          }
          abortControllerRef.current.delete(folderPath)
        }
      }
    }
    
    setExpandedFolders(newExpanded)
  }, [expandedFolders, folderContents, loadingState, githubService, repository.owner.login, repository.name])

  const toggleFileSelection = useCallback((filePath: string) => {
    const newSelection = selectedFiles.includes(filePath)
      ? selectedFiles.filter(f => f !== filePath)
      : [...selectedFiles, filePath]
    onFileSelect(newSelection)
  }, [selectedFiles, onFileSelect])

  // Memoized code file detection
  const codeExtensions = useMemo(() => new Set([
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
    '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.clj',
    '.vue', '.svelte', '.html', '.css', '.scss', '.less', '.sql',
    '.sh', '.bash', '.ps1', '.yml', '.yaml', '.json', '.xml',
    '.md', '.txt', '.dockerfile', '.gitignore'
  ]), [])

  const isCodeFile = useCallback((filename: string) => {
    const lowerName = filename.toLowerCase()
    return Array.from(codeExtensions).some(ext => lowerName.endsWith(ext))
  }, [codeExtensions])

  const renderFileItem = useCallback((file: GitHubFile, depth = 0): JSX.Element => {
    const isFolder = file.type === 'dir'
    const isExpanded = expandedFolders.has(file.path)
    const isSelected = selectedFiles.includes(file.path)
    const isSelectable = !isFolder && isCodeFile(file.name)
    const isLoading = loadingState[file.path]
    const hasError = errorState[file.path]

    const handleClick = useCallback(() => {
      if (isFolder) {
        toggleFolder(file.path)
      } else if (isSelectable) {
        toggleFileSelection(file.path)
      }
    }, [isFolder, isSelectable, file.path])

    return (
      <div key={file.path}>
        <div
          className={`flex items-center space-x-2 py-2 px-3 rounded-md cursor-pointer hover:bg-accent/50 transition-colors ${
            isSelected ? 'bg-primary/20' : ''
          } ${!isSelectable && !isFolder ? 'cursor-default' : ''}`}
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={handleClick}
          role={isFolder ? 'button' : isSelectable ? 'checkbox' : 'text'}
          aria-expanded={isFolder ? isExpanded : undefined}
          aria-checked={isSelectable ? isSelected : undefined}
          tabIndex={isFolder || isSelectable ? 0 : -1}
        >
          <span className="text-xs text-muted-foreground mr-2">
            {isFolder ? (
              isLoading ? '⏳' : isExpanded ? '📂' : '📁'
            ) : '📄'}
          </span>
          
          <span className={`flex-1 text-sm ${!isSelectable && !isFolder ? 'text-muted-foreground' : ''}`}>
            {file.name}
            {file.size && !isFolder && (
              <span className="text-xs text-muted-foreground ml-2">
                ({(file.size / 1024).toFixed(1)}KB)
              </span>
            )}
          </span>
          
          {isLoading && (
            <span className="text-xs text-blue-500">Loading...</span>
          )}
          
          {hasError && (
            <span className="text-xs text-red-500" title={hasError}>⚠️</span>
          )}
          
          {isSelectable && isSelected && (
            <span className="text-xs text-primary">✓</span>
          )}
          
          {!isSelectable && !isFolder && (
            <span className="text-xs text-muted-foreground">Not selectable</span>
          )}
        </div>
        
        {isFolder && isExpanded && (
          <div>
            {hasError ? (
              <div 
                className="text-xs text-red-500 ml-8 py-2 cursor-pointer hover:text-red-400"
                onClick={() => toggleFolder(file.path)}
              >
                Error loading folder. Click to retry.
              </div>
            ) : folderContents[file.path] ? (
              folderContents[file.path].map(childFile => 
                renderFileItem(childFile, depth + 1)
              )
            ) : isLoading ? (
              <div className="text-xs text-muted-foreground ml-8 py-2">
                Loading folder contents...
              </div>
            ) : null}
          </div>
        )}
      </div>
    )
  }, [
    expandedFolders, selectedFiles, isCodeFile, loadingState, errorState,
    toggleFolder, toggleFileSelection, folderContents
  ])

  const selectAllCodeFiles = useCallback(() => {
    const getAllCodeFiles = (fileList: GitHubFile[]): string[] => {
      let codeFiles: string[] = []
      
      fileList.forEach(file => {
        if (file.type === 'file' && isCodeFile(file.name)) {
          codeFiles.push(file.path)
        } else if (file.type === 'dir' && folderContents[file.path]) {
          codeFiles = codeFiles.concat(getAllCodeFiles(folderContents[file.path]))
        }
      })
      
      return codeFiles
    }

    const allCodeFiles = getAllCodeFiles(files)
    onFileSelect(allCodeFiles)
  }, [files, isCodeFile, folderContents, onFileSelect])

  const clearSelection = useCallback(() => {
    onFileSelect([])
  }, [onFileSelect])

  // Memoized file statistics
  const fileStats = useMemo(() => {
    const stats = {
      totalFiles: 0,
      codeFiles: 0,
      selectedCodeFiles: 0,
      totalSize: 0
    }

    const countFiles = (fileList: GitHubFile[]) => {
      fileList.forEach(file => {
        if (file.type === 'file') {
          stats.totalFiles++
          stats.totalSize += file.size || 0
          if (isCodeFile(file.name)) {
            stats.codeFiles++
            if (selectedFiles.includes(file.path)) {
              stats.selectedCodeFiles++
            }
          }
        } else if (file.type === 'dir' && folderContents[file.path]) {
          countFiles(folderContents[file.path])
        }
      })
    }

    countFiles(files)
    return stats
  }, [files, folderContents, selectedFiles, isCodeFile])

  return (
    <div className="space-y-4">
      {/* Enhanced Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={selectAllCodeFiles}
            className="px-3 py-1 text-sm bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={fileStats.codeFiles === 0}
            title={`Select all ${fileStats.codeFiles} code files`}
          >
            Select All ({fileStats.codeFiles})
          </button>
          <button
            onClick={clearSelection}
            className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedFiles.length === 0}
          >
            Clear Selection
          </button>
        </div>
        <div className="text-sm text-muted-foreground">
          {fileStats.selectedCodeFiles} of {fileStats.codeFiles} selected
          {fileStats.totalSize > 0 && (
            <span className="ml-2">
              ({(fileStats.totalSize / 1024 / 1024).toFixed(1)}MB total)
            </span>
          )}
        </div>
      </div>

      {/* File Tree */}
      <div className="border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-2xl">📁</span>
            <p>No files found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map(file => renderFileItem(file))}
          </div>
        )}
      </div>

      {/* Enhanced Selection Summary */}
      {selectedFiles.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length}):</h4>
            <button
              onClick={clearSelection}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {selectedFiles.slice(0, 10).map(file => (
              <div 
                key={file} 
                className="flex items-center justify-between text-xs text-muted-foreground group"
              >
                <span className="truncate">{file}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFileSelection(file)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 ml-2 transition-opacity"
                  title="Remove from selection"
                >
                  ✕
                </button>
              </div>
            ))}
            {selectedFiles.length > 10 && (
              <div className="text-xs text-muted-foreground font-medium">
                ... and {selectedFiles.length - 10} more files
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}