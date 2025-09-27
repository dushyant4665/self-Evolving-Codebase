'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { History, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, GitPullRequest, Zap } from 'lucide-react'

interface EvolutionLogsProps {
  selectedRepo: any
}

export function EvolutionLogs({ selectedRepo }: EvolutionLogsProps) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'pr_created' | 'merged' | 'rejected'>('all')

  useEffect(() => {
    loadLogs()
  }, [selectedRepo, filter])

  const loadLogs = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('evolution_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (selectedRepo) {
        query = query.eq('repository_id', selectedRepo.id.toString())
      }

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      setLogs(data || [])
    } catch (error) {
      console.error('Failed to load evolution logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />
      case 'pr_created':
        return <GitPullRequest className="h-4 w-4 text-blue-400" />
      case 'tests_passed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'tests_failed':
        return <XCircle className="h-4 w-4 text-red-400" />
      case 'merged':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-muted-foreground bg-muted'
      case 'pr_created':
        return 'text-foreground bg-secondary'
      case 'tests_passed':
        return 'text-foreground bg-accent'
      case 'tests_failed':
        return 'text-muted-foreground bg-muted'
      case 'merged':
        return 'text-foreground bg-accent'
      case 'rejected':
        return 'text-muted-foreground bg-muted'
      default:
        return 'text-muted-foreground bg-muted'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getEvolutionStats = () => {
    const stats = {
      total: logs.length,
      pending: logs.filter(log => log.status === 'pending').length,
      pr_created: logs.filter(log => log.status === 'pr_created').length,
      merged: logs.filter(log => log.status === 'merged').length,
      rejected: logs.filter(log => log.status === 'rejected').length,
    }
    return stats
  }

  const stats = getEvolutionStats()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="border border-border rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <History className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Evolution History</h2>
          </div>
          {selectedRepo && (
            <div className="text-sm text-muted-foreground">
              Repository: {selectedRepo.name}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.pr_created}</div>
            <div className="text-sm text-muted-foreground">PRs Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.merged}</div>
            <div className="text-sm text-muted-foreground">Merged</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Filter:</span>
          {['all', 'pending', 'pr_created', 'merged', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {formatStatus(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Evolution Logs */}
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="border border-border rounded-lg p-12 text-center">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Evolution History</h3>
            <p className="text-muted-foreground">
              {selectedRepo
                ? 'No evolutions found for this repository. Start by selecting some files and clicking "Evolve Codebase".'
                : 'Select a repository and start evolving your codebase to see the history here.'
              }
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="border border-border rounded-lg p-6 hover:bg-accent/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {formatStatus(log.status)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {log.pr_url && (
                  <a
                    href={log.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    View PR
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm leading-relaxed">{log.suggestion_text}</p>
              </div>

              {log.diff_content && (
                <details className="mt-4">
                  <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    View Changes ({JSON.parse(log.diff_content).length} file(s))
                  </summary>
                  <div className="mt-3 space-y-2">
                    {JSON.parse(log.diff_content).map((file: any, index: number) => (
                      <div key={index} className="bg-muted/30 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-mono">{file.path}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            file.action === 'create' ? 'text-green-400 bg-green-400/20' :
                            file.action === 'modify' ? 'text-blue-400 bg-blue-400/20' :
                            'text-red-400 bg-red-400/20'
                          }`}>
                            {file.action}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {file.content.split('\n').length} lines
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
