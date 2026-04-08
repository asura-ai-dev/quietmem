# QuietMem Phase 1 Spec (QTM-001 + QTM-002)

対象チケット: QTM-001 Project / Agent / Worktree Foundation, QTM-002 Workspace Shell and Navigation

## 1. 目的 (Goal)

QuietMem の Phase 1 として、以下を成立させる。

- Tauri + React + TypeScript + Vite + SQLite の土台を立ち上げる
- Project / Agent / Worktree という主要ドメインエンティティを SQLite に永続化し、最低限の create / list / update を提供する
- Run / RawMemoryEntry / CuratedMemory のテーブル骨格を先行で用意し、後続チケットが破壊的変更なしに乗れる土台を作る
- L04 で定義された 1 画面中心の Workspace Shell（Header / LeftSidebar / MainTabs / RightPanel / BottomDrawer）を表示し、主要タブを切り替えられる
- セージグリーン / ダークグレー / アンバーを基調とするデザイン基礎色を確定し、後続 UI 実装の起点を作る

このフェーズ完了時点で、ユーザーは「Project を作り、Agent を作り、Worktree を紐付けて、それらを Workspace Shell 上で確認する」という最小ループを完遂できる。

## 2. 対象範囲 (Scope)

### 2.1 データ層 (QTM-001)

- SQLite データベースの初期化処理（アプリ起動時にスキーマを保証する）
- マイグレーション機構の最小実装（バージョン管理可能であること）
- 以下テーブルの作成（最小カラム）
  - `projects` (CRUD 対象)
  - `agents` (CRUD 対象、`active_worktree_id` を含む)
  - `worktrees` (CRUD 対象)
  - `runs` (骨格のみ、Phase 1 では CRUD 不要)
  - `raw_memory_entries` (骨格のみ)
  - `curated_memories` (骨格のみ)
- ローカルファイル保存先のディレクトリ規約（ルート、サブディレクトリ、用途）

### 2.2 バックエンド層 (QTM-001)

- Tauri commands による以下の操作
  - `project.create` / `project.list` / `project.update`
  - `agent.create` / `agent.list_by_project` / `agent.update`
  - `agent.set_active_worktree`（または update に統合）
  - `worktree.create` / `worktree.list_by_project` / `worktree.update`
- DB アクセス層の単体／結合テスト

### 2.3 フロントエンド層 (QTM-002)

- Workspace Shell 構造
  - Header（プロジェクト切替の入口、アプリ名表示）
  - LeftSidebar（Project / Agent ナビゲーション領域、後続フェーズで file tree を入れる余地）
  - MainTabs（Overview / Editor / Memory / Runs / Cron の 5 タブ切替）
  - RightPanel（Interaction Panel: task input / latest interactions / memory context preview のプレースホルダ。チャット主役にしない）
  - BottomDrawer（diff / logs / problems / output のプレースホルダ。開閉可能）
- 別画面方針の反映
  - Dashboard を別画面として扱える経路（ルーティングまたはモード切替）
  - Settings を別画面として扱える経路
  - 初回セットアップ画面（DB が空、または初回起動時に表示する経路）
- デザイントークン
  - セージグリーン（プライマリ）
  - ダークグレー（背景・サーフェス）
  - アンバー（補助・アクセント）
  - これらを CSS 変数またはテーマ定義として一元管理する
- 最低限の操作 UI
  - Project 一覧と作成フォーム
  - Project 配下の Agent 一覧と作成 / 更新フォーム
  - Worktree 一覧と作成 / 更新フォーム
  - Agent と Worktree を結びつける UI（active_worktree_id を選択できる）

## 3. 対象外 (Non-goals)

以下は Phase 1 では実装しない。後続チケットで扱う。

- Monaco Editor 統合 (QTM-004)
- ファイルツリー / ファイル読み書き (QTM-004)
- Memory の本文編集 / curated 昇格 / semantic 検索 / digest (QTM-005)
- Adapter / Run 実行 / Interaction Panel の実機能 (QTM-006)
- Worktree の git 操作 / diff 表示 (QTM-007)
- Cron Job (QTM-008)
- Embedding 生成、バックグラウンドジョブ
- 認証、マルチユーザー、クラウド同期
- Run / RawMemoryEntry / CuratedMemory の CRUD（テーブル骨格のみ）
- 高度なエラーハンドリング、ステータス可視化の作り込み (QTM-009)
- Project の archive / soft delete

## 4. 主要機能 (Key Features)

### 4.1 SQLite 初期化とスキーマ

- アプリ起動時に SQLite ファイルが存在しなければ作成する
- 必要なテーブルが存在しなければ作成する（あるいはマイグレーションを順次適用する）
- スキーマバージョンを記録する（後続フェーズの追加カラムに備える）
- スキーマはコードで定義され、再現可能であること

#### 4.1.1 テーブル定義（最小カラム）

L09 をベースに、Phase 1 で必要な列のみを抜粋する。後続フェーズで列追加することを前提にする。

`projects`

- id (PK), name, slug, root_path, created_at, updated_at

`agents`

- id (PK), project_id (FK), name, role, adapter_type, prompt_path, config_path, status, active_worktree_id (FK nullable), created_at, updated_at

`worktrees`

- id (PK), project_id (FK), agent_id (FK nullable), branch_name, path, base_branch, status, created_at, updated_at

`runs`（骨格のみ）

- id (PK), project_id, agent_id, worktree_id, cron_job_id (nullable), task_title, task_input, status, log_path, interaction_log_path, created_at, updated_at

`raw_memory_entries`（骨格のみ）

- id (PK), project_id, agent_id (nullable), type, content_path, summary, tags_json, source_raw_memory_entry_id (nullable), embedding_status, created_at, updated_at, dismissed_at (nullable)

`curated_memories`（骨格のみ）

- id (PK), project_id, agent_id (nullable), title, summary, category, curation_type, scope, importance, source_refs_json, timeframe_type, timeframe_start, timeframe_end, key_points_json, embedding_status, created_at, updated_at

注: agents.active_worktree_id と worktrees.agent_id は循環参照を避けるため、外部キーは「論理的な紐付け」として表現できればよい（厳密な FK 制約をかけるかは architect 判断）。

### 4.2 ローカルファイル保存先の基礎ルール

L09 に従い、SQLite に格納しないものはローカルファイルへ。Phase 1 ではルールを定義し、ディレクトリを作成可能にする。

- アプリデータルート: OS の標準アプリデータディレクトリ配下に QuietMem 用ディレクトリを設ける
- 配下に以下サブディレクトリ規約を持つ（Phase 1 では空でもよい）
  - `db/` SQLite 本体
  - `projects/<project_id>/agents/<agent_id>/prompt/` prompt ファイル
  - `projects/<project_id>/agents/<agent_id>/config/` agent 設定 JSON
  - `projects/<project_id>/agents/<agent_id>/raw/` raw memory 本文
  - `projects/<project_id>/runs/<run_id>/log/` 実行ログ全文
  - `projects/<project_id>/snapshots/` スナップショット
- ルール定義はコード（定数 or 関数）で表現される

### 4.3 Tauri commands (CRUD)

最低限以下を提供する（命名は architect 判断で揃える）。

- Project: create / list / update
- Agent: create / list_by_project / update（active_worktree_id 更新を含む）
- Worktree: create / list_by_project / update

各 command はフロントエンドから呼び出し可能で、結果は型付きで返る。

### 4.4 Workspace Shell

- 5 領域レイアウト（Header / LeftSidebar / MainTabs / RightPanel / BottomDrawer）が常に表示される
- MainTabs は Overview / Editor / Memory / Runs / Cron の 5 タブ
  - Phase 1 では各タブの中身は最小プレースホルダで良い
  - Overview は Project / Agent / Worktree の概要表示と作成フォームを持ってよい
- RightPanel は「Interaction Panel」として、task input / latest interactions / memory context preview のセクションをプレースホルダで配置する
  - チャット UI の主役にはしない
- BottomDrawer は開閉可能。中身は diff / logs / problems / output のタブまたはセクションのプレースホルダ
- LeftSidebar は Project と Agent のナビゲーションを表示する

### 4.5 別画面方針

- Dashboard / Settings / 初回セットアップは Workspace Shell とは別レイアウトで表示できる経路を持つ
- 初回セットアップは「Project が 1 件もない」状態で起動した場合に到達するか、明示的に呼び出せること
- Phase 1 では別画面の中身を最小実装でよい（タイトル + 主要 CTA のみで可）

### 4.6 デザイントークン

- セージグリーン: プライマリ（操作対象、アクセント）
- ダークグレー: 背景、サーフェス、テキスト基調
- アンバー: 補助、注意、ハイライト
- これらを CSS 変数 / テーマ定義として一元化し、コンポーネントから参照する
- L01 の Visual Direction（quiet / calm / reliable）を反映し、彩度を抑えた静かなトーンとする

### 4.7 Project / Agent / Worktree の最低限 UI

- Project: 一覧表示 + 新規作成フォーム（name, slug, root_path）
- Agent: Project 選択後に一覧表示 + 新規作成フォーム（name, role, adapter_type, prompt_path, config_path, status）
- Worktree: Project 選択後に一覧表示 + 新規作成フォーム（branch_name, path, base_branch, status）
- Agent 編集画面で active_worktree_id を選択できる（Worktree 一覧から選ぶ）

## 5. 受け入れ条件 (Acceptance Criteria)

### 5.1 QTM-001 由来

- アプリ起動時に SQLite が初期化される（DB ファイルが存在しなければ作成、必要テーブルが存在しなければ作成）
- DB スキーマの初期版がコード上で定義されている（マイグレーション or schema 定義モジュール）
- Project を作成できる。作成した Project が一覧に表示される
- Agent を Project 配下に作成できる。作成後に更新もできる
- Worktree を作成できる。作成した Worktree が Project ごとに一覧に表示される
- Agent の `active_worktree_id` を更新でき、保存後に再取得しても保持されている
- `runs` / `raw_memory_entries` / `curated_memories` テーブルが存在する（中身は空でよい）
- ローカルファイル保存先のディレクトリ規約がコードで定義され、必要時に作成される
- DB アクセス層に対してユニットまたは結合テストが存在し、create / list / update を検証している

### 5.2 QTM-002 由来

- Workspace Shell の 5 領域（Header / LeftSidebar / MainTabs / RightPanel / BottomDrawer）が画面に表示される
- MainTabs で Overview / Editor / Memory / Runs / Cron を切り替えられる（クリックで対応する中身が切り替わる）
- Dashboard / Settings / 初回セットアップへの遷移経路が存在し、別画面として表示される
- 初回セットアップは Project が 0 件のときに到達可能である
- セージグリーン / ダークグレー / アンバーの 3 色がデザイントークンとして定義され、Shell 内で実際に使われている
- RightPanel が Interaction Panel として task input / latest interactions / memory context preview の構造で表示される（チャット UI ではない）
- BottomDrawer が開閉できる

### 5.3 統合 Smoke

- アプリを起動 → 初回セットアップ画面に到達 → Project を作成 → Workspace Shell に遷移 → Agent を作成 → Worktree を作成 → Agent の active_worktree_id に作成済み Worktree を割り当て → Agent 一覧で active_worktree_id が反映されている、までを GUI 上で完了できる
- 上記操作後にアプリを再起動しても、作成した Project / Agent / Worktree とその関連が保持されている

## 6. 非機能要件

- プラットフォーム: 初期ターゲットは macOS (darwin arm64)。Tauri のクロスプラットフォーム性は維持する（Windows / Linux で破壊的にならないコード方針）
- ランタイム: Rust (Tauri バックエンド) + TypeScript / React (フロントエンド) + Vite
- DB: SQLite。具体ライブラリは architect で確定（rusqlite / sqlx 等）
- パッケージマネージャ: Node 側は pnpm を第一候補とする（npm / yarn でも可、architect で確定）
- 文字コード: UTF-8 統一
- ファイルパス: パス区切りは OS ネイティブを尊重し、保存時はプラットフォーム差異を吸収
- 性能: Phase 1 段階では明示的な性能要件なし。ただし起動時の初期化処理が体感で遅すぎないこと（数百ミリ秒オーダー目安）
- アクセシビリティ: タブとボタンはキーボード操作可能であることを最低ラインとする
- セキュリティ: ローカルアプリのため認証は不要。SQLite ファイルとローカルファイル保存先は OS のユーザーディレクトリ配下に置く
- テスト: DB 層のユニット／結合テストを必須とする。フロントエンドは Phase 1 では手動確認で可
- ロギング: Tauri バックエンドの初期化失敗時に最低限のログを出すこと

## 7. 技術前提と確定事項

- Tauri + React + TypeScript + Vite を採用する（00-overview / L01 から確定）
- データストアは SQLite + ローカルファイルのハイブリッド（L09 から確定）
- Monaco Editor は QTM-004 で導入するため Phase 1 では含めない
- チャット画面は作らない。RightPanel はチャットではなく Interaction Panel（run / memory 補助）
- L02 のエンティティ階層（Project > Agent > Worktree / Runs / Memory）に従う
- Agent は active_worktree_id を保持する（L02 の要件）

## 8. 未確定事項 / 後続フェーズで決める事項

以下は architect / contract フェーズで決定する。Planner では固定しない。

- SQLite ライブラリ選定 (rusqlite vs sqlx)
- マイグレーション機構の具体実装 (refinery / sqlx::migrate / 自前 SQL 適用)
- フロントエンド状態管理 (zustand / jotai / Redux Toolkit / React Context)
- スタイリング手法 (CSS Modules / Tailwind / vanilla-extract / styled-components)
- ルーティング方式 (react-router / 自前 state-based ルーティング)
- Tauri command の命名規則 (snake_case / dot.notation)
- ID 採番方式 (UUID v7 / ULID / SQLite rowid)
- テーブル間の FK 制約をどこまで厳格にかけるか（特に agents.active_worktree_id ↔ worktrees.agent_id の循環）
- パッケージマネージャの最終確定 (pnpm / npm)

## 9. 想定ユーザーフロー (Smoke Flow)

1. ユーザーが QuietMem を初回起動する
2. アプリが SQLite を初期化し、Project が 0 件のため初回セットアップ画面が表示される
3. ユーザーが Project を作成する（name / slug / root_path を入力）
4. Workspace Shell に遷移する
5. ユーザーが Overview タブで Project の存在を確認する
6. ユーザーが LeftSidebar または Overview から Agent を作成する（name / role / adapter_type など）
7. ユーザーが Worktree を作成する（branch_name / path / base_branch）
8. ユーザーが Agent 編集画面で active_worktree_id に作成した Worktree を割り当てる
9. Agent 一覧で active_worktree_id が反映されていることを確認する
10. ユーザーが MainTabs を Editor / Memory / Runs / Cron に切り替え、それぞれプレースホルダが表示されることを確認する
11. ユーザーが BottomDrawer を開閉できる
12. ユーザーが Settings 別画面へ遷移し、戻れる
13. アプリを再起動し、作成した Project / Agent / Worktree が保持されていることを確認する

## 10. 実装順序（推奨）

依存関係を踏まえた推奨順。実装者の判断で前後してよい。

1. Tauri + React + TypeScript + Vite のプロジェクト初期化
2. SQLite 接続層とマイグレーション機構の最小実装
3. テーブル定義（projects / agents / worktrees の最小 + runs / raw_memory_entries / curated_memories の骨格）
4. ローカルファイル保存先のパス規約をコード化
5. Tauri commands の実装（projects → agents → worktrees の順）
6. DB 層のテスト
7. デザイントークン定義（CSS 変数 / テーマ）
8. Workspace Shell の 5 領域レイアウトを静的に組む
9. MainTabs の切替実装
10. 別画面方針（Dashboard / Settings / 初回セットアップ）の経路を作る
11. Project / Agent / Worktree の一覧 + 作成 + 更新 UI を Overview タブに実装
12. Smoke Flow 全体を手動で通す

## 11. 評価観点 (Evaluator Checklist)

Evaluator は以下を確認する。

### 11.1 主要ユーザーフロー

- 初回起動 → 初回セットアップ → Project 作成 → Workspace Shell の遷移が成立するか
- Project / Agent / Worktree の作成と一覧表示がそれぞれ動くか
- Agent の active_worktree_id を Worktree に紐付け、保存後も反映されているか
- MainTabs 5 タブが切り替わるか
- BottomDrawer が開閉できるか
- Dashboard / Settings 別画面に遷移できるか

### 11.2 API（Tauri commands）

- project.create / list / update が呼び出せ、想定どおりの値を返すか
- agent.create / list_by_project / update が呼び出せるか
- worktree.create / list_by_project / update が呼び出せるか
- agent.update（または専用 command）で active_worktree_id を更新できるか
- 各 command の入出力に型がついているか

### 11.3 保存状態

- アプリ再起動後、Project / Agent / Worktree とその紐付けが保持されているか
- SQLite ファイルが期待のディレクトリに作成されているか
- ローカルファイル保存先のディレクトリ規約がコードに定義されているか
- runs / raw_memory_entries / curated_memories テーブルが存在するか（中身は空で良い）

### 11.4 エラー時挙動

- DB 初期化に失敗した場合、ユーザーに分かる形でメッセージが出るか（最低限ログでも可）
- 必須項目未入力で create を呼んだときに失敗が伝わるか
- 存在しない project_id で agent.list_by_project を呼んだときに空配列または明示的エラーになるか

### 11.5 UI / デザイン

- セージグリーン / ダークグレー / アンバーがデザイントークンで定義され、実際に使われているか
- RightPanel が Interaction Panel 構造（task input / latest interactions / memory context preview）になっており、チャット UI ではないか
- L01 の visual direction（quiet / calm / reliable）に沿った静かなトーンか
- L04 の 1 画面中心方針（5 領域構成）が表現されているか

### 11.6 スタブ / 見せかけ実装の検出

- 一覧表示が実 DB ではなくダミー配列を返していないか
- create フォームが UI だけで実際には保存されていない、ということが起きていないか
- タブ切替が見た目だけで中身を切り替えていない、ということが起きていないか

## 12. 依存関係

- 本 Phase は QTM-003 以降すべての前提
  - QTM-003+: Project / Agent CRUD と Workspace Shell に依存
  - QTM-004 (Editor): MainTabs の Editor タブと LeftSidebar に統合
  - QTM-005 (Memory): MainTabs の Memory タブと、raw / curated テーブル骨格に統合
  - QTM-006 (Run / Adapter): runs テーブル骨格と RightPanel に統合
  - QTM-007 (Worktree git 操作): worktrees テーブルと BottomDrawer の diff に統合
  - QTM-008 (Cron): MainTabs の Cron タブに統合
- 後続フェーズが本 Phase の DB スキーマとレイアウトを参照する
- スキーマ変更が必要になった場合はマイグレーションで対応し、spec を revised spec として更新する
