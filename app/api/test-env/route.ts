import { NextResponse } from 'next/server'

interface EnvironmentStatus {
  hasGemini: boolean
  hasDeepSeek: boolean
  hasOpenRouter: boolean
  hasGitHub: boolean
  hasSupabase: boolean
  geminiKey: string
  deepseekKey: string
  openrouterKey: string
  githubClientId: string
  supabaseUrl: string
}

export async function GET() {
  const status: EnvironmentStatus = {
    hasGemini: !!process.env.GEMINI_API_KEY,
    hasDeepSeek: !!process.env.DEEPSEEK_API_KEY,
    hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
    hasGitHub: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    hasSupabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    geminiKey: process.env.GEMINI_API_KEY ? 'Present' : 'Missing',
    deepseekKey: process.env.DEEPSEEK_API_KEY ? 'Present' : 'Missing',
    openrouterKey: process.env.OPENROUTER_API_KEY ? 'Present' : 'Missing',
    githubClientId: process.env.GITHUB_CLIENT_ID ? 'Present' : 'Missing',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing',
  }
  
  return NextResponse.json(status)
}
