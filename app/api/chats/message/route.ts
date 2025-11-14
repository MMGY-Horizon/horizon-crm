import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface LogMessagePayload {
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
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
    console.warn("[CRM] Unauthorized message logging attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: LogMessagePayload;
  try {
    body = (await request.json()) as LogMessagePayload;
  } catch (error) {
    console.error("[CRM] Invalid JSON in log message request:", error);
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  if (!body.chatId || !body.role || !body.content) {
    console.warn("[CRM] Missing required fields in log message request");
    return NextResponse.json(
      { error: "chatId, role, and content are required" },
      { status: 400 }
    );
  }

  console.log(`[CRM] Logging ${body.role} message for chat: ${body.chatId}`);

  const now = new Date().toISOString();

  const { error } = await supabaseAdmin.from("messages").insert({
    chat_id: body.chatId,
    role: body.role,
    content: body.content,
    metadata: body.metadata ?? {},
  });

  if (error) {
    console.error(`[CRM] Failed to log message for chat ${body.chatId}:`, error);
    return NextResponse.json(
      { error: "Failed to log message", details: error.message },
      { status: 500 }
    );
  }

  // Update parent chat's updated_at timestamp
  await supabaseAdmin
    .from("chats")
    .update({ updated_at: now })
    .eq("chat_id", body.chatId);

  console.log(`[CRM] Successfully logged message for chat: ${body.chatId}`);

  return NextResponse.json({ success: true });
}
