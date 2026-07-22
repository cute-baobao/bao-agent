import z from "zod";
import { assistantMessageSchema, toolCallSchema } from "./messages";

export const assistantStartEventSchema = z.object({
  type: z.literal("assistant_start").default("assistant_start"),
  partial: assistantMessageSchema,
});

export const textStartEventSchema = z.object({
  type: z.literal("text_start").default("text_start"),
  contentIndex: z.number(),
  partial: assistantMessageSchema,
});

export const textDeltaEventSchema = z.object({
  type: z.literal("text_delta").default("text_delta"),
  contentIndex: z.number(),
  delta: z.string(),
  partial: assistantMessageSchema,
});

export const textEndEventSchema = z.object({
  type: z.literal("text_end").default("text_end"),
  contentIndex: z.number(),
  content: z.string(),
  partial: assistantMessageSchema,
});

export const thinkingStartEventSchema = z.object({
  type: z.literal("thinking_start").default("thinking_start"),
  contentIndex: z.number(),
  partial: assistantMessageSchema,
});

export const thinkingDeltaEventSchema = z.object({
  type: z.literal("thinking_delta").default("thinking_delta"),
  contentIndex: z.number(),
  delta: z.string(),
  partial: assistantMessageSchema,
});

export const thinkingEndEventSchema = z.object({
  type: z.literal("thinking_end").default("thinking_end"),
  contentIndex: z.number(),
  content: z.string(),
  partial: assistantMessageSchema,
});

export const toolCallStartEventSchema = z.object({
  type: z.literal("toolcall_start").default("toolcall_start"),
  contentIndex: z.number(),
  partial: assistantMessageSchema,
});

export const toolCallDeltaEventSchema = z.object({
  type: z.literal("toolcall_delta").default("toolcall_delta"),
  contentIndex: z.number(),
  delta: z.string(),
  partial: assistantMessageSchema,
});

export const toolCallEndEventSchema = z.object({
  type: z.literal("toolcall_end").default("toolcall_end"),
  contentIndex: z.number(),
  toolCall: toolCallSchema,
  partial: assistantMessageSchema,
});

export const doneReasonSchema = z.union([
  z.literal("stop"),
  z.literal("length"),
  z.literal("toolUsed"),
]);
export const errorReasonSchema = z.union([
  z.literal("aborted"),
  z.literal("error"),
]);

export const assistantDoneEventSchema = z.object({
  type: z.literal("done").default("done"),
  reason: doneReasonSchema,
  message: assistantMessageSchema,
});

export const assistantErrorEventSchema = z.object({
  type: z.literal("error").default("error"),
  reason: errorReasonSchema,
  message: assistantMessageSchema,
});

export const assistantMessageEventSchema = z.discriminatedUnion("type", [
  assistantStartEventSchema,
  textStartEventSchema,
  textDeltaEventSchema,
  textEndEventSchema,
  thinkingStartEventSchema,
  thinkingDeltaEventSchema,
  thinkingEndEventSchema,
  toolCallStartEventSchema,
  toolCallDeltaEventSchema,
  toolCallEndEventSchema,
  assistantDoneEventSchema,
  assistantErrorEventSchema,
]);

export type AssistantMessageEvent = z.infer<typeof assistantMessageEventSchema>;
export type AssistantStartEvent = z.infer<typeof assistantStartEventSchema>;
export type TextStartEvent = z.infer<typeof textStartEventSchema>;
export type TextDeltaEvent = z.infer<typeof textDeltaEventSchema>;
export type TextEndEvent = z.infer<typeof textEndEventSchema>;
export type ThinkingStartEvent = z.infer<typeof thinkingStartEventSchema>;
export type ThinkingDeltaEvent = z.infer<typeof thinkingDeltaEventSchema>;
export type ThinkingEndEvent = z.infer<typeof thinkingEndEventSchema>;
export type ToolCallStartEvent = z.infer<typeof toolCallStartEventSchema>;
export type ToolCallDeltaEvent = z.infer<typeof toolCallDeltaEventSchema>;
export type ToolCallEndEvent = z.infer<typeof toolCallEndEventSchema>;
export type AssistantDoneEvent = z.infer<typeof assistantDoneEventSchema>;
export type AssistantErrorEvent = z.infer<typeof assistantErrorEventSchema>;
export type DoneReason = z.infer<typeof doneReasonSchema>;
export type ErrorReason = z.infer<typeof errorReasonSchema>;
export type AssistantMessageEventType = AssistantMessageEvent["type"];