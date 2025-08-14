import { ai } from './config'

export async function generateBattleJudge(
  participant1: string,
  performance1: string,
  participant2: string,
  performance2: string
) {
  const prompt = `
You are an expert rap battle judge with deep knowledge of hip-hop culture, flow patterns, and lyrical composition. Analyze these two performances and provide a comprehensive breakdown:

Participant 1: ${participant1}
Performance: "${performance1}"

Participant 2: ${participant2}  
Performance: "${performance2}"

Provide detailed scoring and analysis in JSON format:

{
  "participant1": {
    "name": "${participant1}",
    "scores": {
      "flow_rhythm": [1-10 score],
      "lyrical_content": [1-10 score],
      "wordplay": [1-10 score],
      "delivery": [1-10 score],
      "creativity": [1-10 score],
      "crowd_appeal": [1-10 score]
    },
    "total_score": [sum/6],
    "strengths": ["strength1", "strength2", "strength3"],
    "improvements": ["improvement1", "improvement2"]
  },
  "participant2": {
    "name": "${participant2}",
    "scores": {
      "flow_rhythm": [1-10 score],
      "lyrical_content": [1-10 score],
      "wordplay": [1-10 score],
      "delivery": [1-10 score],
      "creativity": [1-10 score],
      "crowd_appeal": [1-10 score]
    },
    "total_score": [sum/6],
    "strengths": ["strength1", "strength2", "strength3"],
    "improvements": ["improvement1", "improvement2"]
  },
  "winner": "[participant1/participant2]",
  "margin": "[close/decisive]",
  "reasoning": "Detailed explanation of why winner was chosen",
  "battle_highlights": ["highlight1", "highlight2", "highlight3"],
  "overall_assessment": "General thoughts on the battle quality and entertainment value"
}
`

  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      }
    })

    return {
      success: true,
      judgment: response.text,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('AI Judge error:', error)
    return {
      success: false,
      error: 'Failed to generate battle judgment',
      timestamp: new Date().toISOString()
    }
  }
}

export async function analyzePerformanceAudio(audioUrl: string, transcript?: string) {
  const prompt = `
Analyze this rap performance for technical and artistic elements:

${transcript ? `Transcript: "${transcript}"` : 'No transcript provided - analyze audio patterns only'}

Provide analysis in JSON format:

{
  "technical_analysis": {
    "flow_consistency": [1-10 score],
    "rhythm_pocket": [1-10 score],
    "breath_control": [1-10 score],
    "vocal_clarity": [1-10 score],
    "pace_variation": [1-10 score]
  },
  "artistic_elements": {
    "emotional_delivery": [1-10 score],
    "character_voice": [1-10 score],
    "storytelling": [1-10 score],
    "crowd_engagement": [1-10 score]
  },
  "recommendations": {
    "technical_improvements": ["tip1", "tip2", "tip3"],
    "artistic_development": ["tip1", "tip2", "tip3"],
    "practice_exercises": ["exercise1", "exercise2"]
  },
  "overall_grade": "[A+/A/B+/B/C+/C/D]",
  "performance_type": "[beginner/intermediate/advanced/professional]",
  "standout_moments": ["moment1", "moment2"]
}
`

  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      config: {
        temperature: 0.6,
        maxOutputTokens: 1200,
      }
    })

    return {
      success: true,
      analysis: response.text,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Audio analysis error:', error)
    return {
      success: false,
      error: 'Failed to analyze performance audio',
      timestamp: new Date().toISOString()
    }
  }
}

export async function detectContentModeration(content: string, type: 'text' | 'audio_transcript') {
  const prompt = `
Analyze this ${type} content for community safety and appropriateness in a rap battle/hip-hop context:

Content: "${content}"

Consider:
- Hip-hop cultural context and battle traditions
- Artistic expression vs harmful content
- Community guidelines for competitive rap
- Age-appropriate content standards

Provide moderation analysis in JSON format:

{
  "safety_score": [0-1 decimal, where 1 is completely safe],
  "content_flags": [
    {
      "flag": "flag_type",
      "severity": "low/medium/high",
      "description": "explanation"
    }
  ],
  "recommendation": "approve/review/reject",
  "reasoning": "explanation of decision",
  "cultural_context": "hip-hop cultural considerations",
  "suggested_edits": ["edit1", "edit2"] // if applicable
}
`

  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      config: {
        temperature: 0.3, // Lower temperature for consistent moderation
        maxOutputTokens: 800,
      }
    })

    return {
      success: true,
      moderation: response.text,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Content moderation error:', error)
    return {
      success: false,
      error: 'Failed to analyze content for moderation',
      timestamp: new Date().toISOString()
    }
  }
}

export async function analyzeCypherPerformance(
  participantName: string,
  performance: string,
  cypherContext: {
    theme?: string
    previousParticipants?: string[]
    beatInfo?: string
  }
) {
  const prompt = `
Analyze this cypher performance within the context of a collaborative rap session:

Participant: ${participantName}
Performance: "${performance}"

Cypher Context:
- Theme: ${cypherContext.theme || 'Open freestyle'}
- Previous participants: ${cypherContext.previousParticipants?.join(', ') || 'None'}
- Beat info: ${cypherContext.beatInfo || 'Standard hip-hop beat'}

Provide detailed cypher analysis in JSON format:

{
  "cypher_analysis": {
    "flow_adaptation": [1-10 score],
    "theme_adherence": [1-10 score],
    "energy_contribution": [1-10 score],
    "community_building": [1-10 score],
    "originality": [1-10 score],
    "technical_skill": [1-10 score]
  },
  "cypher_strengths": [
    "strength1", "strength2", "strength3"
  ],
  "cypher_feedback": [
    "feedback1", "feedback2", "feedback3"
  ],
  "energy_level": "low/medium/high/explosive",
  "style_description": "description of their unique style",
  "community_impact": "how they elevated the cypher",
  "memorable_lines": ["line1", "line2"],
  "overall_cypher_grade": "A+/A/B+/B/C+/C/D",
  "next_participant_advice": "suggestion for who should go next and why"
}
`

  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1200,
      }
    })

    return {
      success: true,
      analysis: response.text,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Cypher analysis error:', error)
    return {
      success: false,
      error: 'Failed to analyze cypher performance',
      timestamp: new Date().toISOString()
    }
  }
}

export async function generateBeatSuggestions(style: string, mood: string) {
  const prompt = `
Generate beat suggestions for a rap battle or cypher with the following criteria:
- Style: ${style}
- Mood: ${mood}

Provide 3 beat suggestions with:
1. BPM range
2. Key signature
3. Instrumental elements
4. Producer style reference
5. Brief description

Format as JSON array.
`

  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 800,
      }
    })

    return {
      success: true,
      suggestions: response.text,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Beat suggestions error:', error)
    return {
      success: false,
      error: 'Failed to generate beat suggestions',
      timestamp: new Date().toISOString()
    }
  }
}
