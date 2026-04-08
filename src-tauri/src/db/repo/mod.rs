//! Repository 層。
//!
//! 各 repo モジュールは 1 テーブルに対応し、`domain` 層の DTO を
//! 入出力とする純粋関数 (接続を引数で受け取る) として実装される。
//!
//! Phase 1B では `project` / `agent` を実装し、`worktree` は後続チケットで追加する。

pub mod agent;
pub mod project;
pub mod worktree;
