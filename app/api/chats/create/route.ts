import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authorizeRequest } from "@/lib/api-auth";

interface CreateChatPayload {
  sessionId: string;
  chatId?: string;
  userId?: string;
  location?: string;
  userAgent?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

export async function POST(request: Request) {
  const auth = await authorizeRequest(request);
  if (!auth.authorized || !auth.organizationId) {
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
      organization_id: auth.organizationId,
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
