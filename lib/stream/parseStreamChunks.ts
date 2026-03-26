/**
 * Detects what kind of block-level context the current line is in.
 */
type BlockContext = "table" | "list" | "none";

function getBlockContext(line: string): BlockContext {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("|")) return "table";
  if (
    /^\d+\.[\s]/.test(trimmed) ||
    trimmed.startsWith("- ") ||
    trimmed.startsWith("* ")
  )
    return "list";
  return "none";
}

/**
 * Returns the text of the last line in accumulated (after the last \n).
 */
function lastLine(accumulated: string): string {
  const idx = accumulated.lastIndexOf("\n");
  return idx === -1 ? accumulated : accumulated.slice(idx + 1);
}

/**
 * Returns true if the accumulated text is currently inside an open $$ math block.
 */
function isInsideMathBlock(accumulated: string): boolean {
  const count = accumulated.split("$$").length - 1;
  return count % 2 === 1;
}

/**
 * Checks if a trimmed token starts a new block-level element.
 */
function isBlockStart(trimmed: string): boolean {
  return (
    trimmed.startsWith("#") ||
    trimmed.startsWith(">") ||
    trimmed.startsWith("$$") ||
    trimmed.startsWith("---") ||
    trimmed.startsWith("```") ||
    trimmed === "-" ||
    trimmed === "*" ||
    trimmed.startsWith("- ") ||
    trimmed.startsWith("* ") ||
    /^\d+\.\s/.test(trimmed) ||
    /^\d+\.$/.test(trimmed)
  );
}

/**
 * Appends a single stream token to the accumulated markdown string,
 * inserting appropriate line breaks to produce valid markdown structure.
 *
 * Rules based on the non-streamed API output:
 * - Headings (#, ##, ###): \n\n before
 * - Table rows (|): \n between rows within a table, \n\n before the first row
 * - Numbered list items (1., 2.): \n between items within a list, \n\n before the first
 * - Unordered list items (-, *): \n between consecutive items, \n\n before the first
 * - Blockquotes (>): \n\n before
 * - Math blocks ($$): \n\n before; content inside is not treated as block elements
 * - Code fences (```): \n\n before
 */
export function appendStreamToken(accumulated: string, token: string): string {
  // If the token contains newlines, split and process each segment
  // so that block-level detection works for content after \n boundaries.
  if (token.includes("\n")) {
    const parts = token.split("\n");
    let result = accumulated;
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        result += "\n";
      }
      if (parts[i]) {
        result = appendSingleToken(result, parts[i]);
      }
    }
    return result;
  }

  return appendSingleToken(accumulated, token);
}

function appendSingleToken(accumulated: string, token: string): string {
  const trimmed = token.trimStart();
  if (!trimmed) return accumulated + token;
  if (accumulated.length === 0) return trimmed;

  // Inside a $$ math block — append everything as-is (no block detection)
  if (isInsideMathBlock(accumulated) && !trimmed.startsWith("$$")) {
    return accumulated + token;
  }

  // Just exited a $$ math block — add \n\n before next content
  if (accumulated.endsWith("$$") && !isInsideMathBlock(accumulated)) {
    return accumulated + "\n\n" + trimmed;
  }

  const currentLine = lastLine(accumulated);
  const context = getBlockContext(currentLine);

  // Table pipe handling
  if (trimmed.startsWith("|")) {
    const currentTrimmed = currentLine.trimEnd();
    // Mid-row cell separator: current line has pipes but row isn't complete
    if (currentTrimmed.includes("|") && !currentTrimmed.endsWith("|")) {
      return accumulated + token;
    }
    // New row within an existing table: use \n
    if (context === "table") {
      return accumulated + "\n" + trimmed;
    }
    // First table row after non-table content: use \n\n
    return accumulated + "\n\n" + trimmed;
  }

  // List items: \n between consecutive items, \n\n before the first
  const isListItem =
    trimmed === "-" ||
    trimmed === "*" ||
    trimmed.startsWith("- ") ||
    trimmed.startsWith("* ") ||
    /^\d+\.(\s|$)/.test(trimmed);

  if (isListItem) {
    if (context === "list") {
      return accumulated + "\n" + trimmed;
    }
    return accumulated + "\n\n" + trimmed;
  }

  // Other block-level starts: always \n\n
  if (isBlockStart(trimmed)) {
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
          tokens.push(chunk.content.replace(/\\n(?![a-z])/g, "\n"));
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
