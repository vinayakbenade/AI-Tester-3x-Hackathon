const MAX_SUMMARY_CHARS = 4000;
const MAX_BUFFER_SIZE = 50 * 1024 * 1024; // 50MB limit for processing

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function clamp(value: string): string {
  if (value.length <= MAX_SUMMARY_CHARS) return value;
  return `${value.slice(0, MAX_SUMMARY_CHARS - 80).trim()}...`;
}

export function extractDumpSummary(buffer: Buffer, fileName: string): string {
  // Check if file is too large
  if (buffer.length > 1024 * 1024 * 1024) {
    return `Dump file "${fileName}" is too large (${(buffer.length / (1024 * 1024 * 1024)).toFixed(2)}GB). Maximum supported size is 1GB. Please use WinDbg or a dedicated crash dump analyzer for very large files.`;
  }

  // Process only the first MAX_BUFFER_SIZE bytes to avoid string size limits
  const processBuffer = buffer.slice(0, MAX_BUFFER_SIZE);
  
  try {
    const binary = processBuffer.toString("latin1");
    const lines = binary
      .split(/[\r\n]+/)
      .map((line) => line.trim())
      .filter(Boolean);

    const importantLines = lines.filter((line) => {
      return /exception|faulting|bugcheck|stack|thread|module|access violation|unhandled|kernel|status|crash|memory|heap|dll|process/i.test(line);
    });

    const picked = importantLines.slice(0, 80).join("\n");

    if (picked) {
      return clamp(picked);
    }

    const printable = Array.from(
      new Set(
        (binary.match(/[ -~]{8,}/g) || [])
          .filter((token) => /[A-Za-z0-9]/.test(token))
          .map((token) => normalizeWhitespace(token))
          .filter(Boolean)
      )
    ).slice(0, 80).join("\n");

    if (printable) {
      return clamp(printable);
    }

    return clamp(
      `Uploaded dump file: ${fileName}. No readable crash signature text was detected in the dump contents. Consider capturing a crash log or stack trace from the application before trying again.`
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return `Failed to parse dump file "${fileName}": ${errorMsg}. The file may be corrupted or in an unsupported format.`;
  }
}
