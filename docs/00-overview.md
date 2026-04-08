# QuietMem Requirements Overview

## 1. Document Purpose

本書は QuietMem の要件定義の全体像を整理し、領域別ドキュメントへの入口を提供する。
QuietMem は、複数の AI agent を継続的に運用するためのデスクトップ向け workspace manager / memory editor である。

## 2. Product Summary

- アプリ名: QuietMem
- 一言定義: 複数 AI agent を memory・editor・worktree・cron 込みで運用できるデスクトップ管理アプリ
- 主要価値: agent を単発の会話相手ではなく、記憶と作業場を持つ継続ワーカーとして扱えること
- 対象プラットフォーム: デスクトップアプリ
- 技術前提: Tauri / React / Monaco Editor

## 3. Product Objective

- 複数 agent の並列開発をしやすくする
- agent ごとの memory を可視化し、編集し、育てられるようにする
- コード / 文書 / prompt / 設定 / 実行管理を 1 つの GUI にまとめる
- worktree と cron を含む継続運用を可能にする

## 4. Core Concepts

- agent は role・config・memory・実行方法・worktree を持つ AI ワーカー定義である
- memory は Raw Memory と Curated Memory の 2 層構造を採用する
- QuietMem は memory 付き軽量 IDE / workspace manager として機能する
- 日常利用は 1 画面中心で、IDE ライクにタブとサイドパネルを切り替えて使う

## 5. MVP Scope

- Agent 管理
- Memory 管理
- Editor / Workspace
- Run / Log 管理
- Git / Worktree 管理
- Cron Job 管理

## 6. MVP Success Criteria

- GUI 上で agent を作成できる
- agent ごとの memory を閲覧 / 編集できる
- Monaco Editor 上でコードや文書を編集できる
- agent を並列実行できる
- 実行状況を可視化できる
- worktree / diff を確認できる
- cron job を作成して実行できる

## 7. Architecture Baseline

- UI: Tauri + React + Monaco
- Storage: SQLite + ローカルファイル
- Execution: CLI adapter 方式
- Scheduler: アプリ内蔵 cron
- Workspace: worktree 中心の並列開発管理
- Memory: raw / curated のハイブリッド構造

## 8. Requirements Document Map

- [L01-Product-Definition](./L01-product-definition.md)
- [L02-Domain-Model](./L02-domain-model.md)
- [L03-Memory-Requirements](./L03-memory-requirements.md)
- [L04-Workspace-UX](./L04-workspace-ux.md)
- [L05-Agent-Management](./L05-agent-management.md)
- [L06-Editor-Git-Worktree](./L06-editor-git-worktree.md)
- [L07-Run-Execution-CLI-Adapter](./L07-run-execution-cli-adapter.md)
- [L08-Cron-Management](./L08-cron-management.md)
- [L09-Data-Storage](./L09-data-storage.md)
- [L10-MVP-Scope-Roadmap](./L10-mvp-scope-roadmap.md)

## 9. Assumptions

- MVP の実行対象は Claude Code などのローカル CLI 型 agent を優先する
- 将来拡張は考慮するが、MVP は CLI adapter 方式に限定する
- 高度な自律判断、複雑な handoff / fork 制御、外部 SaaS 連携は MVP 対象外とする
