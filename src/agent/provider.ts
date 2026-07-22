import type { AgentMessage } from "./messages";
import type { AssistantMessageEvent } from "./provider_events";
import type { AgentTool } from "./tools";

export interface CancellationToken {
  isCancelled: () => boolean; // return whether the current stream should stop
}

export interface ModelProvider {
  streamResponse(params: {
    model: string;
    system: string;
    messages: AgentMessage[];
    tools: AgentTool[];
    signal?: CancellationToken;
  }): AsyncIterable<AssistantMessageEvent>;
}
