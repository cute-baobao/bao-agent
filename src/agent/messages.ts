import z from "zod";

export function currentTimestampMs(): number {
  return Date.now();
}

function contentText(content: string | Array<any>): string {
  if (typeof content === "string") return content;
  return content
    .filter((b): b is TextContent => "text" in b)
    .map((b) => b.text)
    .join("");
}

export const usageCost = z.object({
  input: z.number().default(0.0),
  output: z.number().default(0.0),
  cache_read: z.number().default(0.0),
  cache_write: z.number().default(0.0),
  total: z.number().default(0.0),
});

export const usage = z.object({
  input: z.number().default(0),
  output: z.number().default(0),
  cache_read: z.number().default(0),
  cache_write: z.number().default(0),
  cache_write_1h: z.number().nullable().default(null),
  reasoning: z.number().nullable().default(null),
  total_tokens: z.number().default(0),
  cost: usageCost.partial().default({}),
});

export const textContent = z.object({
  type: z.literal("text").default("text"),
  text: z.string(),
  text_signature: z.string().nullable().default(null),
});

export const thinkingContent = z.object({
  type: z.literal("thinking").default("thinking"),
  content: z.string(),
  thinking_signature: z.string().nullable().default(null),
  redacted: z.boolean().default(false),
});

export const imageContent = z.object({
  type: z.literal("image").default("image"),
  data: z.string(),
  mimeType: z.string(),
});

/**
 * @description A tool call content block requested by the assistant
 */
export const toolCall = z.object({
  type: z.literal("toolCall").default("toolCall"),
  id: z.string(),
  name: z.string(),
  arguments: z.record(z.string(), z.unknown()).default({}),
  thought_signature: z.string().nullable().default(null),
});

export const assistantDiagnosticError = z.object({
    name: z.string().nullable().default(null),
    message: z.string(),
    stack: z.string().nullable().default(null),
    code: z.union([z.string(), z.number(), z.null()]).default(null)
})

export const assistantMessageDiagnostic = z.object({
    type: z.string(),
    timestamp: z.number().default(currentTimestampMs()),
    error: assistantDiagnosticError.nullable().default(null),
    details: z.record(z.string(), z.unknown()).default({})
})

export const stopReason = z.literal(["stop","length","toolUse","error","aborted"])

export type UsageCost = z.infer<typeof usageCost>;
export type Usage = z.infer<typeof usage>;
export type TextContent = z.infer<typeof textContent>;
export type ThinkingContent = z.infer<typeof thinkingContent>;
export type ImageContent = z.infer<typeof imageContent>;
export type ToolCall = z.infer<typeof toolCall>;
export type AssistantDiagnosticError = z.infer<typeof assistantDiagnosticError>;
export type AssistantMessageDiagnostic = z.infer<typeof assistantMessageDiagnostic>;
export type StopReason = z.infer<typeof stopReason>;

export type UserContent = string | Array<TextContent | ImageContent>;
export type AssistantContent = TextContent | ThinkingContent | ToolCall;
export type ToolResultContent = TextContent | ImageContent;

export class UserMessage {
  role: "user" = "user";
  content: UserContent;
  timeStamp: number = currentTimestampMs();

  constructor(content: UserContent) {
    this.content = content;
  }

  toString(): string {
    return contentText(this.content);
  }
}