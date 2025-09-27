import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai'
import { GitHubService } from '@/lib/github'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/evolution/suggest - Request received')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { repository, filePaths, accessToken } = body

    if (!repository || !filePaths || !accessToken) {
      console.error('Missing parameters:', { repository: !!repository, filePaths: !!filePaths, accessToken: !!accessToken })
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Initialize services
    console.log('Initializing GitHub service...')
    const githubService = new GitHubService(accessToken)
    
    console.log('Initializing AI service...')
    const aiService = new AIService()

    // Get file contents
    const fileContents = await Promise.all(
      filePaths.map(async (filePath: string) => {
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

    // Generate AI suggestion
    const repoContext = `Repository: ${repository.full_name}\nDescription: ${repository.description || 'No description'}\nLanguage: ${repository.language || 'Unknown'}`
    const suggestion = await aiService.generateCodeSuggestion(repoContext, fileContents)

    // Store suggestion in database
    const { data: evolutionLog, error } = await supabase
      .from('evolution_logs')
      .insert({
        repository_id: repository.id.toString(),
        suggestion_text: suggestion.description,
        status: 'pending',
        diff_content: JSON.stringify(suggestion.files),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      suggestion: { ...suggestion, logId: evolutionLog.id }
    })

  } catch (error) {
    console.error('Evolution suggestion error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate suggestion' },
      { status: 500 }
    )
  }
}
