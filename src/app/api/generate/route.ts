import { NextResponse } from "next/server";
import { mockGenerate } from "@/lib/mockGenerator";

export async function POST(req: Request) {
  const body = await req.json();
  const data = mockGenerate(body);
  await new Promise((r) => setTimeout(r, 2000)); // simulate delay
  return NextResponse.json(data);
}
