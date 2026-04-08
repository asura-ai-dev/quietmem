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

export interface Agent {
  id: string;
  projectId: string;
  name: string;
  role: string;
  adapterType: string;
  promptPath: string | null;
  configPath: string | null;
  status: string;
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
  status?: string;
}

export interface AgentUpdateInput {
  id: string;
  name?: string;
  role?: string;
  adapterType?: string;
  promptPath?: string | null;
  configPath?: string | null;
  status?: string;
  activeWorktreeId?: string | null;
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
