import type { JSONValue } from "./types"

export interface ToolCancellationToken {
  isCancelled(): boolean
}

export interface TextContent {
  type: 'text'
  text: string
}

export interface ImageContent {
  type: 'image'
  // image-specific fields…
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, JSONValue>
}

export class AgentToolResult {
  content: Array<TextContent | ImageContent> = []
  details: JSONValue = null
  addedToolNames: string[] | null = null
  terminate: boolean | null = null

  constructor(init?: Partial<AgentToolResult>) {
    if (init) {
      AgentToolResult._normalizeTextContent(init)
      Object.assign(this, init)
    }
  }

  get text(): string {
    return this.content
      .filter((b): b is TextContent => b.type === 'text')
      .map(b => b.text)
      .join('')
  }

  private static _normalizeTextContent(data: { content?: unknown }) {
    if (typeof data.content === 'string') {
      data.content = data.content ? [{ type: 'text' as const, text: data.content }] : []
    }
  }
}

export type ToolCallRenderer =
  (arguments_: Record<string, JSONValue>) => string | null

export type ToolResultRenderer =
  (result: AgentToolResult, options: { expanded: boolean }) => string | null

export type ToolUpdateCallback = (result: AgentToolResult) => void

export type ToolExecutor = (
  toolCallId: string,
  arguments_: Record<string, JSONValue>,
  signal?: ToolCancellationToken | null,
  onUpdate?: ToolUpdateCallback | null,
) => Promise<AgentToolResult>

export type ToolExecutionMode = 'sequential' | 'parallel'

export type ToolArgumentPreparer =
  (raw: unknown) => Record<string, JSONValue>

export interface AgentTool {
  readonly name: string
  readonly label: string
  readonly description: string
  readonly parameters: Record<string, JSONValue>
  readonly promptSnippet?: string | null
  readonly promptGuidelines?: readonly string[]
  readonly prepareArguments?: ToolArgumentPreparer | null
  readonly executionMode?: ToolExecutionMode
  readonly renderCall?: ToolCallRenderer | null
  readonly renderResult?: ToolResultRenderer | null

  /** Alias used by provider payload builders. */
  readonly inputSchema: Record<string, JSONValue>

  execute(
    toolCallId: string,
    arguments_: Record<string, JSONValue>,
    signal?: ToolCancellationToken | null,
    onUpdate?: ToolUpdateCallback | null,
  ): Promise<AgentToolResult>
}