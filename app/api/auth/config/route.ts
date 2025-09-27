import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    clientId: process.env.GITHUB_CLIENT_ID,
  })
}
