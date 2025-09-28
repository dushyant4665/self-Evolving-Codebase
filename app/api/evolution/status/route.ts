import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface StatusUpdateRequest {
  pr_url: string
  status: string
}

export async function POST(request: NextRequest) {
  try {
    const body: StatusUpdateRequest = await request.json()
    const { pr_url, status } = body

    if (!pr_url || !status) {
      return NextResponse.json(
        { error: 'Missing pr_url or status' },
        { status: 400 }
      )
    }

    if (typeof pr_url !== 'string' || typeof status !== 'string') {
      return NextResponse.json(
        { error: 'Invalid data types for pr_url or status' },
        { status: 400 }
      )
    }

    // Update evolution log status
    const { data, error } = await supabase
      .from('evolution_logs')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('pr_url', pr_url)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      updated: data?.length || 0 
    })

  } catch (error) {
    console.error('Evolution status update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update status' },
      { status: 500 }
    )
  }
}
