'use client'

import { useState } from 'react'
import { GitHubService } from '@/lib/github'

interface FileTreeProps {
  files: any[]
  selectedFiles: string[]
  onFileSelect: (files: string[]) => void
  githubService: GitHubService
  repository: any
}

export function FileTree({ files, selectedFiles, onFileSelect, githubService, repository }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [folderContents, setFolderContents] = useState<Record<string, any[]>>({})

  const toggleFolder = async (folderPath: string) => {
    const newExpanded = new Set(expandedFolders)
    
    if (expandedFolders.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
      
      // Load folder contents if not already loaded
      if (!folderContents[folderPath]) {
        try {
          const contents = await githubService.getRepositoryContents(
            repository.owner.login,
            repository.name,
            folderPath
          )
          setFolderContents(prev => ({
            ...prev,
            [folderPath]: Array.isArray(contents) ? contents : [contents]
          }))
        } catch (error) {
          console.error(`Failed to load folder contents for ${folderPath}:`, error)
        }
      }
    }
    
    setExpandedFolders(newExpanded)
  }

  const toggleFileSelection = (filePath: string) => {
    const newSelection = selectedFiles.includes(filePath)
      ? selectedFiles.filter(f => f !== filePath)
      : [...selectedFiles, filePath]
    onFileSelect(newSelection)
  }

  const isCodeFile = (filename: string) => {
    const codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
      '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.clj',
      '.vue', '.svelte', '.html', '.css', '.scss', '.less', '.sql',
      '.sh', '.bash', '.ps1', '.yml', '.yaml', '.json', '.xml',
      '.md', '.txt', '.dockerfile', '.gitignore'
    ]
    return codeExtensions.some(ext => filename.toLowerCase().endsWith(ext))
  }

  const renderFileItem = (file: any, depth = 0) => {
    const isFolder = file.type === 'dir'
    const isExpanded = expandedFolders.has(file.path)
    const isSelected = selectedFiles.includes(file.path)
    const isSelectable = !isFolder && isCodeFile(file.name)

    return (
      <div key={file.path}>
        <div
          className={`flex items-center space-x-2 py-2 px-3 rounded-md cursor-pointer hover:bg-accent/50 transition-colors ${
            isSelected ? 'bg-primary/20' : ''
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(file.path)
            } else {
              toggleFileSelection(file.path)
            }
          }}
        >
          <span className="text-xs text-muted-foreground mr-2">
            {isFolder ? (isExpanded ? '📂' : '📁') : '📄'}
          </span>
          
          <span className={`flex-1 text-sm ${!isSelectable && !isFolder ? 'text-muted-foreground' : ''}`}>
            {file.name}
          </span>
          
          {isSelectable && isSelected && (
            <span className="text-xs text-primary">✓</span>
          )}
          
          {!isSelectable && !isFolder && (
            <span className="text-xs text-muted-foreground">Not selectable</span>
          )}
        </div>
        
        {isFolder && isExpanded && folderContents[file.path] && (
          <div>
            {folderContents[file.path].map(childFile => 
              renderFileItem(childFile, depth + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  const selectAllCodeFiles = () => {
    const getAllCodeFiles = (fileList: any[]): string[] => {
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
  }

  const clearSelection = () => {
    onFileSelect([])
  }

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={selectAllCodeFiles}
            className="px-3 py-1 text-sm bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors"
          >
            Select All Code Files
          </button>
          <button
            onClick={clearSelection}
            className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
          >
            Clear Selection
          </button>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedFiles.length} selected
        </div>
      </div>

      {/* File Tree */}
      <div className="border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Folder className="h-8 w-8 mx-auto mb-2" />
            <p>No files found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map(file => renderFileItem(file))}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selectedFiles.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
          <div className="space-y-1">
            {selectedFiles.slice(0, 5).map(file => (
              <div key={file} className="text-xs text-muted-foreground">
                {file}
              </div>
            ))}
            {selectedFiles.length > 5 && (
              <div className="text-xs text-muted-foreground">
                ... and {selectedFiles.length - 5} more files
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
