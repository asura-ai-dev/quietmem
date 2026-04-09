# task-2B04: tokens.css に --color-danger 系 + status alias 追加

## Phase

2B

## Depends on

なし (Phase 1 完了が前提)

## Goal

`src/styles/tokens.css` に red パレット (3 階調) と `--color-danger` セマンティック alias を追加し、Phase 2C の `AgentStatusBadge` で `error` バリアントが描画できるようにする。raw 色値の直書きを避けるための基盤整備。

## Scope

- `src/styles/tokens.css`

## Implementation Notes

参照: `agent-docs/phase-2-ui-design.md` §5 tokens.css への追加

### 追加するトークン

`amber` セクションの直後 (semantic aliases の直前) に追加:

```css
/* Red (danger) — Phase 2 で導入 */
--color-red-300: #f08a8a;
--color-red-500: #d04848;
--color-red-700: #8e2828;
```

semantic aliases セクション内に追加:

```css
--color-danger: var(--color-red-500);
--color-danger-strong: var(--color-red-700);
--color-danger-bg: var(--color-red-700);
```

### 配置方針

- raw パレット (`--color-red-*`) は `--color-amber-*` の下に配置
- セマンティック alias (`--color-danger*`) は `--accent-attention` の下、`--border-subtle` の上に配置
- 既存のトークン順序 (sage / gray / amber → semantic) を維持

### スタイルガイド

- raw 色値は `--color-red-300`, `--color-red-500`, `--color-red-700` の 3 階調のみ
- それ以外のコンポーネントは必ず `--color-danger` (alias) を経由する (raw 色値直書き禁止)
- `--color-danger-bg` は背景用 (バッジ全体の塗りつぶし)
- `--color-danger-strong` はボーダー / hover 用

### 既存トークンへの影響

- 既存の `--color-sage-*` / `--color-gray-*` / `--color-amber-*` には触れない
- 既存の semantic alias (`--accent-primary` 等) には触れない
- spacing / typography / radius にも触れない

### 動作確認

- `pnpm tsc --noEmit` (CSS 変数なので影響なし)
- `pnpm build` (CSS module 含めてバンドルが通る)
- ブラウザ DevTools (vite dev サーバ起動が困難ならスキップ可) で `:root` に `--color-danger: #d04848` が出る

### 色選定の根拠 (参考)

- `#d04848`: dark gray 背景に対して十分なコントラスト (WCAG AA 想定)
- `#8e2828`: hover / border 用にやや暗くしたバリアント
- `#f08a8a`: 軽い背景 (alert banner) 用の薄い変種 (Phase 2 では未使用だが余地として確保)

正確な値は generator が必要に応じて微調整してよいが、3 階調 + 3 alias の構造は維持する。

## Out of scope

- 他の semantic alias の追加 (`--color-success` 等は Phase 2 では不要)
- ライト / ダークテーマ切替 (Phase 2 ではダーク 1 種類継続)
- 既存トークンの値変更
- AgentStatusBadge コンポーネント自体の作成 (task-2C01)
