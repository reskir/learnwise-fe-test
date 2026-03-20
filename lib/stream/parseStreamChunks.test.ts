import { describe, it, expect } from "vitest";
import {
  parseJsonBuffer,
  appendStreamToken,
  parseStreamToMarkdown,
} from "./parseStreamChunks";

// The exact JSON chunks the API returns (with newlines inside each object,
// as captured from the real /qa-stream endpoint).
const STREAM_CHUNKS = [
  '{\n    "content": "#"\n}',
  '{\n    "content": " FAQ"\n}',
  '{\n    "content": " **Q:**"\n}',
  '{\n    "content": " How"\n}',
  '{\n    "content": " do"\n}',
  '{\n    "content": " I"\n}',
  '{\n    "content": " test"\n}',
  '{\n    "content": " streaming?"\n}',
  '{\n    "content": " **A:**"\n}',
  '{\n    "content": " Send"\n}',
  '{\n    "content": " a"\n}',
  '{\n    "content": " request"\n}',
  '{\n    "content": " to"\n}',
  '{\n    "content": " `/temporary/qa-stream`"\n}',
  '{\n    "content": " and"\n}',
  '{\n    "content": " watch"\n}',
  '{\n    "content": " the"\n}',
  '{\n    "content": " chunks"\n}',
  '{\n    "content": " flow"\n}',
  '{\n    "content": " in"\n}',
  '{\n    "content": " real-time."\n}',
  '{\n    "content": " Use"\n}',
  '{\n    "content": " `curl"\n}',
  '{\n    "content": " -N`"\n}',
  '{\n    "content": " or"\n}',
  '{\n    "content": " any"\n}',
  '{\n    "content": " HTTP"\n}',
  '{\n    "content": " client"\n}',
  '{\n    "content": " with"\n}',
  '{\n    "content": " streaming"\n}',
  '{\n    "content": " support."\n}',
  '{\n    "content": " Each"\n}',
  '{\n    "content": " chunk"\n}',
  '{\n    "content": " will"\n}',
  '{\n    "content": " arrive"\n}',
  '{\n    "content": " as"\n}',
  '{\n    "content": " a"\n}',
  '{\n    "content": " separate"\n}',
  '{\n    "content": " event"\n}',
  '{\n    "content": " in"\n}',
  '{\n    "content": " NDJSON"\n}',
  '{\n    "content": " format."\n}',
  '{\n    "content": " **Q:**"\n}',
  '{\n    "content": " What\'s"\n}',
  '{\n    "content": " the"\n}',
  '{\n    "content": " ideal"\n}',
  '{\n    "content": " chunk"\n}',
  '{\n    "content": " size?"\n}',
  '{\n    "content": " **A:**"\n}',
  '{\n    "content": " It"\n}',
  '{\n    "content": " depends"\n}',
  '{\n    "content": " on"\n}',
  '{\n    "content": " your"\n}',
  '{\n    "content": " latency"\n}',
  '{\n    "content": " requirements"\n}',
  '{\n    "content": " and"\n}',
  '{\n    "content": " network"\n}',
  '{\n    "content": " conditions."\n}',
  '{\n    "content": " Smaller"\n}',
  '{\n    "content": " chunks"\n}',
  '{\n    "content": " (512-1024"\n}',
  '{\n    "content": " bytes)"\n}',
  '{\n    "content": " provide"\n}',
  '{\n    "content": " faster"\n}',
  '{\n    "content": " initial"\n}',
  '{\n    "content": " response"\n}',
  '{\n    "content": " but"\n}',
  '{\n    "content": " higher"\n}',
  '{\n    "content": " overhead."\n}',
  '{\n    "content": " **Q:**"\n}',
  '{\n    "content": " How"\n}',
  '{\n    "content": " do"\n}',
  '{\n    "content": " I"\n}',
  '{\n    "content": " handle"\n}',
  '{\n    "content": " disconnections?"\n}',
  '{\n    "content": " **A:**"\n}',
  '{\n    "content": " Implement"\n}',
  '{\n    "content": " exponential"\n}',
  '{\n    "content": " backoff"\n}',
  '{\n    "content": " and"\n}',
  '{\n    "content": " resume"\n}',
  '{\n    "content": " tokens."\n}',
  '{\n    "content": " The"\n}',
  '{\n    "content": " server"\n}',
  '{\n    "content": " will"\n}',
  '{\n    "content": " log"\n}',
  '{\n    "content": " disconnection"\n}',
  '{\n    "content": " events"\n}',
  '{\n    "content": " for"\n}',
  '{\n    "content": " debugging."\n}',
  '{\n    "content": " ###"\n}',
  '{\n    "content": " Comparison"\n}',
  '{\n    "content": " Table"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Approach"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Latency"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Throughput"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Complexity"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Use"\n}',
  '{\n    "content": " Case"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " |----------|---------|------------|------------|----------|\"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Streaming"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Low"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " High"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Medium"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Real-time"\n}',
  '{\n    "content": " UIs"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Batching"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Medium"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Very"\n}',
  '{\n    "content": " High"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Low"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Bulk"\n}',
  '{\n    "content": " processing"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Polling"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " High"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Low"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Low"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Simple"\n}',
  '{\n    "content": " clients"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " WebSocket"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Very"\n}',
  '{\n    "content": " Low"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " High"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " High"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " Bidirectional"\n}',
  '{\n    "content": " |"\n}',
  '{\n    "content": " ###"\n}',
  '{\n    "content": " Latency"\n}',
  '{\n    "content": " Calculation"\n}',
  '{\n    "content": " Expected"\n}',
  '{\n    "content": " end-to-end"\n}',
  '{\n    "content": " latency:"\n}',
  '{\n    "content": " $L_{total}"\n}',
  '{\n    "content": " ="\n}',
  '{\n    "content": " L_{network}"\n}',
  '{\n    "content": " +"\n}',
  '{\n    "content": " L_{processing}"\n}',
  '{\n    "content": " +"\n}',
  '{\n    "content": " \\\\frac{S_{response}}{B_{bandwidth}}$"\n}',
  '{\n    "content": " Where"\n}',
  '{\n    "content": " $L_{total}$"\n}',
  '{\n    "content": " is"\n}',
  '{\n    "content": " total"\n}',
  '{\n    "content": " latency,"\n}',
  '{\n    "content": " $L_{network}$"\n}',
  '{\n    "content": " is"\n}',
  '{\n    "content": " network"\n}',
  '{\n    "content": " round-trip"\n}',
  '{\n    "content": " time,"\n}',
  '{\n    "content": " $L_{processing}$"\n}',
  '{\n    "content": " is"\n}',
  '{\n    "content": " server"\n}',
  '{\n    "content": " processing"\n}',
  '{\n    "content": " time,"\n}',
  '{\n    "content": " $S_{response}$"\n}',
  '{\n    "content": " is"\n}',
  '{\n    "content": " response"\n}',
  '{\n    "content": " size,"\n}',
  '{\n    "content": " and"\n}',
  '{\n    "content": " $B_{bandwidth}$"\n}',
  '{\n    "content": " is"\n}',
  '{\n    "content": " available"\n}',
  '{\n    "content": " bandwidth."\n}',
  '{\n    "content": " _Enjoy"\n}',
  '{\n    "content": " building"\n}',
  '{\n    "content": " amazing"\n}',
  '{\n    "content": " streaming"\n}',
  '{\n    "content": " experiences!_"\n}',
];

// The full raw wire data as one string (chunks concatenated).
const RAW_STREAM = STREAM_CHUNKS.join("");

// Expected markdown output — properly structured with line breaks.
const EXPECTED_MARKDOWN = `# FAQ **Q:** How do I test streaming? **A:** Send a request to \`/temporary/qa-stream\` and watch the chunks flow in real-time. Use \`curl -N\` or any HTTP client with streaming support. Each chunk will arrive as a separate event in NDJSON format. **Q:** What's the ideal chunk size? **A:** It depends on your latency requirements and network conditions. Smaller chunks (512-1024 bytes) provide faster initial response but higher overhead. **Q:** How do I handle disconnections? **A:** Implement exponential backoff and resume tokens. The server will log disconnection events for debugging.

### Comparison Table

| Approach | Latency | Throughput | Complexity | Use Case |

|----------|---------|------------|------------|----------|

| Streaming | Low | High | Medium | Real-time UIs |

| Batching | Medium | Very High | Low | Bulk processing |

| Polling | High | Low | Low | Simple clients |

| WebSocket | Very Low | High | High | Bidirectional |

### Latency Calculation Expected end-to-end latency: $L_{total} = L_{network} + L_{processing} + \\frac{S_{response}}{B_{bandwidth}}$ Where $L_{total}$ is total latency, $L_{network}$ is network round-trip time, $L_{processing}$ is server processing time, $S_{response}$ is response size, and $B_{bandwidth}$ is available bandwidth. _Enjoy building amazing streaming experiences!_`;

/**
 * Simulates the streaming read loop from GeneratorForm:
 * splits the raw wire data into random-sized byte batches,
 * feeds them through parseJsonBuffer + appendStreamToken,
 * and returns every intermediate `accumulated` snapshot.
 */
function simulateStreamRead(
  raw: string,
  batchSizes: number[]
): { snapshots: string[]; final: string } {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(raw);
  const decoder = new TextDecoder();

  let offset = 0;
  let buffer = "";
  let accumulated = "";
  const snapshots: string[] = [];

  for (const size of batchSizes) {
    if (offset >= bytes.length) break;
    const slice = bytes.slice(offset, offset + size);
    offset += size;

    buffer += decoder.decode(slice, { stream: true });
    const { tokens, remaining } = parseJsonBuffer(buffer);
    for (const t of tokens) {
      accumulated = appendStreamToken(accumulated, t);
    }
    buffer = remaining;
    snapshots.push(accumulated);
  }

  // Flush anything left
  if (buffer.length > 0) {
    const { tokens } = parseJsonBuffer(buffer);
    for (const t of tokens) {
      accumulated = appendStreamToken(accumulated, t);
    }
    snapshots.push(accumulated);
  }

  return { snapshots, final: accumulated };
}

// ─── Streaming course (assistant-003 / course-streaming) ─────────────
// Compact NDJSON (no newlines inside objects) from /qa-stream endpoint.
const COURSE_STREAM_CHUNKS = [
  '{"content":"###"}',
  '{"content":" Quick"}',
  '{"content":" Course"}',
  '{"content":" Summary"}',
  '{"content":" 1."}',
  '{"content":" Understand"}',
  '{"content":" streaming"}',
  '{"content":" fundamentals"}',
  '{"content":" and"}',
  '{"content":" async"}',
  '{"content":" patterns"}',
  '{"content":" 2."}',
  '{"content":" Test"}',
  '{"content":" integrations"}',
  '{"content":" in"}',
  '{"content":" sandbox"}',
  '{"content":" environment"}',
  '{"content":" thoroughly"}',
  '{"content":" 3."}',
  '{"content":" Monitor"}',
  '{"content":" performance"}',
  '{"content":" metrics"}',
  '{"content":" and"}',
  '{"content":" error"}',
  '{"content":" rates"}',
  '{"content":" 4."}',
  '{"content":" Optimize"}',
  '{"content":" chunk"}',
  '{"content":" sizes"}',
  '{"content":" for"}',
  '{"content":" your"}',
  '{"content":" use"}',
  '{"content":" case"}',
  '{"content":" 5."}',
  '{"content":" Ship"}',
  '{"content":" confidently"}',
  '{"content":" to"}',
  '{"content":" production"}',
  '{"content":" >"}',
  '{"content":" Sandboxes"}',
  '{"content":" are"}',
  '{"content":" perfect"}',
  '{"content":" for"}',
  '{"content":" iteration!"}',
  '{"content":" They"}',
  '{"content":" provide"}',
  '{"content":" a"}',
  '{"content":" risk-free"}',
  '{"content":" environment"}',
  '{"content":" where"}',
  '{"content":" you"}',
  '{"content":" can"}',
  '{"content":" experiment"}',
  '{"content":" with"}',
  '{"content":" different"}',
  '{"content":" configurations"}',
  '{"content":" and"}',
  '{"content":" approaches."}',
  '{"content":" ###"}',
  '{"content":" Streaming"}',
  '{"content":" Configuration"}',
  '{"content":" |"}',
  '{"content":" Parameter"}',
  '{"content":" |"}',
  '{"content":" Recommended"}',
  '{"content":" |"}',
  '{"content":" Maximum"}',
  '{"content":" |"}',
  '{"content":" Notes"}',
  '{"content":" |"}',
  '{"content":" |-----------|-------------|---------|-------|"}',
  '{"content":" |"}',
  '{"content":" Chunk"}',
  '{"content":" Size"}',
  '{"content":" |"}',
  '{"content":" 1024"}',
  '{"content":" bytes"}',
  '{"content":" |"}',
  '{"content":" 8192"}',
  '{"content":" bytes"}',
  '{"content":" |"}',
  '{"content":" Balance"}',
  '{"content":" latency"}',
  '{"content":" vs"}',
  '{"content":" overhead"}',
  '{"content":" |"}',
  '{"content":" |"}',
  '{"content":" Buffer"}',
  '{"content":" Size"}',
  '{"content":" |"}',
  '{"content":" 4096"}',
  '{"content":" bytes"}',
  '{"content":" |"}',
  '{"content":" 16384"}',
  '{"content":" bytes"}',
  '{"content":" |"}',
  '{"content":" Adjust"}',
  '{"content":" based"}',
  '{"content":" on"}',
  '{"content":" network"}',
  '{"content":" |"}',
  '{"content":" |"}',
  '{"content":" Timeout"}',
  '{"content":" |"}',
  '{"content":" 30s"}',
  '{"content":" |"}',
  '{"content":" 300s"}',
  '{"content":" |"}',
  '{"content":" Consider"}',
  '{"content":" client"}',
  '{"content":" constraints"}',
  '{"content":" |"}',
  '{"content":" |"}',
  '{"content":" Concurrency"}',
  '{"content":" |"}',
  '{"content":" 10"}',
  '{"content":" |"}',
  '{"content":" 100"}',
  '{"content":" |"}',
  '{"content":" Scale"}',
  '{"content":" based"}',
  '{"content":" on"}',
  '{"content":" load"}',
  '{"content":" |"}',
  '{"content":" ###"}',
  '{"content":" Token"}',
  '{"content":" Efficiency"}',
  '{"content":" Formula"}',
  '{"content":" For"}',
  '{"content":" optimal"}',
  '{"content":" streaming"}',
  '{"content":" performance:"}',
  '{"content":" $$E_{tokens}"}',
  '{"content":" ="}',
  '{"content":" \\\\frac{T_{total}}{C_{chunks}}"}',
  '{"content":" \\\\times"}',
  '{"content":" (1"}',
  '{"content":" -"}',
  '{"content":" O_{overhead})$$"}',
  '{"content":" Where"}',
  '{"content":" $E_{tokens}$"}',
  '{"content":" represents"}',
  '{"content":" tokens"}',
  '{"content":" per"}',
  '{"content":" second,"}',
  '{"content":" $T_{total}$"}',
  '{"content":" is"}',
  '{"content":" total"}',
  '{"content":" tokens,"}',
  '{"content":" $C_{chunks}$"}',
  '{"content":" is"}',
  '{"content":" number"}',
  '{"content":" of"}',
  '{"content":" chunks,"}',
  '{"content":" and"}',
  '{"content":" $O_{overhead}$"}',
  '{"content":" is"}',
  '{"content":" protocol"}',
  '{"content":" overhead"}',
  '{"content":" (typically"}',
  '{"content":" 0.05-0.15)."}',
];

const COURSE_RAW_STREAM = COURSE_STREAM_CHUNKS.join("");

// Expected output: raw concatenation of content tokens (as GeneratorForm does: accumulated += t).
// Streamdown handles the markdown rendering, so we just verify the text is correct.
const COURSE_EXPECTED_TEXT =
  "### Quick Course Summary 1. Understand streaming fundamentals and async patterns" +
  " 2. Test integrations in sandbox environment thoroughly" +
  " 3. Monitor performance metrics and error rates" +
  " 4. Optimize chunk sizes for your use case" +
  " 5. Ship confidently to production" +
  " > Sandboxes are perfect for iteration!" +
  " They provide a risk-free environment where you can experiment with different configurations and approaches." +
  " ### Streaming Configuration" +
  " | Parameter | Recommended | Maximum | Notes |" +
  " |-----------|-------------|---------|-------|" +
  " | Chunk Size | 1024 bytes | 8192 bytes | Balance latency vs overhead |" +
  " | Buffer Size | 4096 bytes | 16384 bytes | Adjust based on network |" +
  " | Timeout | 30s | 300s | Consider client constraints |" +
  " | Concurrency | 10 | 100 | Scale based on load |" +
  " ### Token Efficiency Formula" +
  " For optimal streaming performance:" +
  " $$E_{tokens} = \\frac{T_{total}}{C_{chunks}} \\times (1 - O_{overhead})$$" +
  " Where $E_{tokens}$ represents tokens per second," +
  " $T_{total}$ is total tokens," +
  " $C_{chunks}$ is number of chunks," +
  " and $O_{overhead}$ is protocol overhead (typically 0.05-0.15).";

// ─── Unit tests ──────────────────────────────────────────────────────

describe("parseJsonBuffer", () => {
  it("extracts all tokens from a complete NDJSON buffer", () => {
    const { tokens, remaining } = parseJsonBuffer(
      '{"content":"#"}{"content":" FAQ"}{"content":" hello"}'
    );
    expect(tokens).toEqual(["#", " FAQ", " hello"]);
    expect(remaining).toBe("");
  });

  it("handles multi-line JSON objects (real API format)", () => {
    const input =
      '{\n    "content": "#"\n}{\n    "content": " FAQ"\n}';
    const { tokens, remaining } = parseJsonBuffer(input);
    expect(tokens).toEqual(["#", " FAQ"]);
    expect(remaining).toBe("");
  });

  it("preserves incomplete JSON in remaining", () => {
    const { tokens, remaining } = parseJsonBuffer(
      '{"content":"#"}{"content":" FA'
    );
    expect(tokens).toEqual(["#"]);
    expect(remaining).toBe('{"content":" FA');
  });

  it("handles empty buffer", () => {
    const { tokens, remaining } = parseJsonBuffer("");
    expect(tokens).toEqual([]);
    expect(remaining).toBe("");
  });
});

describe("appendStreamToken", () => {
  it("prepends newlines before heading tokens", () => {
    expect(appendStreamToken("some text", " ###")).toBe("some text\n\n###");
  });

  it("prepends newlines before table row start (after row-ending pipe)", () => {
    expect(appendStreamToken("| col1 | col2 |", " |")).toBe(
      "| col1 | col2 |\n\n|"
    );
  });

  it("prepends newlines for first table row after non-table content", () => {
    expect(appendStreamToken("### Table", " |")).toBe("### Table\n\n|");
  });

  it("does NOT prepend newlines for mid-row pipe tokens", () => {
    expect(appendStreamToken("| col1", " |")).toBe("| col1 |");
  });

  it("prepends newlines before blockquote tokens", () => {
    expect(appendStreamToken("text", " >")).toBe("text\n\n>");
  });

  it("prepends newlines before ordered list items", () => {
    expect(appendStreamToken("text", " 1. First")).toBe("text\n\n1. First");
  });

  it("prepends newlines before unordered list items", () => {
    expect(appendStreamToken("text", " - item")).toBe("text\n\n- item");
  });

  it("prepends newlines before code fences", () => {
    expect(appendStreamToken("text", " ```js")).toBe("text\n\n```js");
  });

  it("prepends newlines before horizontal rules", () => {
    expect(appendStreamToken("text", " ---")).toBe("text\n\n---");
  });

  it("prepends newlines before math blocks", () => {
    expect(appendStreamToken("text", " $$")).toBe("text\n\n$$");
  });

  it("appends plain text tokens without newlines", () => {
    expect(appendStreamToken("hello", " world")).toBe("hello world");
  });

  it("does not add leading newlines for the very first token", () => {
    expect(appendStreamToken("", "#")).toBe("#");
  });
});

// ─── Full-stream integration tests ──────────────────────────────────

describe("parseStreamToMarkdown (full FAQ)", () => {
  it("produces the expected markdown from concatenated chunks", () => {
    const markdown = parseStreamToMarkdown(RAW_STREAM);
    expect(markdown).toBe(EXPECTED_MARKDOWN);
  });

  it("does not start with a newline", () => {
    const markdown = parseStreamToMarkdown(RAW_STREAM);
    expect(markdown).toMatch(/^#/);
  });

  it("keeps all three Q&A pairs", () => {
    const markdown = parseStreamToMarkdown(RAW_STREAM);
    expect(markdown.match(/\*\*Q:\*\*/g)).toHaveLength(3);
    expect(markdown.match(/\*\*A:\*\*/g)).toHaveLength(3);
  });

  it("preserves inline code spans", () => {
    const markdown = parseStreamToMarkdown(RAW_STREAM);
    expect(markdown).toContain("`/temporary/qa-stream`");
    expect(markdown).toContain("`curl -N`");
  });

  it("has complete table rows on their own lines", () => {
    const markdown = parseStreamToMarkdown(RAW_STREAM);
    expect(markdown).toContain(
      "\n\n| Approach | Latency | Throughput | Complexity | Use Case |"
    );
    expect(markdown).toContain(
      "\n\n| Streaming | Low | High | Medium | Real-time UIs |"
    );
  });

  it("renders table separator row correctly", () => {
    const markdown = parseStreamToMarkdown(RAW_STREAM);
    const lines = markdown.split("\n").filter((l) => l.trim());
    const sep = lines.find((l) => l.startsWith("|---"));
    expect(sep).toBe("|----------|---------|------------|------------|----------|");
  });
});

// ─── Simulated streaming tests ──────────────────────────────────────

describe("simulated streaming (chunk-by-chunk)", () => {
  it("produces the same result when chunks arrive one at a time", () => {
    // Feed each JSON object individually (like one chunk per network read)
    const sizes = STREAM_CHUNKS.map((c) => new TextEncoder().encode(c).length);
    const { final } = simulateStreamRead(RAW_STREAM, sizes);
    expect(final).toBe(EXPECTED_MARKDOWN);
  });

  it("produces the same result with very small byte batches (5 bytes)", () => {
    const totalLen = new TextEncoder().encode(RAW_STREAM).length;
    const sizes = Array(Math.ceil(totalLen / 5)).fill(5);
    const { final } = simulateStreamRead(RAW_STREAM, sizes);
    expect(final).toBe(EXPECTED_MARKDOWN);
  });

  it("produces the same result with large batches (whole stream at once)", () => {
    const totalLen = new TextEncoder().encode(RAW_STREAM).length;
    const { final } = simulateStreamRead(RAW_STREAM, [totalLen]);
    expect(final).toBe(EXPECTED_MARKDOWN);
  });

  it("produces the same result with random batch sizes", () => {
    // Deterministic pseudo-random sizes between 1 and 80 bytes
    let seed = 42;
    const prng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed % 80) + 1;
    };
    const totalLen = new TextEncoder().encode(RAW_STREAM).length;
    const sizes: number[] = [];
    let sum = 0;
    while (sum < totalLen) {
      const s = prng();
      sizes.push(s);
      sum += s;
    }
    const { final } = simulateStreamRead(RAW_STREAM, sizes);
    expect(final).toBe(EXPECTED_MARKDOWN);
  });

  it("every intermediate snapshot is a valid prefix of the final markdown", () => {
    const sizes = STREAM_CHUNKS.map((c) => new TextEncoder().encode(c).length);
    const { snapshots, final } = simulateStreamRead(RAW_STREAM, sizes);

    for (let i = 0; i < snapshots.length; i++) {
      expect(final.startsWith(snapshots[i])).toBe(true);
    }
  });

  it("snapshots grow monotonically (never shrink)", () => {
    const sizes = STREAM_CHUNKS.map((c) => new TextEncoder().encode(c).length);
    const { snapshots } = simulateStreamRead(RAW_STREAM, sizes);

    for (let i = 1; i < snapshots.length; i++) {
      expect(snapshots[i].length).toBeGreaterThanOrEqual(snapshots[i - 1].length);
    }
  });
});

// ─── Course streaming (assistant-003 / course-streaming) ─────────────
// Tests the actual production flow: parseJsonBuffer extracts tokens,
// then raw concatenation produces text for Streamdown to render.

/**
 * Simulates the GeneratorForm streaming loop:
 * parseJsonBuffer to extract tokens, then raw concatenation (accumulated += t).
 */
function simulateCourseStream(
  raw: string,
  batchSizes: number[]
): { snapshots: string[]; final: string } {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(raw);
  const decoder = new TextDecoder();

  let offset = 0;
  let buffer = "";
  let accumulated = "";
  const snapshots: string[] = [];

  for (const size of batchSizes) {
    if (offset >= bytes.length) break;
    const slice = bytes.slice(offset, offset + size);
    offset += size;

    buffer += decoder.decode(slice, { stream: true });
    const { tokens, remaining } = parseJsonBuffer(buffer);
    for (const t of tokens) {
      accumulated += t;
    }
    buffer = remaining;
    snapshots.push(accumulated);
  }

  if (buffer.length > 0) {
    const { tokens } = parseJsonBuffer(buffer);
    for (const t of tokens) {
      accumulated += t;
    }
    snapshots.push(accumulated);
  }

  return { snapshots, final: accumulated };
}

describe("course-streaming parseJsonBuffer extraction", () => {
  it("extracts all 161 tokens from compact NDJSON", () => {
    const { tokens, remaining } = parseJsonBuffer(COURSE_RAW_STREAM);
    expect(tokens).toHaveLength(161);
    expect(remaining).toBe("");
  });

  it("first token is the heading marker", () => {
    const { tokens } = parseJsonBuffer(COURSE_RAW_STREAM);
    expect(tokens[0]).toBe("###");
  });

  it("last token is the closing parenthetical", () => {
    const { tokens } = parseJsonBuffer(COURSE_RAW_STREAM);
    expect(tokens[tokens.length - 1]).toBe(" 0.05-0.15).");
  });

  it("concatenated tokens match expected text", () => {
    const { tokens } = parseJsonBuffer(COURSE_RAW_STREAM);
    const text = tokens.join("");
    expect(text).toBe(COURSE_EXPECTED_TEXT);
  });
});

describe("course-streaming simulated read loop", () => {
  it("produces correct text when chunks arrive one at a time", () => {
    const sizes = COURSE_STREAM_CHUNKS.map(
      (c) => new TextEncoder().encode(c).length
    );
    const { final } = simulateCourseStream(COURSE_RAW_STREAM, sizes);
    expect(final).toBe(COURSE_EXPECTED_TEXT);
  });

  it("produces correct text with 5-byte batches", () => {
    const totalLen = new TextEncoder().encode(COURSE_RAW_STREAM).length;
    const sizes = Array(Math.ceil(totalLen / 5)).fill(5);
    const { final } = simulateCourseStream(COURSE_RAW_STREAM, sizes);
    expect(final).toBe(COURSE_EXPECTED_TEXT);
  });

  it("produces correct text when entire stream arrives at once", () => {
    const totalLen = new TextEncoder().encode(COURSE_RAW_STREAM).length;
    const { final } = simulateCourseStream(COURSE_RAW_STREAM, [totalLen]);
    expect(final).toBe(COURSE_EXPECTED_TEXT);
  });

  it("preserves markdown heading markers (###)", () => {
    const { final } = simulateCourseStream(COURSE_RAW_STREAM, [
      new TextEncoder().encode(COURSE_RAW_STREAM).length,
    ]);
    expect(final.match(/###/g)).toHaveLength(3);
  });

  it("preserves table separator row", () => {
    const { final } = simulateCourseStream(COURSE_RAW_STREAM, [
      new TextEncoder().encode(COURSE_RAW_STREAM).length,
    ]);
    expect(final).toContain("|-----------|-------------|---------|-------|");
  });

  it("preserves math formula with LaTeX", () => {
    const { final } = simulateCourseStream(COURSE_RAW_STREAM, [
      new TextEncoder().encode(COURSE_RAW_STREAM).length,
    ]);
    expect(final).toContain(
      "$$E_{tokens} = \\frac{T_{total}}{C_{chunks}} \\times (1 - O_{overhead})$$"
    );
  });

  it("preserves inline math expressions", () => {
    const { final } = simulateCourseStream(COURSE_RAW_STREAM, [
      new TextEncoder().encode(COURSE_RAW_STREAM).length,
    ]);
    expect(final).toContain("$E_{tokens}$");
    expect(final).toContain("$T_{total}$");
    expect(final).toContain("$C_{chunks}$");
    expect(final).toContain("$O_{overhead}$");
  });

  it("snapshots grow monotonically", () => {
    const sizes = COURSE_STREAM_CHUNKS.map(
      (c) => new TextEncoder().encode(c).length
    );
    const { snapshots } = simulateCourseStream(COURSE_RAW_STREAM, sizes);
    for (let i = 1; i < snapshots.length; i++) {
      expect(snapshots[i].length).toBeGreaterThanOrEqual(
        snapshots[i - 1].length
      );
    }
  });

  it("every snapshot is a prefix of the final text", () => {
    const sizes = COURSE_STREAM_CHUNKS.map(
      (c) => new TextEncoder().encode(c).length
    );
    const { snapshots, final } = simulateCourseStream(
      COURSE_RAW_STREAM,
      sizes
    );
    for (const snap of snapshots) {
      expect(final.startsWith(snap)).toBe(true);
    }
  });
});
