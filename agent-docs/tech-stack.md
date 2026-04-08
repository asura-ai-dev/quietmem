# 技術スタック詳細

## 概要

Phase 1 で採用する Rust crate / npm パッケージと、その選定理由を明示する。YAGNI を尊重し、Phase 1 段階で必要最小限のライブラリに絞る。

## 仕様からの対応

- spec.md §7 技術前提と確定事項
- spec.md §8 未確定事項 (architect で決定する項目)

## Rust (src-tauri)

### 確定

| crate                                    | 用途                          | 理由                         |
| ---------------------------------------- | ----------------------------- | ---------------------------- |
| `tauri`                                  | デスクトップ実行基盤          | spec 確定事項                |
| `tauri-build`                            | Tauri ビルド支援              | Tauri 標準                   |
| `serde` / `serde_json`                   | シリアライズ                  | Tauri IPC の前提             |
| `rusqlite` (bundled)                     | SQLite ドライバ               | decision 後述                |
| `thiserror`                              | エラー型                      | シンプルなエラー定義         |
| `chrono`                                 | UTC 時刻生成 (RFC3339)        | 依存の軽い時刻ライブラリ     |
| `uuid` (v4 + v7)                         | ID 採番                       | v7 は時系列ソート向き        |
| `directories`                            | OS 標準データディレクトリ解決 | クロスプラットフォーム対応   |
| `log` + `env_logger` or `tracing` (軽量) | 初期化ログ                    | tauri は `log` facade で十分 |

### 検討と決定: SQLite ライブラリ

- 候補: `rusqlite` (同期) vs `sqlx` (非同期 + compile-time check)
- **決定: `rusqlite`** (bundled feature で SQLite を同梱)
- 理由
  - Phase 1 の DB アクセスは軽量で、非同期ランタイムを抱え込む動機が弱い
  - `sqlx` の compile-time check は便利だが、実行環境で DB が必要 / マクロで型推論が複雑化 / Tauri との統合手順が増える
  - `rusqlite` は直接的で学習コストが低く、テストが `:memory:` で素直に書ける
  - バイナリ同梱 (`features = ["bundled"]`) でユーザー環境の SQLite 有無を気にしない

### 検討と決定: マイグレーション機構

- 候補: `refinery` vs `rusqlite_migration` vs 自前軽量 runner
- **決定: 自前軽量 runner** (`db-schema.md` 参照)
- 理由
  - Phase 1 ではマイグレーションが 1 本しかなく、サードパーティの学習コスト < 自前実装
  - `include_str!` ベースの SQL + `schema_migrations` テーブルの 2 点だけで十分
  - 将来 `refinery` へ差し替える場合でも、SQL ファイル置き場の規約が同じなので移行が容易

### 除外

- `diesel` : ORM の恩恵に対して学習 / 記述量が大きすぎる
- `tokio` : Phase 1 は同期で十分。Tauri の非同期 command が必要になれば個別に導入
- `tracing` フルスタック : `log` + `env_logger` で十分

## Frontend (npm)

### パッケージマネージャ

- **決定: pnpm**
- 理由: spec §8 の第一候補 / ディスク効率 / workspace 対応

### 確定

| package                 | 用途                   | 理由          |
| ----------------------- | ---------------------- | ------------- |
| `react` / `react-dom`   | UI                     | spec 確定事項 |
| `typescript`            | 型                     | spec 確定事項 |
| `vite`                  | ビルド / 開発サーバ    | spec 確定事項 |
| `@vitejs/plugin-react`  | React 対応             | Vite 標準     |
| `@tauri-apps/api`       | Tauri IPC クライアント | 必須          |
| `@tauri-apps/cli` (dev) | tauri CLI              | 必須          |
| `zustand`               | 状態管理               | decision 後述 |

### 検討と決定: 状態管理

- 候補: `zustand` / `jotai` / Redux Toolkit / React Context のみ
- **決定: `zustand`**
- 理由
  - ボイラープレートが少なく、store 単位で切り分けやすい
  - Context のみだと派生状態管理で再レンダリングが増える
  - Redux Toolkit は Phase 1 では over-engineering
  - `jotai` は原子単位の状態が多い場面で有利だが、Phase 1 はドメインストア 3 つ程度なので `zustand` が簡潔

### 検討と決定: スタイリング

- 候補: CSS Modules / Tailwind / vanilla-extract / styled-components
- **決定: CSS Modules + グローバル tokens.css (CSS variables)**
- 理由
  - Tailwind は依存とセットアップが重く、デザイントークン方針 (CSS variables 一元化) と相性がやや悪い
  - vanilla-extract は型安全だが学習コスト + Vite plugin の追加
  - styled-components は CSS-in-JS のランタイムコストと SSR 懸念
  - CSS Modules は Vite 標準サポートで 0 設定、tokens.css をグローバルに読み込むだけで一元管理ができる
  - 文字数は増えるが QuietMem の「静かで堅実」な方針に合致

### 検討と決定: ルーティング

- 候補: `react-router-dom` / 自前 state-based
- **決定: 自前 state-based** (`uiStore.route`)
- 理由
  - Phase 1 の画面数は 4 つ (workspace / firstRun / dashboard / settings)
  - ブラウザの URL 共有は不要 (Tauri のデスクトップアプリ)
  - `react-router` のセットアップと学習コストに見合わない
  - 将来的に深いナビゲーションが必要になれば `react-router` へ差し替え可能

### 検討と決定: フォーム

- 候補: `react-hook-form` / `formik` / 自前 useState
- **決定: 自前 useState** (Phase 1 のフォームは 3-5 フィールドの単純フォームのみ)
- 理由: ライブラリ導入のコスト >>> 自前実装のコスト

### 検討と決定: ID 採番

- 候補: UUID v4 / UUID v7 / ULID / SQLite rowid
- **決定: UUID v7** (Rust 側 `uuid` crate の `v7` feature)
- 理由
  - 時系列ソート可能 → `ORDER BY id` が `ORDER BY created_at` の近似になる
  - 衝突リスクが極小
  - SQLite rowid は公開 ID として使うと後で制約になる

### 除外

- `@tauri-apps/plugin-*` : Phase 1 で明確に必要な plugin は無い (必要になれば個別導入)
- テストライブラリ (Phase 1 は DB 層の Rust 単体テストのみ) : Vitest / RTL は後続で導入

## ランタイム前提

- Node.js: >= 20.x
- pnpm: >= 9.x
- Rust: stable (最低 1.75)
- macOS: 14+ (Apple Silicon)
- Xcode Command Line Tools

## 制約・注意事項

- 新しいライブラリ追加は architect 承認を前提とする (Phase 1 のスコープ肥大化を避ける)
- Phase 1 完了までに E2E テスト / CI は整備しない
- `ts-rs` / `specta` 等の Rust→TS 型生成ツールは導入しない (手動ミラーで十分)
