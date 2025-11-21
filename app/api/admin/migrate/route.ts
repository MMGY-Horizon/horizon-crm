import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { migrationName } = await request.json();

    if (!migrationName) {
      return NextResponse.json(
        { error: "migrationName is required" },
        { status: 400 }
      );
    }

    // Read the migration file
    const migrationPath = path.join(
      process.cwd(),
      "supabase",
      "migrations",
      `${migrationName}.sql`
    );

    if (!fs.existsSync(migrationPath)) {
      return NextResponse.json(
        { error: `Migration file not found: ${migrationName}.sql` },
        { status: 404 }
      );
    }

    const sql = fs.readFileSync(migrationPath, "utf8");
    console.log(`Running migration: ${migrationName}.sql`);
    console.log("SQL:", sql);

    // Split the SQL into individual statements (by semicolon)
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    // Execute each statement
    for (const statement of statements) {
      if (statement.toLowerCase().startsWith("comment on")) {
        // Skip COMMENT statements for now as they might not work with the REST API
        console.log("Skipping COMMENT statement");
        continue;
      }

      const { data, error } = await supabaseAdmin.rpc("exec", {
        sql: statement + ";",
      });

      if (error) {
        console.error(`Error executing statement:`, statement);
        console.error("Error:", error);
        return NextResponse.json(
          {
            error: "Migration failed",
            details: error.message,
            statement,
          },
          { status: 500 }
        );
      }
    }

    console.log("Migration completed successfully");
    return NextResponse.json({
      success: true,
      message: `Migration ${migrationName} completed successfully`,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
