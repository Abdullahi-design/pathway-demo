import { NextResponse } from "next/server";
import { mockGenerate } from "@/lib/mockGenerator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await mockGenerate(body); // Now async
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate pathway',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
