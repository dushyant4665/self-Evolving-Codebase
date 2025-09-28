'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { X, Check, XIcon, Eye, Code, FileText } from 'lucide-react'

interface SuggestionFile {
  path: string
  action: 'create' | 'modify' | 'delete'
  content: string
}

interface Suggestion {
  title: string
  type: 'feature' | 'bugfix' | 'refactor' | 'optimization'
  description: string
  reasoning: string
  files: SuggestionFile[]
}

interface CodePreviewModalProps {
  suggestion: Suggestion
  onAccept: () => void
  onReject: () => void
  onClose: () => void
  isCreatingPR?: boolean
}

export function CodePreviewModal({ suggestion, onAccept, onReject, onClose, isCreatingPR = false }: CodePreviewModalProps) {
  const [selectedFile, setSelectedFile] = useState(0)

  const getTypeColor = useCallback((type: Suggestion['type']): string => {
    switch (type) {
      case 'feature': return 'text-foreground bg-secondary'
      case 'bugfix': return 'text-foreground bg-muted'
      case 'refactor': return 'text-foreground bg-accent'
      case 'optimization': return 'text-foreground bg-secondary'
      default: return 'text-muted-foreground bg-muted'
    }
  }, [])

  const getActionColor = useCallback((action: SuggestionFile['action']): string => {
    switch (action) {
      case 'create': return 'text-foreground bg-secondary'
      case 'modify': return 'text-foreground bg-accent'
      case 'delete': return 'text-muted-foreground bg-muted'
      default: return 'text-muted-foreground bg-muted'
    }
  }, [])

  const selectedFileData = useMemo(() => suggestion.files[selectedFile], [suggestion.files, selectedFile])
  
  const handleFileSelect = useCallback((index: number) => {
    setSelectedFile(index)
  }, [])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // Handle escape key globally
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [onClose])

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className="bg-background border border-border rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <Eye className="h-6 w-6 text-primary" />
            <div>
              <h2 id="modal-title" className="text-xl font-bold">{suggestion.title}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(suggestion.type)}`}>
                  {suggestion.type.toUpperCase()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {suggestion.files.length} file(s) affected
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-border bg-muted/30 p-4 overflow-y-auto">
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                Description
              </h3>
              <p id="modal-description" className="text-sm leading-relaxed">{suggestion.description}</p>
            </div>

            {/* Reasoning */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                Reasoning
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{suggestion.reasoning}</p>
            </div>

            {/* File List */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Files to Change
              </h3>
              <div className="space-y-2" role="tablist" aria-label="File selection">
                {suggestion.files.map((file: SuggestionFile, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleFileSelect(index)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      selectedFile === index
                        ? 'bg-primary/20 border border-primary/30'
                        : 'bg-background hover:bg-accent/50 border border-border'
                    }`}
                    role="tab"
                    aria-selected={selectedFile === index}
                    aria-controls={`file-content-${index}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{file.path}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(file.action)}`}>
                        {file.action}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <FileText className="h-3 w-3 mr-1" />
                      {file.content.split('\n').length} lines
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Code Preview */}
          <div className="flex-1 flex flex-col">
            <div className="border-b border-border p-4 bg-muted/20">
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span className="font-medium">{selectedFileData?.path}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(selectedFileData?.action || 'modify')}`}>
                  {selectedFileData?.action}
                </span>
              </div>
            </div>
            
            <div 
              className="flex-1 overflow-auto"
              role="tabpanel"
              id={`file-content-${selectedFile}`}
              aria-labelledby={`file-tab-${selectedFile}`}
            >
              <pre className="p-4 text-sm font-mono bg-background text-foreground overflow-auto h-full">
                <code>{selectedFileData?.content || 'No content available'}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
          <div className="text-sm text-muted-foreground">
            Review the changes carefully before creating a pull request
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onReject}
              disabled={isCreatingPR}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-accent border border-border rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <XIcon className="h-4 w-4 mr-2" />
              Reject
            </button>
            <button
              onClick={onAccept}
              disabled={isCreatingPR}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {isCreatingPR ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                  Creating PR...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Pull Request
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
