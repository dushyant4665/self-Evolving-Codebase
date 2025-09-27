// AI Service for code analysis and suggestions
export interface CodeSuggestion {
  type: 'feature' | 'bugfix' | 'refactor' | 'optimization'
  title: string
  description: string
  files: {
    path: string
    content: string
    action: 'create' | 'modify' | 'delete'
  }[]
  reasoning: string
}

export class AIService {
  private apiKey: string
  private provider: 'gemini' | 'deepseek' | 'openrouter'

  constructor() {
    // Determine which AI provider to use based on available API keys
    this.apiKey = process.env.GEMINI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY || ''
    
    if (process.env.GEMINI_API_KEY) {
      this.apiKey = process.env.GEMINI_API_KEY
      this.provider = 'gemini'
    } else if (process.env.DEEPSEEK_API_KEY) {
      this.apiKey = process.env.DEEPSEEK_API_KEY
      this.provider = 'deepseek'
    } else if (process.env.OPENROUTER_API_KEY) {
      this.apiKey = process.env.OPENROUTER_API_KEY
      this.provider = 'openrouter'
    } else {
      console.error('Available env vars:', {
        gemini: !!process.env.GEMINI_API_KEY,
        deepseek: !!process.env.DEEPSEEK_API_KEY,
        openrouter: !!process.env.OPENROUTER_API_KEY
      })
      throw new Error('No AI API key configured')
    }
    
    console.log('AI Service initialized with provider:', this.provider)
  }

  async generateCodeSuggestion(
    repoContext: string,
    files: { path: string; content: string }[]
  ): Promise<CodeSuggestion> {
    const prompt = this.buildPrompt(repoContext, files)
    
    try {
      let response: string

      switch (this.provider) {
        case 'gemini':
          response = await this.callGemini(prompt)
          break
        case 'deepseek':
          response = await this.callDeepSeek(prompt)
          break
        case 'openrouter':
          response = await this.callOpenRouter(prompt)
          break
        default:
          throw new Error('Unknown AI provider')
      }

      return this.parseSuggestion(response)
    } catch (error) {
      console.error('AI API Error:', error)
      throw new Error('Failed to generate code suggestion')
    }
  }

  private buildPrompt(repoContext: string, files: { path: string; content: string }[]): string {
    const fileContents = files
      .map(file => `\n--- ${file.path} ---\n${file.content}`)
      .join('\n')

    return `You are an AI code evolution assistant. Analyze this codebase and suggest ONE meaningful improvement.

Repository Context:
${repoContext}

Current Files:
${fileContents}

IMPORTANT: Analyze the ACTUAL files provided above. Do not create generic script.js files. Look at the existing code structure and suggest improvements to EXISTING files or create files that make sense for this specific codebase.

Please suggest ONE of the following types of improvements:
1. NEW FEATURE: Add a useful new feature based on existing code
2. BUG FIX: Fix a potential bug or issue in the provided files
3. REFACTOR: Improve code structure or readability of existing files
4. OPTIMIZATION: Improve performance or efficiency of existing code

Respond in this EXACT JSON format:
{
  "type": "feature|bugfix|refactor|optimization",
  "title": "Brief title of the improvement",
  "description": "Detailed description of what this improvement does",
  "reasoning": "Why this improvement is beneficial for THIS specific codebase",
  "files": [
    {
      "path": "path/to/actual/file/from/analysis",
      "action": "create|modify|delete",
      "content": "complete file content after changes"
    }
  ]
}

Rules:
- Analyze the PROVIDED files, not generic assumptions
- Suggest improvements to EXISTING files or logical new files
- DO NOT create generic script.js unless the codebase actually needs it
- Provide complete file content, not just diffs
- Focus on meaningful improvements for THIS specific project
- Ensure all code is syntactically correct
- Keep changes focused and atomic`
  }

  private async callGemini(prompt: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  }

  private async callDeepSeek(prompt: string): Promise<string> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-coder',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private async callOpenRouter(prompt: string): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        'X-Title': 'Self-Evolving Codebase'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private parseSuggestion(response: string): CodeSuggestion {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate required fields
      if (!parsed.type || !parsed.title || !parsed.description || !parsed.files) {
        throw new Error('Invalid suggestion format')
      }

      return parsed as CodeSuggestion
    } catch (error) {
      console.error('Failed to parse AI response:', response)
      throw new Error('Failed to parse AI suggestion')
    }
  }
}

