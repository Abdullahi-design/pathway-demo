import OpenAI from 'openai';
import { pathwayCache } from './cache';

let openai: OpenAI | null = null;

// Initialize OpenAI client only if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function mockGenerate(config: any) {
  // Check cache first
  const cacheKey = pathwayCache.generateKey(config);
  const cachedResult = pathwayCache.get(cacheKey);
  if (cachedResult) {
    console.log('Returning cached pathway result');
    return cachedResult;
  }

  // If no API key is provided, fall back to mock data
  if (!openai || !process.env.OPENAI_API_KEY) {
    console.log('No OpenAI API key found, using mock data');
    const result = generateMockPathway(config);
    pathwayCache.set(cacheKey, result);
    return result;
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
      const result = {
        ...pathwayData,
        meta: {
          confidence: calculateConfidence(pathwayData),
          generated_at: new Date().toISOString(),
          model: process.env.OPENAI_MODEL || "gpt-4o-mini"
        }
      };
      
      // Cache the successful result
      pathwayCache.set(cacheKey, result);
      return result;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fall back to mock data if parsing fails
      const result = generateMockPathway(config);
      pathwayCache.set(cacheKey, result);
      return result;
    }

  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fall back to mock data on error
    const result = generateMockPathway(config);
    pathwayCache.set(cacheKey, result);
    return result;
  }
}

function createPathwayPrompt(config: any): string {
  const { name, voice, interruptionThreshold, robustnessLevel, fileContext } = config;
  
  // Enhanced prompt based on robustness level
  const robustnessInstructions = getRobustnessInstructions(robustnessLevel);
  
  return `You are an expert conversational AI designer creating production-ready customer service pathways. Generate a sophisticated pathway based on these requirements:

PATHWAY CONFIGURATION:
- Name: ${name || "Untitled Pathway"}
- Voice Setting: ${voice || "Default"}
- Interruption Threshold: ${interruptionThreshold || 0.5}
- Robustness Level: ${robustnessLevel || "Medium"}

${fileContext || ''}

${robustnessInstructions}

REQUIREMENTS:
1. Generate 4-6 nodes for a comprehensive conversation flow
2. Include both "prompt" and "action" type nodes
3. Create robust prompts that handle edge cases
4. Include loop conditions for retry scenarios
5. Use specific, actionable edge conditions
6. Make prompts production-ready with clear instructions

NODE TYPES:
- "prompt": Conversational prompts for the agent
- "action": System actions (verification, processing, etc.)

EDGE CONDITIONS should be specific and actionable:
- "user_confused" → loop back to clarification
- "verification_failed" → retry verification
- "payment_declined" → offer alternatives
- "user_angry" → escalate to supervisor
- "insufficient_info" → collect more details
- "action_successful" → proceed to next step
- "user_wants_escalation" → transfer to supervisor

LOOP CONDITIONS:
Include self-referencing edges for retry scenarios:
- Clarification loops when user doesn't understand
- Retry loops when actions fail
- Escalation loops when user requests help

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

Make it production-ready with robust error handling and clear user guidance.`;
}

function getRobustnessInstructions(robustnessLevel: string): string {
  switch (robustnessLevel) {
    case "Quick":
      return `ROBUSTNESS: QUICK
- Generate 3-4 basic nodes
- Simple, straightforward flow
- Basic error handling
- Focus on speed over complexity`;
    
    case "Medium":
      return `ROBUSTNESS: MEDIUM
- Generate 4-5 comprehensive nodes
- Include common edge cases
- Add retry logic for failed actions
- Include escalation paths
- Handle typical customer scenarios`;
    
    case "Production":
      return `ROBUSTNESS: PRODUCTION
- Generate 5-6 sophisticated nodes
- Comprehensive error handling
- Multiple retry strategies
- Advanced escalation logic
- Handle complex edge cases
- Include fallback scenarios
- Professional, polished prompts
- Consider all possible user states`;
    
    default:
      return `ROBUSTNESS: MEDIUM
- Generate 4-5 comprehensive nodes
- Include common edge cases
- Add retry logic for failed actions
- Include escalation paths`;
  }
}

function generateMockPathway(config: any) {
  const { robustnessLevel = "Medium" } = config;
  
  // Generate different pathway structures based on robustness level
  const pathway = getPathwayByRobustness(robustnessLevel, config);
  
  return {
    pathway_name: config.name || "Untitled Pathway",
    nodes: pathway.nodes,
    edges: pathway.edges,
    meta: { 
      confidence: calculateConfidence(pathway),
      generated_at: new Date().toISOString(),
      model: "mock",
      robustness_level: robustnessLevel
    }
  };
}

function getPathwayByRobustness(robustnessLevel: string, config: any) {
  const baseNodes = [
    { 
      id: "1", 
      type: "prompt", 
      title: "Greeting & Initial Contact", 
      prompt: "Welcome the customer warmly and establish rapport. Ask how you can help them today. Use a professional but friendly tone." 
    },
    { 
      id: "2", 
      type: "prompt", 
      title: "Gather Information", 
      prompt: "Ask clarifying questions to understand the customer's specific needs. Listen actively and take notes of key details." 
    },
    { 
      id: "3", 
      type: "action", 
      title: "Verify & Process", 
      prompt: "Verify customer information and process their request. Check system records and confirm details before proceeding." 
    }
  ];

  const baseEdges = [
    { from: "1", to: "2", condition: "user_response_detected" },
    { from: "2", to: "3", condition: "sufficient_info_gathered" }
  ];

  if (robustnessLevel === "Quick") {
    return {
      nodes: baseNodes.slice(0, 3),
      edges: baseEdges
    };
  }

  if (robustnessLevel === "Medium") {
    return {
      nodes: [
        ...baseNodes,
        { 
          id: "4", 
          type: "prompt", 
          title: "Handle Issues", 
          prompt: "If there are any problems or complications, address them professionally. Offer alternative solutions if needed." 
        },
        { 
          id: "5", 
          type: "action", 
          title: "Complete & Follow-up", 
          prompt: "Complete the customer's request and provide confirmation. Ask if there's anything else you can help with." 
        }
      ],
      edges: [
        ...baseEdges,
        { from: "3", to: "4", condition: "issues_detected" },
        { from: "3", to: "5", condition: "action_successful" },
        { from: "4", to: "5", condition: "issue_resolved" },
        { from: "2", to: "2", condition: "insufficient_info" }, // Loop back for clarification
        { from: "3", to: "3", condition: "verification_failed" } // Retry verification
      ]
    };
  }

  // Production level - most comprehensive
  return {
    nodes: [
      ...baseNodes,
      { 
        id: "4", 
        type: "prompt", 
        title: "Handle Complex Issues", 
        prompt: "For complex issues, break them down into manageable steps. Explain each step clearly and ensure customer understanding." 
      },
      { 
        id: "5", 
        type: "action", 
        title: "Escalation Check", 
        prompt: "Determine if the issue requires escalation. Check escalation criteria and prepare for supervisor transfer if needed." 
      },
      { 
        id: "6", 
        type: "prompt", 
        title: "Resolution & Confirmation", 
        prompt: "Provide detailed resolution summary. Confirm customer satisfaction and offer additional assistance or follow-up." 
      },
      { 
        id: "7", 
        type: "action", 
        title: "Document & Close", 
        prompt: "Document the interaction thoroughly. Complete any necessary system updates and close the case appropriately." 
      }
    ],
    edges: [
      { from: "1", to: "2", condition: "user_response_detected" },
      { from: "2", to: "3", condition: "sufficient_info_gathered" },
      { from: "3", to: "4", condition: "complex_issue_detected" },
      { from: "3", to: "6", condition: "simple_resolution" },
      { from: "4", to: "5", condition: "escalation_needed" },
      { from: "4", to: "6", condition: "issue_resolved" },
      { from: "5", to: "6", condition: "escalation_complete" },
      { from: "6", to: "7", condition: "customer_satisfied" },
      // Loop conditions for retry scenarios
      { from: "2", to: "2", condition: "insufficient_info" },
      { from: "3", to: "3", condition: "verification_failed" },
      { from: "4", to: "4", condition: "user_confused" },
      { from: "6", to: "6", condition: "customer_not_satisfied" },
      // Escalation loops
      { from: "5", to: "5", condition: "escalation_delayed" }
    ]
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