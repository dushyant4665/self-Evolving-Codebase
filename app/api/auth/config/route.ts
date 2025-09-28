import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'GitHub client ID not configured' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      clientId,
      redirectUri: process.env.NODE_ENV === 'production' 
        ? 'https://self-evolving-codebase.vercel.app/auth/callback'
        : 'http://localhost:3000/auth/callback'
    })
  } catch (error) {
    console.error('Error in auth config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
