# Task 1D05: デザイントークンと global スタイル

## Objective

セージグリーン / ダークグレー / アンバーを中心としたデザイントークンを CSS 変数で定義し、アプリ全体に読み込む。

## Scope

- `src/styles/tokens.css`
  - `agent-docs/ui-shell.md` の tokens セクションの CSS 変数定義をそのまま転記
- `src/styles/global.css`
  - ブラウザデフォルトのマージン / パディングリセット
  - `html, body, #root { height: 100%; margin: 0; }`
  - `body { background: var(--bg-app); color: var(--fg-primary); font-family: var(--font-sans); font-size: var(--font-size-base); }`
  - `*, *::before, *::after { box-sizing: border-box; }`
  - 基本的な `button` / `input` / `select` / `textarea` のデフォルトスタイル (背景透過、色継承、ボーダーはトークン)
- `src/main.tsx`
  - `import "./styles/tokens.css";` と `import "./styles/global.css";` を追加

## Implementation Notes

- 参照: `agent-docs/ui-shell.md` (デザイントークンセクション)
- CSS 変数名は `ui-shell.md` と厳密に一致させる (後続チケットが参照する)
- リセットは normalize.css のような外部依存を入れず、最小の手書きで済ませる
- ダークモード前提なので背景は `--bg-app` (ダークグレー)

## Depends On

- task-1A02
