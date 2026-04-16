import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json()

    const messages = [
      {
        role: 'system' as const,
        content: `You are Chat-PT, an expert physiotherapy AI assistant built for BPT/MPT students and practicing physiotherapists. 

Your expertise includes:
- Musculoskeletal & orthopaedic physiotherapy
- Neurological rehabilitation  
- Anatomy & biomechanics
- Exercise therapy & therapeutic modalities
- Clinical assessment & special tests
- Exam preparation (MCQs, case studies)

Response style:
- Use clear headings with ##
- Use bullet points for lists
- Bold **key clinical terms**
- Be concise yet thorough
- Add clinical pearls where relevant
- Always be encouraging to students`
      },
      ...history.slice(-10).map((h: any) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content
      })),
      { role: 'user' as const, content: message }
    ]

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1500,
    })

    return NextResponse.json({
      reply: completion.choices[0].message.content
    })
  } catch (error) {
    console.error('Groq error:', error)
    return NextResponse.json({ reply: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}