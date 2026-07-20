import { z } from "zod";

export interface ToolCancellationToken {
  isCancelled(): boolean;
}

export const AgentToolResultSchema = z.object({
  toolCallId: z.string(),
  name: z.string(),
  ok: z.boolean(),
  content: z.string(),
  data: z.record(z.string(), z.unknown()).nullable().default(null),
  details: z.record(z.string(), z.unknown()).nullable().default(null),
  error: z.string().nullable().default(null),
});

export type AgentToolResult = z.infer<typeof AgentToolResultSchema>;

export interface ToolExecutor<TSchema extends z.ZodTypeAny> {
  (
    args: z.infer<TSchema>,
    signal?: ToolCancellationToken,
  ): Promise<AgentToolResult>;
}

export interface AgentTool<TSchema extends z.ZodTypeAny> {
  name: string;
  description: string;
  inputSchema: TSchema;
  executor: ToolExecutor<TSchema>;

  execute(
    args: unknown,
    signal?: ToolCancellationToken,
  ): Promise<AgentToolResult>;
}

export function defineTool<TSchema extends z.ZodTypeAny>(options: {
  name: string;
  description: string;
  inputSchema: TSchema;
  executor: ToolExecutor<TSchema>;
}): AgentTool<TSchema> {
  return {
    ...options,

    execute(args, signal) {
      const parsed = options.inputSchema.parse(args);
      return options.executor(parsed, signal);
    },
  };
}