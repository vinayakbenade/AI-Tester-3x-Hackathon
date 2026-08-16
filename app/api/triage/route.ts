import { NextRequest, NextResponse } from "next/server";
import { parseLog } from "@/lib/parseLog";
import { callLlmTriage } from "@/lib/callLlmTriage";
import { dedupeLogs } from "@/lib/dedupeLogs";
import { buildTrendSummary } from "@/lib/buildTrendSummary";
import { computeTimeSaved } from "@/lib/computeTimeSaved";
import { generateExport } from "@/lib/generateExport";
import type { LlmProvider } from "@/lib/settings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entries = body.entries;

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        {
          error:
            "No entries provided. Paste a log or upload a .log/.txt/.dmp file to triage.",
        },
        { status: 400 }
      );
    }

    const parsedEntries = parseLog(entries);
    if (parsedEntries.length === 0) {
      return NextResponse.json(
        {
          error:
            "All entries were empty after cleaning. Paste a log or upload a .log/.txt/.dmp file to triage.",
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Get provider and credentials from headers
    const provider = (request.headers.get("X-LLM-Provider") || "groq") as LlmProvider;
    const headerApiKey = request.headers.get("X-LLM-Key") || undefined;
    const model = request.headers.get("X-LLM-Model") || undefined;
    const envApiKey = process.env[`${provider.toUpperCase()}_API_KEY`] || process.env.GROQ_API_KEY || undefined;
    const apiKey = headerApiKey || envApiKey;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: `No API key configured for ${provider}. Add your key in Settings or set ${provider.toUpperCase()}_API_KEY in the environment.`,
        },
        { status: 400 }
      );
    }

    const triageResponse = await callLlmTriage(parsedEntries, {
      provider,
      apiKey,
      model,
    });
    let results = triageResponse.results;
    results = dedupeLogs(results);

    const trend = buildTrendSummary(results);
    const aiElapsed = (Date.now() - startTime) / 1000;
    const timeSaved = computeTimeSaved(results.length, aiElapsed);
    const exports = generateExport(results);

    return NextResponse.json({
      results,
      trend,
      timeSaved,
      exports,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
