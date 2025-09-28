import { NextRequest, NextResponse } from 'next/server'

interface GitHubTokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

interface GitHubUser {
  id: number
  login: string
  name?: string
  email?: string
  avatar_url: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Valid authorization code is required' },
        { status: 400 }
      )
    }

    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'GitHub OAuth not configured' },
        { status: 500 }
      )
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData: GitHubTokenResponse = await tokenResponse.json()
    
    if (tokenData.error) {
      console.error('GitHub token error:', tokenData)
      throw new Error(tokenData.error_description || tokenData.error)
    }

    if (!tokenData.access_token) {
      console.error('No access token received:', tokenData)
      throw new Error('No access token received from GitHub')
    }

    const accessToken = tokenData.access_token

    // Get user information
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Self-Evolving-Codebase'
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('GitHub user API error:', errorText)
      throw new Error(`Failed to fetch user information: ${userResponse.status}`)
    }

    const user: GitHubUser = await userResponse.json()

    return NextResponse.json({
      user,
      accessToken,
    })

  } catch (error) {
    console.error('GitHub auth error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    )
  }
}

