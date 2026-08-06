import { NextResponse } from "next/server";
import { getQwenReply } from "../../services/llm.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userMessage = String(body.message ?? "").trim();

    if (!userMessage) {
      return NextResponse.json(
        { error: "Missing message in request body." },
        { status: 400 },
      );
    }

    const reply = await getQwenReply(userMessage);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[chat route]", error);
    return NextResponse.json(
      { error: "Unable to fetch response from Olama Qwen." },
      { status: 500 },
    );
  }
}
