// src/features/agents/agentStatus.ts
//
// Agent status の有効値リストと表示ラベルを集約する。
// Rust 側 `domain::agent::AGENT_STATUS_VALUES` の TS ミラー。
//
// 参照: agent-docs/phase-2-status-enum.md

import type { AgentStatus } from "../../types/bindings";

/**
 * Agent status の有効値リスト。順序は UI の <select> option 順を兼ねる。
 */
export const AGENT_STATUS_VALUES = [
  "idle",
  "running",
  "error",
  "needs_input",
] as const satisfies readonly AgentStatus[];

/**
 * status 文字列をユーザー向け表示用ラベルにマップする。
 * needs_input は表示時にスペース入りにする ("needs input")。
 */
export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  idle: "idle",
  running: "running",
  error: "error",
  needs_input: "needs input",
};

/**
 * 任意の文字列が AgentStatus に該当するか判定する。
 * 範囲外の場合は false (DB 互換性のフォールバック判定に使う)。
 */
export const isAgentStatus = (value: string): value is AgentStatus =>
  (AGENT_STATUS_VALUES as readonly string[]).includes(value);
