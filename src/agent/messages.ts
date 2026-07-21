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

function assistantContent(text: string, toolCalls: Array<ToolCall> = []) {
  const blocks: Array<AssistantContent> = text
    ? [textContentSchema.parse({ text })]
    : [];
  blocks.push(...toolCalls);
  return blocks;
}

function messageText(message: AgentMessage): string {
  if (
    message.role === "user" ||
    message.role === "custom" ||
    message.role === "toolResult" ||
    message.role === "assistant"
  )
    return message.content ? contentText(message.content) : "";
  else if (
    message.role === "branchSummary" ||
    message.role === "compactionSummary"
  )
    return message.summary;
  else if (message.role === "bashExecution") return message.output;

  return "";
}

function messageToUser(message: AgentMessage): UserMessage {
  return userMessageSchema.parse({
    role: "user",
    content: messageText(message),
    timestamp: message.timestamp,
  });
}

export const usageCostSchema = z.object({
  input: z.number().default(0.0),
  output: z.number().default(0.0),
  cache_read: z.number().default(0.0),
  cache_write: z.number().default(0.0),
  total: z.number().default(0.0),
});

export const usageSchema = z.object({
  input: z.number().default(0),
  output: z.number().default(0),
  cache_read: z.number().default(0),
  cache_write: z.number().default(0),
  cache_write_1h: z.number().nullable().default(null),
  reasoning: z.number().nullable().default(null),
  total_tokens: z.number().default(0),
  cost: usageCostSchema.partial().default({}),
});

export const textContentSchema = z.object({
  type: z.literal("text").default("text"),
  text: z.string(),
  text_signature: z.string().nullable().default(null),
});

export const thinkingContentSchema = z.object({
  type: z.literal("thinking").default("thinking"),
  content: z.string(),
  thinking_signature: z.string().nullable().default(null),
  redacted: z.boolean().default(false),
});
export const imageContentSchema = z.object({
  type: z.literal("image").default("image"),
  data: z.string(),
  mimeType: z.string(),
});

/**
 * @description A tool call content block requested by the assistant
 */
export const toolCallSchema = z.object({
  type: z.literal("toolCall").default("toolCall"),
  id: z.string(),
  name: z.string(),
  arguments: z.record(z.string(), z.unknown()).default({}),
  thought_signature: z.string().nullable().default(null),
});

export const assistantDiagnosticErrorSchema = z.object({
  name: z.string().nullable().default(null),
  message: z.string(),
  stack: z.string().nullable().default(null),
  code: z.union([z.string(), z.number(), z.null()]).default(null),
});

export const assistantMessageDiagnosticSchema = z.object({
  type: z.string(),
  timestamp: z.number().default(currentTimestampMs()),
  error: assistantDiagnosticErrorSchema.nullable().default(null),
  details: z.record(z.string(), z.unknown()).default({}),
});

export const stopReasonSchema = z.literal([
  "stop",
  "length",
  "toolUse",
  "error",
  "aborted",
]);

export const userContentSchema = z.union([
  z.string(),
  z.array(z.union([textContentSchema, imageContentSchema])),
]);

export const userMessageSchema = z.object({
  role: z.literal("user").default("user"),
  content: userContentSchema,
  timestamp: z.number().default(currentTimestampMs()),
});

export const toolResultContentSchema = z.union([
  textContentSchema,
  imageContentSchema,
]);

export const assistantContentSchema = z.union([
  textContentSchema,
  thinkingContentSchema,
  toolCallSchema,
]);

export const assistantMessageSchema = z.object({
  role: z.literal("assistant").default("assistant"),
  content: z.array(assistantContentSchema).default([]),
  api: z.string().default("unknown"),
  provider: z.string().default("unknown"),
  model: z.string().default("unknown"),
  response_model: z.string().nullable().default(null),
  response_id: z.string().nullable().default(null),
  diagnostics: z
    .array(assistantMessageDiagnosticSchema)
    .nullable()
    .default(null),
  usage: usageSchema,
  stop_reason: stopReasonSchema.default("stop"),
  error_message: z.string().nullable().default(null),
  timestamp: z.number().default(currentTimestampMs()),
});

export const toolResultMessageSchema = z.object({
  role: z.literal("toolResult").default("toolResult"),
  toolCallId: z.string(),
  toolName: z.string(),
  content: z.array(toolResultContentSchema).default([]),
  details: z.record(z.string(), z.unknown()).nullable().default(null),
  addedToolNames: z.array(z.string()).nullable().default(null),
  isError: z.boolean().default(false),
  timestamp: z.number().default(currentTimestampMs()),
});

export const bashExecutionMessageSchema = z.object({
  role: z.literal("bashExecution").default("bashExecution"),
  command: z.string(),
  output: z.string(),
  exitCode: z.number(),
  cancelled: z.boolean().default(false),
  truncated: z.boolean().default(false),
  fullOutputPath: z.string().nullable().default(null),
  timestamp: z.number().default(currentTimestampMs()),
  excludeFromContext: z.boolean().default(false),
});

export const customMessageSchema = z.object({
  role: z.literal("custom").default("custom"),
  customType: z.string(),
  content: userContentSchema,
  display: z.boolean().default(true),
  details: z.record(z.string(), z.unknown()).default({}),
  timestamp: z.number().default(currentTimestampMs()),
});

export const branchSummaryMessageSchema = z.object({
  role: z.literal("branchSummary").default("branchSummary"),
  summary: z.string(),
  fromId: z.string(),
  timestamp: z.number().default(currentTimestampMs()),
});

export const compactionSummaryMessageSchema = z.object({
  role: z.literal("compactionSummary").default("compactionSummary"),
  summary: z.string(),
  tokensBefore: z.string(),
  timestamp: z.number().default(currentTimestampMs()),
});

export const agentMessageSchema = z.discriminatedUnion("role", [
  userMessageSchema,
  assistantMessageSchema,
  toolResultMessageSchema,
  bashExecutionMessageSchema,
  customMessageSchema,
  branchSummaryMessageSchema,
  compactionSummaryMessageSchema,
]);

export type UsageCost = z.infer<typeof usageCostSchema>;
export type Usage = z.infer<typeof usageSchema>;
export type TextContent = z.infer<typeof textContentSchema>;
export type ThinkingContent = z.infer<typeof thinkingContentSchema>;
export type ImageContent = z.infer<typeof imageContentSchema>;
export type ToolCall = z.infer<typeof toolCallSchema>;
export type AssistantDiagnosticError = z.infer<
  typeof assistantDiagnosticErrorSchema
>;
export type AssistantMessageDiagnostic = z.infer<
  typeof assistantMessageDiagnosticSchema
>;
export type StopReason = z.infer<typeof stopReasonSchema>;
export type AgentMessage = z.infer<typeof agentMessageSchema>;
export type ToolResultMessageInput = z.infer<typeof toolResultMessageSchema>;
export type BashExecutionMessage = z.infer<typeof bashExecutionMessageSchema>;
export type CustomMessageInput = z.infer<typeof customMessageSchema>;
export type BranchSummaryMessage = z.infer<typeof branchSummaryMessageSchema>;
export type UserContent = z.infer<typeof userContentSchema>;
export type AssistantContent = TextContent | ThinkingContent | ToolCall;
export type ToolResultContent = z.infer<typeof toolResultContentSchema>;

export class UserMessage {
  role: "user" = "user";
  content: UserContent;
  timestamp: number = currentTimestampMs();

  constructor(content: UserContent) {
    this.content = content;
  }

  toString(): string {
    return contentText(this.content);
  }
}

function normalizeContent<T>(content: string | T[]): T[] {
  if (typeof content === "string") {
    return content
      ? [{ type: "text", text: content, text_signature: null } as unknown as T]
      : [];
  }
  return content;
}

export const assistantMessageInputSchema = z.object({
  content: z.union([z.string(), z.array(assistantContentSchema)]).optional(),
  api: z.string().optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  response_model: z.string().nullable().optional(),
  response_id: z.string().nullable().optional(),
  diagnostics: z.array(assistantMessageDiagnosticSchema).nullable().optional(),
  usage: usageSchema.optional(),
  stop_reason: stopReasonSchema.optional(),
  error_message: z.string().nullable().optional(),
  timestamp: z.number().optional(),
});

export type AssistantMessageInput = z.input<typeof assistantMessageInputSchema>;

export class AssistantMessage {
  readonly role: "assistant" = "assistant";
  readonly content: AssistantContent[];
  readonly api: string;
  readonly provider: string;
  readonly model: string;
  readonly response_model: string | null;
  readonly response_id: string | null;
  readonly diagnostics: AssistantMessageDiagnostic[] | null;
  readonly usage: Usage;
  readonly stop_reason: StopReason;
  readonly error_message: string | null;
  readonly timestamp: number;

  constructor(data: AssistantMessageInput = {}) {
    this.content = normalizeContent(data.content ?? []) as AssistantContent[];
    this.api = data.api ?? "unknown";
    this.provider = data.provider ?? "unknown";
    this.model = data.model ?? "unknown";
    this.response_model = data.response_model ?? null;
    this.response_id = data.response_id ?? null;
    this.diagnostics = (data.diagnostics ?? null) as
      | AssistantMessageDiagnostic[]
      | null;
    this.usage = (data.usage ?? usageSchema.parse({})) as Usage;
    this.stop_reason = data.stop_reason ?? "stop";
    this.error_message = data.error_message ?? null;
    this.timestamp = data.timestamp ?? currentTimestampMs();
  }

  get text(): string {
    return this.content
      .filter((b): b is TextContent => b.type === "text")
      .map((b) => b.text)
      .join("");
  }

  get thinkingText(): string {
    return this.content
      .filter((b): b is ThinkingContent => b.type === "thinking")
      .map((b) => b.content)
      .join("");
  }

  get toolCalls(): ToolCall[] {
    return this.content.filter((b): b is ToolCall => b.type === "toolCall");
  }
}

export class ToolResultMessage {
  readonly role: "toolResult" = "toolResult";
  readonly toolCallId: string;
  readonly toolName: string;
  readonly content: ToolResultContent[];
  readonly details: Record<string, unknown> | null;
  readonly addedToolNames: string[] | null;
  readonly isError: boolean;
  readonly timestamp: number;

  constructor(data: ToolResultMessageInput) {
    this.toolCallId = data.toolCallId;
    this.toolName = data.toolName;
    this.content = normalizeContent(data.content ?? []);
    this.details = data.details ?? null;
    this.addedToolNames = data.addedToolNames ?? null;
    this.isError = data.isError ?? false;
    this.timestamp = data.timestamp ?? currentTimestampMs();
  }

  get text(): string {
    return this.content
      .filter((b): b is TextContent => b.type === "text")
      .map((b) => b.text)
      .join("");
  }
}

export class CustomMessage {
  readonly role: "custom" = "custom";
  readonly customType: string;
  readonly content: UserContent;
  readonly display: boolean;
  readonly details: Record<string, unknown>;
  readonly timestamp: number;

  constructor(data: CustomMessageInput) {
    this.customType = data.customType;
    this.content = data.content;
    this.display = data.display ?? true;
    this.details = data.details ?? {};
    this.timestamp = data.timestamp ?? currentTimestampMs();
  }

  get text(): string {
    return contentText(this.content);
  }
}
