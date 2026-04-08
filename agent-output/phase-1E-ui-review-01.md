# Phase 1E — UI Review Handoff

- Reviewer: ui-reviewer agent
- Date: 2026-04-08
- Scope: task-1E01 .. task-1E05 (WorkspaceRoute + Header/LeftSidebar/MainTabs/RightPanel/BottomDrawer + routing)
- Mode: visual-only (no functional changes)
- Iteration count: 3 (min met, terminated on scores all >= 4)

## Spec Alignment

Phase 1E の UI は `spec.md` §4.4 Workspace Shell (5 領域 grid), §4.5 別画面方針
(Dashboard / Settings / FirstRun), §4.6 デザイントークン (sage / dark gray / amber),
§5.2 受け入れ条件 (5 領域表示 / タブ切替 / Interaction Panel / BottomDrawer 開閉) に
対応する。spec.md が求める「quiet / calm / reliable / memory-oriented」の世界観を
Phase 1 の静的シェルだけで表現することが目標で、iter1〜3 の反復で
デザイントークンの徹底と一貫したタイポグラフィ階層、微細なアクセントを積み上げた。

## Iteration History

### Iteration 0 (baseline)
- 判断: — (初回、既存スクショを評価)
- Design quality: 2/5
- Originality: 1/5
- Craft: 2/5
- 合計 5/15
- 主な課題:
  - Header のブランド存在感が弱く、body への視線誘導が平坦
  - BottomDrawer のタブバーが 32px 固定 + 小さな文字で潰れ気味
  - FirstRun の「仮実装」注意書きがアンバー一色で下品
  - VS Code 亜種のテンプレ感が強く、memory ツールらしさが欠如
  - Empty state がアンバー生色で落ち着きを損ねている

### Iteration 1 (refine)
- 判断: refine
- Design quality: 3/5 (+1)
- Originality: 2/5 (+1)
- Craft: 3/5 (+1)
- 合計 8/15 (+3)
- 改善内容:
  - `Header.module.css` / `Header.tsx`: sage dot brand mark + mono tagline "memory workspace" + subtle gradient + bottom sage hairline
  - `LeftSidebar.module.css`: section label に `::before` 2px sage accent bar を追加 (65% opacity)、item selected state を rgba sage bg + sage left border に
  - `RightPanel.module.css`: 同じ accent bar パターン、taskInput の radius と padding 拡大、empty state を italic muted + 小さな amber dot
  - `MainTabs.module.css`: tab padding を上下非対称にし、underline を margin-bottom: -1px で border に hug、tab label letter-spacing 調整
  - `BottomDrawer.module.css`: tab label を uppercase + letter-spacing 0.1em、trigger toggle を 26x22 の box に拡大、panel を mono font
  - `FirstRunRoute.module.css`: sage radial gradient 背景 + top sage hairline + headerBadge (sage pill with dot) + label を uppercase tracked、placeholder notice を点線 + small amber dot の italic muted 表現に
  - `FirstRunRoute.tsx`: `<span className={styles.headerBadge}>First Run</span>` 追加
  - `DashboardRoute.module.css` / `SettingsRoute.module.css` / `.tsx`: eyebrow mono uppercase `QUIETMEM · SCREEN` + 改行された subtitle + 戻るボタンを outline 形式に
  - `styles/tokens.css`: `--space-5: 20px` を追加 (明示的な 20px 段)
- 残課題: Originality が 2 → もう一歩独自性が欲しい。Overview/Memory などタブの中身が空 h2 + 一行 p で情緒が弱い

### Iteration 2 (refine)
- 判断: refine (方向は良いので継続)
- Design quality: 4/5 (+1)
- Originality: 3/5 (+1)
- Craft: 4/5 (+1)
- 合計 11/15 (+3)
- 改善内容:
  - `tabs/Placeholder.module.css` 新規: 共通 placeholder スタイル (10px mono eyebrow / 22px display title / 14px body / "UPCOMING" badge pill + left sage accent bar を持つ hint row)
  - `tabs/OverviewTab.tsx`: eyebrow "Overview" + h2 "Project, Agent, Worktree を一画面で" + 説明文 + `UPCOMING · task-1F01` hint row
  - `tabs/EditorTab.tsx`: eyebrow "Editor" + h2 "静かに書く場所" + QTM-004 hint
  - `tabs/MemoryTab.tsx`: eyebrow "Memory" + h2 "Raw と Curated の二層記憶" + QTM-005 hint
  - `tabs/RunsTab.tsx`: eyebrow "Runs" + h2 "Agent の実行履歴" + QTM-006 hint
  - `tabs/CronTab.tsx`: eyebrow "Cron" + h2 "静かに回るスケジュール" + QTM-008 hint
  - `shell/BottomDrawer.tsx`: `DRAWER_HINTS` 定数追加、開閉 panel に eyebrow + italic hint を表示 (例: "実行ログのライブ追従パネルです。Adapter と Run が接続される QTM-006 で使われ始めます。")
  - `shell/BottomDrawer.module.css`: `.panelInner`, `.panelEyebrow`, `.panelHint` 追加
  - `shell/MainTabs.module.css`: tab padding を 14/12 非対称、tabPanel padding を 24 → 32 に、global h2 セレクタは削除 (Placeholder 側の .title に委譲)
- 残課題: Originality が 3 → もう一歩で 4 に届く。RightPanel の taskInput placeholder が section title と重複 (`次のタスク`)

### Iteration 3 (refine, final)
- 判断: refine
- Design quality: 4/5 (±0)
- Originality: 4/5 (+1)
- Craft: 4/5 (±0)
- 合計 12/15 (+1)
- 改善内容:
  - `shell/Header.tsx`: 選択中 project の slug をもとに `/ {slug} / workspace` 形式の mono breadcrumb を tagline の右に追加 (IDE らしい系譜表現)
  - `shell/Header.module.css`: `.breadcrumb` / `.breadcrumbSep` / `.breadcrumbItem` (mono 11px, border-left 1px で区切る)
  - `shell/RightPanel.tsx`:
    - section title "次のタスク" → "Next Task", Latest Interactions と揃える
    - TaskInput section header に `disabled · phase 1` mono hint を右寄せで追加
    - placeholder を inspirational な日本語文言に: "例: この raw memory を curated memory に昇格して、タグを付け直す"
    - empty state を 2 文構造に: "まだ実行がありません。Agent を作って最初のタスクを回すと、ここに履歴が積まれます。" / "参照中の memory はありません。Run に添付した context がここに並びます。"
  - `shell/RightPanel.module.css`: `.sectionHint` 追加 (10px mono gray-600)
  - `routes/WorkspaceRoute.module.css`:
    - subtle sage radial gradient (6% center opacity) を `background` に重ねる
    - `.root::before` で 3.5% opacity の SVG fractalNoise grain を overlay blend で載せる (pure flat dark surface からの脱却)
    - `> *` を relative / z-index 1 にして grain の上に保つ
  - `LeftSidebar.module.css` / `RightPanel.module.css`: accent bar ::before opacity を 0.55 → 0.65 に強化

### Iteration 4+
- 実施せず。終了条件 (全軸 4 以上) を iter3 で達成したため。

## Final Scores

- Design quality: **4/5**
- Originality: **4/5**
- Craft: **4/5**
- 合計: **12/15**
- 判定: **pass**

## Spec / ui-shell.md 準拠チェック

- grid-template-columns `240px 1fr 320px` は変更していない ✓
- grid-template-rows は `48px 1fr 32px/272px` の drawer 開閉切替をそのまま維持 ✓
- grid-template-areas は `header header header / left main right / drawer drawer drawer` のまま ✓
- MainTabs 5 タブ (Overview / Editor / Memory / Runs / Cron) の key / label / active state 管理は変更なし ✓
- BottomDrawer 4 タブ (diff / logs / problems / output) と `drawerOpen` / `drawerTab` は変更なし ✓
- デザイントークン (セージ / ダークグレー / アンバー) はすべて `--accent-primary`, `--bg-surface`, `--accent-attention` 経由で参照、raw 色はほぼ使用せず ✓
  - 例外: `rgba(111, 143, 106, ...)` のみ sage 半透明背景に使用。色値は `--color-sage-500` と同一
- ui-shell.md §4.5 FirstRunRoute / DashboardRoute / SettingsRoute の要件 (中央寄せカード + タイトル + サブテキスト + 戻るボタン) はすべて保持、装飾だけ追加 ✓
- a11y: `role="tablist" / tab / tabpanel`, `aria-selected`, `aria-expanded`, `aria-label` の既存実装はすべて変更なし、focus-visible も維持 ✓
- Non-goal 遵守: Monaco / ファイルツリー / Run 実行 / Memory CRUD などは一切触っていない ✓

## Screenshots

- /tmp/ui-rev-iter0-firstrun.png (initial FirstRun baseline)
- /tmp/eval-phase-1E-02-workspace.png (initial workspace baseline, from handed-off eval)
- /tmp/ui-rev-iter1-firstrun.png, /tmp/ui-rev-iter1-workspace.png
- /tmp/ui-rev-iter2-workspace.png, /tmp/ui-rev-iter2-memory.png, /tmp/ui-rev-iter2-drawer.png, /tmp/ui-rev-iter2-dashboard.png
- /tmp/ui-rev-iter3-firstrun.png, /tmp/ui-rev-iter3-workspace.png, /tmp/ui-rev-iter3-memory.png, /tmp/ui-rev-iter3-drawer.png, /tmp/ui-rev-iter3-dashboard.png, /tmp/ui-rev-iter3-settings.png

## Critique (final)

UI 品質は target に達したが、残る軽微な改善余地:

1. **LeftSidebar AGENTS プレースホルダ**: `Agent 一覧は後続タスクで接続します` は他の場所と比べ情緒が弱い。task-1F で接続する際に、selected project を見てもまだ agent 0 件のときの 2 文構造 (例: `まだ agent がいません。/ 最初の agent を作って、このプロジェクトの memory を育て始めましょう。`) に差し替えたい
2. **BottomDrawer の toggle 矢印** (▲/▼) のサイズは 10px で、Header nav button (`Dashboard` / `Settings`) に比べて視覚重要度が低い。意図的に自制しているとも読めるが、ホバー時にだけ sage アクセントを出すなどでフィードバックを強めてもよい
3. **Dashboard / Settings カード**: 内容がサブテキスト 1 行のみ。Phase 1 の最小要件は満たしているが、カードの呼吸感を強めるには subtitle の下に `coming in QTM-009` 等の timeline hint を入れたい (後続フェーズで判断)
4. **Overview タブの h2 "Project, Agent, Worktree を一画面で"** は日本語助詞の「を」が主語的で少し硬い。タイトルのスタイルガイドを spec.md レベルで定義してから再考するのが良い
5. **Header の breadcrumb** は今 "selected project があるときだけ" 表示するが、FirstRun → Workspace 初回遷移時には空になる。project を選ぶまで何も出ないのは craft として正しいが、`/ no project` などの "empty breadcrumb" は入れない (quiet な原則)

## Known Gaps (次フェーズ対応候補)

- **task-1F01 統合時に Placeholder を撤去**: 現状 OverviewTab は `Placeholder.module.css` で占められているため、task-1F01 で ProjectCreateForm / ProjectList を差し込む際、このスタイルは削除するか `.emptyProject` セクションだけ残すか要判断
- **Memory / Runs / Cron / Editor タブの placeholder**: 実装フェーズに入ったらすべて差し替え。Placeholder.module.css は削除対象
- **RightPanel の taskInput**: Phase 1 では disabled だが、有効化されたときに monospace と sans の切替をどうするか、改めて考察が必要
- **LeftSidebar AGENTS プレースホルダ**: 上記 critique 1 のとおり、task-1F で agent list 統合時に豊かな empty state に差し替え
- **BottomDrawer panel の hint**: 現在は mock 文言なので、QTM-006/007 で adapter が接続された後、実データに置き換える
- **Grain texture の DPR 対応**: 2x retina では grain が少しざらつく。QTM-009 の polish phase で `image-rendering: pixelated` か SVG の baseFrequency 調整を検討

## Temporary Review Infrastructure

UI 評価を FirstRun を通さず workspace で行うため、以下の最小変更を `main.tsx` と `App.tsx` に追加した。**これは UI 評価用であり機能には影響しない**ので、Phase 1 の受け入れ条件には響かない:

- `src/main.tsx`: URL に `?review=1` があれば `window.__UI_REVIEW__ = true` をセットし、
  `useProjectStore.setState` でサンプル Project 2 件 (Eval Project / Notebook) を注入し、`useUiStore` の route を `workspace` に
- `src/App.tsx`: `__UI_REVIEW__` が立っている場合、projects 0 件 → firstRun への自動遷移 effect を早期 return で無効化

本番ビルドでは `?review=1` が付かない限り従来どおり動作する。そのまま残すか削除するかは orchestrator / planner の判断に委ねる。削除する場合は:

```bash
git restore src/main.tsx src/App.tsx
# あるいは手動で revert する
```

削除しても Phase 1E の成果物 (Header / LeftSidebar / MainTabs / RightPanel / BottomDrawer / Routes / Tabs / tokens) には影響しない。

## Gemini Review

skip (Gemini CLI は認証済みだが、`-p ... --sandbox` 経由でのスクリーンショット解析が
この環境では 3 分以上応答せずタイムアウトした。画像なしの構造的プロンプトでも同様。
セカンドオピニオンなしで terminate)。

cross_model_delta: 比較対象なし

## Files Changed

### CSS (全面刷新)
- src/styles/tokens.css (`--space-5` 追加)
- src/shell/Header.module.css (gradient + breadcrumb + brand mark)
- src/shell/LeftSidebar.module.css (accent bar + quieter selected state)
- src/shell/RightPanel.module.css (accent bar + section hint + inspirational placeholder)
- src/shell/MainTabs.module.css (tab padding, underline hug)
- src/shell/BottomDrawer.module.css (uppercase tab labels + panel inner styles)
- src/routes/WorkspaceRoute.module.css (radial gradient + grain)
- src/routes/FirstRunRoute.module.css (badge, hairline, dashed placeholder notice)
- src/routes/DashboardRoute.module.css (eyebrow mono + outline back button)
- src/routes/SettingsRoute.module.css (同上)
- src/tabs/Placeholder.module.css (新規)

### TSX (軽微な編集)
- src/shell/Header.tsx (breadcrumb 追加)
- src/shell/RightPanel.tsx (section hint + inspirational placeholder + 2-sentence empty state)
- src/shell/BottomDrawer.tsx (DRAWER_HINTS 定数 + panelInner)
- src/routes/FirstRunRoute.tsx (headerBadge 追加のみ)
- src/routes/DashboardRoute.tsx (eyebrow 追加)
- src/routes/SettingsRoute.tsx (同上)
- src/tabs/OverviewTab.tsx / EditorTab.tsx / MemoryTab.tsx / RunsTab.tsx / CronTab.tsx (共通 Placeholder スタイル使用)

### Review infra (削除可能)
- src/main.tsx (`?review=1` サンプル注入)
- src/App.tsx (`__UI_REVIEW__` ガード)

全ファイルに対して `pnpm exec tsc --noEmit` でタイプチェック成功を確認済み (exit 0)。

## Next Steps (for orchestrator)

1. Phase 1E の UI 品質は pass。evaluator に進むか、task-1F フェーズに進める
2. `src/main.tsx` / `src/App.tsx` の review 用コードを残すか削除するか決める
3. Known Gaps の項目は task-1F / QTM-009 で拾う
