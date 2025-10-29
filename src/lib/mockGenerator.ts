import OpenAI from 'openai';

let openai: OpenAI | null = null;

// Initialize OpenAI client only if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function mockGenerate(config: any) {
  // If no API key is provided, fall back to mock data
  if (!openai || !process.env.OPENAI_API_KEY) {
    console.log('No OpenAI API key found, using mock data');
    return generateMockPathway(config);
  }

  try {
    const prompt = createPathwayPrompt(config);
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert conversational AI designer. Generate structured pathway data for conversational flows. Always respond with valid JSON in the exact format specified."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    try {
      const pathwayData = JSON.parse(response);
      return {
        ...pathwayData,
        meta: {
          confidence: calculateConfidence(pathwayData),
          generated_at: new Date().toISOString(),
          model: process.env.OPENAI_MODEL || "gpt-4o-mini"
        }
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fall back to mock data if parsing fails
      return generateMockPathway(config);
    }

  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fall back to mock data on error
    return generateMockPathway(config);
  }
}

function createPathwayPrompt(config: any): string {
  const { name, voice, interruptionThreshold, robustnessLevel, files } = config;
  
  let contextInfo = '';
  if (files && files.length > 0) {
    contextInfo = `\n\nContext files provided:\n${files.map((file: any) => `- ${file.name} (${file.type}, ${file.size} bytes)`).join('\n')}`;
  }

  return `Generate a conversational pathway JSON structure based on these requirements:

Pathway Name: ${name || "Untitled Pathway"}
Voice Setting: ${voice || "Default"}
Interruption Threshold: ${interruptionThreshold || 0.5}
Robustness Level: ${robustnessLevel || "Medium"}${contextInfo}

Generate a conversational pathway with 3-5 nodes that represents a realistic customer service or support conversation flow. Each node should have:
- id: unique identifier
- type: either "prompt" (for conversational prompts) or "action" (for system actions)
- title: short descriptive title
- prompt: detailed prompt/instruction for that step

Include edges that connect the nodes with logical flow conditions.

Respond with ONLY valid JSON in this exact format:
{
  "pathway_name": "string",
  "nodes": [
    {
      "id": "string",
      "type": "prompt|action",
      "title": "string", 
      "prompt": "string"
    }
  ],
  "edges": [
    {
      "from": "string",
      "to": "string",
      "condition": "string"
    }
  ]
}

Make it realistic and useful for a customer service scenario.`;
}

function generateMockPathway(config: any) {
  return {
    pathway_name: config.name || "Untitled Pathway",
    nodes: [
      { id: "1", type: "prompt", title: "Start", prompt: "Welcome the customer and ask how you can help." },
      { id: "2", type: "prompt", title: "Clarify Intent", prompt: "Confirm if the user wants to make a payment or check balance." },
      { id: "3", type: "action", title: "Handle Intent", prompt: "Perform the action requested by the user." }
    ],
    edges: [
      { from: "1", to: "2", condition: "user_response_detected" },
      { from: "2", to: "3", condition: "intent_confirmed" }
    ],
    meta: { 
      confidence: 0.87, 
      generated_at: new Date().toISOString(),
      model: "mock"
    }
  };
}

function calculateConfidence(pathwayData: any): number {
  // Simple confidence calculation based on pathway structure
  const nodeCount = pathwayData.nodes?.length || 0;
  const edgeCount = pathwayData.edges?.length || 0;
  
  if (nodeCount < 2) return 0.3;
  if (nodeCount >= 3 && edgeCount >= 2) return 0.9;
  if (nodeCount >= 2 && edgeCount >= 1) return 0.7;
  return 0.5;
}