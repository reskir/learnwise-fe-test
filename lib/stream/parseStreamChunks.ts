/**
 * Checks if a token represents a markdown block-level element
 * that needs a preceding newline to render correctly.
 */
function isBlockToken(trimmed: string): boolean {
  return (
    trimmed.startsWith("#") ||
    trimmed.startsWith("|") ||
    trimmed.startsWith(">") ||
    trimmed.startsWith("$$") ||
    trimmed.startsWith("---") ||
    trimmed.startsWith("```") ||
    trimmed.startsWith("- ") ||
    trimmed.startsWith("* ") ||
    /^\d+\.\s/.test(trimmed)
  );
}

/**
 * Returns the text of the last line in accumulated (after the last \n).
 */
function lastLine(accumulated: string): string {
  const idx = accumulated.lastIndexOf("\n");
  return idx === -1 ? accumulated : accumulated.slice(idx + 1);
}

/**
 * Appends a single stream token to the accumulated markdown string,
 * inserting line breaks before block-level markdown elements.
 *
 * For pipe characters: a new row starts when the current line either has no
 * pipes yet (first table row after non-table content) or the current line
 * ends with "|" (previous row is complete). Mid-row cell separators are
 * appended without a line break.
 */
export function appendStreamToken(accumulated: string, token: string): string {
  const trimmed = token.trimStart();

  if (trimmed.startsWith("|")) {
    const currentLine = lastLine(accumulated).trimEnd();
    // New row if: no pipes on current line, or current row already ended with |
    const startsNewRow = !currentLine.includes("|") || currentLine.endsWith("|");
    if (startsNewRow) {
      if (accumulated.length === 0) return trimmed;
      return accumulated + "\n\n" + trimmed;
    }
    return accumulated + token;
  }

  if (isBlockToken(trimmed)) {
    if (accumulated.length === 0) return trimmed;
    return accumulated + "\n\n" + trimmed;
  }

  return accumulated + token;
}

/**
 * Parses a buffer of concatenated NDJSON chunks (e.g. `{"content":"#"}{"content":" FAQ"}`)
 * and returns the extracted tokens and any remaining unparsed buffer.
 */
export function parseJsonBuffer(buffer: string): {
  tokens: string[];
  remaining: string;
} {
  const tokens: string[] = [];
  let startIndex = 0;

  for (let j = 0; j < buffer.length; j++) {
    if (buffer[j] === "}") {
      try {
        const chunk = JSON.parse(buffer.slice(startIndex, j + 1));
        if (chunk.content) {
          tokens.push(chunk.content);
        }
        startIndex = j + 1;
      } catch {
        // incomplete JSON, keep buffering
      }
    }
  }

  return { tokens, remaining: buffer.slice(startIndex) };
}

/**
 * Processes a full NDJSON stream string (as the API returns it) into
 * properly formatted markdown by parsing all JSON chunks and inserting
 * line breaks before block-level elements.
 */
export function parseStreamToMarkdown(raw: string): string {
  const { tokens } = parseJsonBuffer(raw);
  let result = "";
  for (const token of tokens) {
    result = appendStreamToken(result, token);
  }
  return result;
}
