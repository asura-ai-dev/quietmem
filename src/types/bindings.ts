// src/types/bindings.ts
//
// Rust 側 DTO (`domain::*`) と 1 対 1 で対応する TypeScript 型ミラー。
// Rust 側の `#[serde(rename_all = "camelCase")]` と一致する camelCase フィールド名を使う。
//
// 出典: agent-docs/tauri-commands.md

export interface AppErrorPayload {
  code: "not_found" | "invalid_input" | "db_error" | "io_error" | "internal";
  message: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  rootPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateInput {
  name: string;
  slug: string;
  rootPath: string;
}

export interface ProjectUpdateInput {
  id: string;
  name?: string;
  slug?: string;
  rootPath?: string;
}

/**
 * Agent.status の有効値ホワイトリスト型。
 *
 * Rust 側 `domain::agent::AGENT_STATUS_VALUES` と 1:1 で対応する。
 * - "idle":         初期状態 / 静止中
 * - "running":      実行中
 * - "error":        エラー停止中
 * - "needs_input":  ユーザー入力待ち
 *
 * 参照: agent-docs/phase-2-status-enum.md
 */
export type AgentStatus = "idle" | "running" | "error" | "needs_input";

export interface Agent {
  id: string;
  projectId: string;
  name: string;
  role: string;
  adapterType: string;
  promptPath: string | null;
  configPath: string | null;
  // 前方互換のためユニオンで許容 (DB に既存範囲外値が残るケース対策)
  status: AgentStatus | string;
  activeWorktreeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCreateInput {
  projectId: string;
  name: string;
  role: string;
  adapterType: string;
  promptPath?: string | null;
  configPath?: string | null;
  // 厳格化: 自由文字列は受け付けない
  status?: AgentStatus;
}

export interface AgentUpdateInput {
  id: string;
  name?: string;
  role?: string;
  adapterType?: string;
  promptPath?: string | null;
  configPath?: string | null;
  status?: AgentStatus;
  activeWorktreeId?: string | null;
}

/**
 * `agent_duplicate` Tauri command の入力。
 *
 * - sourceAgentId: 元 Agent の id
 * - name: 省略時は Rust 側で `<元 name> (copy)` を生成する
 *
 * 参照: agent-docs/agent-duplicate-design.md
 */
export interface AgentDuplicateInput {
  sourceAgentId: string;
  name?: string | null;
}

export interface Worktree {
  id: string;
  projectId: string;
  agentId: string | null;
  branchName: string;
  path: string;
  baseBranch: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorktreeCreateInput {
  projectId: string;
  agentId?: string | null;
  branchName: string;
  path: string;
  baseBranch: string;
  status?: string;
}

export interface WorktreeUpdateInput {
  id: string;
  agentId?: string | null;
  branchName?: string;
  path?: string;
  baseBranch?: string;
  status?: string;
}

export type FileTreeNodeKind = "file" | "directory";

export interface FileTreeNode {
  name: string;
  relativePath: string;
  kind: FileTreeNodeKind;
  children: FileTreeNode[];
}

export interface WorktreeTreeSource {
  worktreeId: string;
  rootPath: string;
  nodes: FileTreeNode[];
}

export interface WorktreeFileContent {
  worktreeId: string;
  relativePath: string;
  content: string;
}

export interface WorktreeFileSaveInput {
  worktreeId: string;
  relativePath: string;
  content: string;
}
