//! ドメイン層。
//!
//! commands 層と repo 層の双方が参照する DTO を置く。
//! Phase 1B の段階では commands 層はまだ存在しないため、
//! 暫定的に repo が直接このモジュールの型を引数・戻り値に使う。
//! Phase 1C で commands が domain を参照する形へ移行する。
//!
//! 参照: `agent-docs/tauri-commands.md` §DTO 型定義

pub mod agent;
pub mod project;
pub mod worktree;
