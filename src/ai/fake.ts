import type { AssistantMessageEvent } from "@/agent/provider_events";
import type { CancellationToken, ModelProvider } from "./provider";
import type { AgentTool } from "@/agent/tools";
import type { AgentMessage } from "@/agent/messages";

export class FakeProvider implements ModelProvider {
  private _streams: AssistantMessageEvent[][];
  calls: Array<[string, string, AgentMessage[], AgentTool[]]> = [];

  constructor(streams: Iterable<Iterable<AssistantMessageEvent>>) {
    this._streams = [...streams].map((stream) => [...stream]);
  }

  async *streamResponse(params: {
    model: string;
    system: string;
    messages: AgentMessage[];
    tools: AgentTool[];
    signal?: CancellationToken | null;
  }): AsyncIterable<AssistantMessageEvent> {
    this.calls.push([
      params.model,
      params.system,
      [...params.messages],
      [...params.tools],
    ]);
    const stream = this._streams.shift() ?? [];
    for (const event of stream) {
      if (params.signal?.isCancelled()) return;
      yield event;
    }
  }
}
