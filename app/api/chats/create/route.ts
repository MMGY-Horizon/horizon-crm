import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface CreateChatPayload {
  sessionId: string;
  chatId?: string;
  userId?: string;
  location?: string;
  userAgent?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

function authorizeRequest(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.CRM_API_KEY) {
    return false;
  }
  return true;
}

export async function POST(request: Request) {
  if (!authorizeRequest(request)) {
    console.warn("[CRM] Unauthorized chat creation attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateChatPayload;
  try {
    body = (await request.json()) as CreateChatPayload;
  } catch (error) {
    console.error("[CRM] Invalid JSON in create chat request:", error);
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!body.sessionId) {
    console.warn("[CRM] Missing sessionId in create chat request");
    return NextResponse.json(
      { error: "sessionId is required" },
      { status: 400 }
    );
  }

  const chatId = body.chatId ?? `chat_${randomUUID()}`;
  
  console.log(`[CRM] Creating chat: ${chatId} for session: ${body.sessionId}`);

  const { data, error } = await supabaseAdmin
    .from("chats")
    .insert({
      chat_id: chatId,
      session_id: body.sessionId,
      user_id: body.userId ?? null,
      location: body.location ?? null,
      user_agent: body.userAgent ?? null,
      status: body.status ?? "active",
      metadata: body.metadata ?? {},
    })
    .select()
    .single();

  if (error) {
    console.error(`[CRM] Failed to create chat ${chatId}:`, error);
    return NextResponse.json(
      { error: "Failed to create chat", details: error.message },
      { status: 500 }
    );
  }

  console.log(`[CRM] Successfully created chat: ${data.chat_id}`);

  return NextResponse.json({
    success: true,
    chatId: data.chat_id,
    createdAt: data.created_at,
  });
}
