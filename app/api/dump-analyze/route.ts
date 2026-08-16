import { NextRequest, NextResponse } from "next/server";
import { extractDumpSummary } from "@/lib/extractDumpSummary";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No dump file was uploaded." }, { status: 400 });
    }

    const fileName = file.name || "dump.dmp";
    
    // Check file size before reading to avoid memory issues
    if (file.size > 2 * 1024 * 1024 * 1024) {
      return NextResponse.json(
        { 
          error: `Dump file "${fileName}" is too large (${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB). Maximum supported size is 2GB.`,
          extracted: false 
        },
        { status: 413 } // Payload Too Large
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const summary = extractDumpSummary(buffer, fileName);

    return NextResponse.json({
      fileName,
      summary,
      extracted: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to analyze dump file: ${message}` }, { status: 500 });
  }
}
