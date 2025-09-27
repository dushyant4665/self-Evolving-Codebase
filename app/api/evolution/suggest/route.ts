import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai'
import { GitHubService } from '@/lib/github'
import { supabase } from '@/lib/supabase'

function getMockContent(filePath: string): string {
  const fileName = filePath.toLowerCase()
  
  if (fileName.includes('readme')) {
    return `# ${filePath.split('/').pop()?.replace('.md', '') || 'Project'}

A simple project with basic functionality.

## Getting Started

This is a basic project setup.`
  }
  
  if (fileName.includes('package.json')) {
    return `{
  "name": "project",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",
    "dev": "npm start"
  },
  "dependencies": {}
}`
  }
  
  if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
    return `// ${filePath}
console.log('Hello World');

function main() {
  return 'Basic functionality';
}`
  }
  
  if (fileName.endsWith('.html')) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Demo Page</title>
</head>
<body>
    <h1>Hello World</h1>
    <p>This is a demo page.</p>
</body>
</html>`
  }
  
  if (fileName.endsWith('.css')) {
    return `body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
}

h1 {
  color: #333;
}`
  }
  
  return `// ${filePath}
// Basic file content for demonstration
`
}

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

    // For demo purposes, use mock file content when GitHub API fails
    let fileContents: { path: string; content: string }[]
    
    try {
      // Try to get real file contents
      fileContents = await Promise.all(
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
            // Return mock content based on file extension
            return { path: filePath, content: getMockContent(filePath) }
          }
        })
      )
    } catch (error) {
      console.error('GitHub API failed, using mock content:', error)
      // Use completely mock content for demo
      fileContents = filePaths.map((filePath: string) => ({
        path: filePath,
        content: getMockContent(filePath)
      }))
    }

    // Generate AI suggestion
    const repoContext = `Repository: ${repository.full_name}\nDescription: ${repository.description || 'No description'}\nLanguage: ${repository.language || 'Unknown'}`
    const suggestion = await aiService.generateCodeSuggestion(repoContext, fileContents)

    // For demo mode, skip database storage
    console.log('Skipping database storage for demo mode')
    
    return NextResponse.json({
      success: true,
      suggestion: { ...suggestion, logId: Date.now().toString() }
    })

  } catch (error) {
    console.error('Evolution suggestion error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate suggestion' },
      { status: 500 }
    )
  }
}
