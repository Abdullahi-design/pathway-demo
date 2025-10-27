export function mockGenerate(config: any) {
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
    meta: { confidence: 0.87, generated_at: new Date().toISOString() }
  };
}
