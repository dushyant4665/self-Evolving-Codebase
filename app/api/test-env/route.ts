import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasGemini: !!process.env.GEMINI_API_KEY,
    hasDeepSeek: !!process.env.DEEPSEEK_API_KEY,
    hasOpenRouter: !!process.env.OPENROUTER_API_KEY,
    geminiKey: process.env.GEMINI_API_KEY ? 'Present' : 'Missing',
    deepseekKey: process.env.DEEPSEEK_API_KEY ? 'Present' : 'Missing',
    openrouterKey: process.env.OPENROUTER_API_KEY ? 'Present' : 'Missing',
  })
}
