# QuietMem Phase 2 Spec (QTM-003 Agent Management UI)

対象チケット: QTM-003 Agent Management UI

参考: docs/L05-agent-management.md, docs/tickets/QTM-003-agent-management-ui.md, agent-docs/phase-1-spec.md

---

## 1. 目的 (Goal)

QuietMem の Phase 2 として、Agent の一覧、作成、編集、複製、状態表示を GUI から完結できる「Agent 管理 UI」を提供する。Phase 1 で構築した Workspace Shell と Project / Agent / Worktree の CRUD 基盤の上に、以下を成立させる。

- ユーザーが Project を切り替え、その配下の Agent を一覧から把握できる
- Agent を新規作成、編集、複製できる
- Agent の status (`idle` / `running` / `error` / `needs_input`) を一覧と詳細の双方で識別できる
- Agent の複製時に「元 Agent の個別 memory を引き継がない」方針が UI と処理に反映される
- LeftSidebar の Agents セクションが placeholder ではなく、実 Agent 一覧として動作する

このフェーズが完了した時点で、ユーザーは「Project を選び、Agent を作り、複製し、status を見て、編集し、別 Worktree に紐付け直す」までの並列運用準備を 1 画面で完遂できる。

---

## 2. 対象範囲 (Scope)

### 2.1 フロントエンド層

- **Project switcher**: Header または LeftSidebar から複数 Project 間を切り替えられる UI (Phase 1 でも LeftSidebar に Project 一覧はあるが、UX 観点で「現在選択中 Project」が明示されていることを保証する)
- **LeftSidebar Agents セクションの実装**: Phase 1 で placeholder だった `Agents` セクションを、選択中 Project の Agent 一覧として動作させる
- **Agent 一覧の強化**: Overview タブ内 (および LeftSidebar) で name / role / status / active worktree を表示する
- **Agent 作成フォーム**: 既存 `AgentCreateForm` を基に、status / role / adapter_type の選択肢を一覧化する (自由文字列ではなく定義済み値からの選択)
- **Agent 編集フォーム**: 既存 `AgentEditForm` を継承し、複製ボタンを追加する
- **Agent 複製機能**: 「複製」ボタンから元 Agent の設定を引き継いだ新 Agent を作成する。複製方針 (memory を引き継がない旨) を UI 上で明示する確認ダイアログまたはヒントテキストを表示する
- **Agent status 表示**: status の 4 値 (`idle` / `running` / `error` / `needs_input`) を視覚的に区別する (色 / アイコン / ラベルのいずれか、ただしテキストでも状態名が読めること)

### 2.2 バックエンド層

- **agent_duplicate Tauri command**: Agent を複製する専用 command を新設する
  - 入力: 元 Agent の `id`、新 Agent の `name` (省略時は `<元 name> (copy)` を Rust 側で生成)
  - 動作: 元 Agent の `role` / `adapter_type` / `prompt_path` / `config_path` を引き継ぎ、新 `id` / `created_at` / `updated_at` を採番する。`status` は強制的に `idle` で開始する。`active_worktree_id` は **null** で開始する (新 Agent は別 Worktree に接続する想定)
  - **memory 非引継ぎ**: `raw_memory_entries` / `curated_memories` の `agent_id` を新 Agent に複製しない (= 何もしない)。Phase 2 時点では memory テーブルに対する INSERT は発生しない
  - 戻り値: 新規作成された `Agent` DTO
- **status enum 化 (バックエンド側の緩い検証)**: `agent_create` / `agent_update` / `agent_duplicate` の入力 `status` を 4 値 (`idle` / `running` / `error` / `needs_input`) に制限する。範囲外の値は `InvalidInput` で拒否する。既存 DB レコードが範囲外の値を持っていても read は失敗させない (前方互換のためのエスケープハッチ)
- **既存 command の追従**: `agent_create` / `agent_update` の status バリデーションを上記 enum に揃える

### 2.3 データ層

- **スキーマ変更は原則行わない**: Phase 1 で `agents.status` は既に `TEXT NOT NULL DEFAULT 'idle'` として存在しているため、テーブル定義の変更は不要
- **status の有効値**: アプリケーション側 (Rust 側) で `'idle' | 'running' | 'error' | 'needs_input'` をホワイトリストとして定数定義し、create / update / duplicate のバリデーションで参照する
- **memory テーブルへの参照**: Phase 2 では `raw_memory_entries` / `curated_memories` の CRUD は行わない (テーブルには触れない)。複製時に「触れないこと」が memory 非引継ぎの実装そのものであることを Rust 側コメントとテストで明示する

### 2.4 型定義 (bindings.ts / Rust DTO)

- `AgentStatus` 型を bindings.ts に追加 (`'idle' | 'running' | 'error' | 'needs_input'`)
- `Agent.status` の型を `string` から `AgentStatus` に変更 (前方互換のため、TS 側では `AgentStatus | string` のユニオンを許容するか、Rust 側で必ず正規化して返す方針を取るかを architect 判断とする)
- `AgentDuplicateInput` 型を Rust / TS 両方に追加

---

## 3. 対象外 (Non-goals)

以下は QTM-003 では実装しない。

- **Run / Adapter 実行 (QTM-006)**: status を実行ライフサイクルに連動させる仕組み、`runs` テーブルへの書き込み、Adapter 起動、ログストリーミング、Interaction Panel (RightPanel) の機能化はすべて Phase 2 では行わない。status は手動更新 (編集フォーム経由) のみで構わない
- **Memory CRUD (QTM-005)**: raw / curated memory の作成・編集・閲覧 UI は Phase 2 では作らない。複製時の「memory を引き継がない」は「memory に何もしない」ことで満たす
- **Worktree git 操作 (QTM-007)**: Worktree の作成/削除/git 操作は Phase 1 のメタデータ CRUD のみで継続。複製後の Agent を別 Worktree に「自動で割り当てる」操作は行わない (ユーザーが編集フォームから手動で活性 Worktree を選ぶ)
- **Agent の削除 / アーカイブ**: チケットに削除要件はない。Phase 2 では実装しない
- **agent 間の handoff / fork 自動制御** (L05 Non-goals)
- **権限管理** (L05 Non-goals)
- **status 集約ロジック (multi-run aggregation)**: L05 では「agent status は複数 run の集約結果」と書かれているが、これは run が存在する QTM-006 以降の話。Phase 2 ではユーザーが直接 status を選択する単一値モデルで実装する
- **Editor / Memory / Runs / Cron タブの実装**: 引き続き placeholder のまま
- **エラーメッセージの完全な日本語化、ステータス可視化の作り込み** (QTM-009)

---

## 4. 主要機能 (Key Features)

### 4.1 Project Switcher

- LeftSidebar の Projects セクションは Phase 1 で実装済み。Phase 2 では「現在選択中の Project」がより視覚的に明確になるよう微調整する (既存 sage ハイライトを継続でも可)
- Header の breadcrumb に選択中 Project slug が表示されることは Phase 1 で確認済。Phase 2 ではここに「Agent カウント」などの情報追加を検討してもよい (任意)
- Project を切り替えると、配下の Agents セクション (LeftSidebar / Overview) が当該 Project の Agent 一覧に差し替わる
- Project が 1 件もないときは、Agents セクションは空状態を示す (Phase 1 と同じ)

### 4.2 Agent 一覧 (LeftSidebar 統合 + Overview)

- **LeftSidebar の Agents セクション**: 選択中 Project 配下の Agent 一覧を、name + status バッジ で表示する。各項目は click で `selectedAgentId` を更新する。Overview タブの編集フォームと連動する
- **Overview タブの Agent 一覧**: 既存の `AgentList` を強化し、各行に以下を表示する
  - name
  - role
  - status (4 値の視覚バッジ)
  - active worktree branch name (未設定なら em dash)
  - 操作ボタン: 編集 / 複製
- 項目選択 (`selectedAgentId`) の出所は LeftSidebar / Overview のどちらからでも更新可能とする
- 空状態: 「Agent がまだありません」を muted トーンで表示

### 4.3 Agent 作成

- 既存 `AgentCreateForm` を継承して以下の改善を加える
  - **role**: 自由文字列のままで可。ただしプレースホルダ / ヒントテキストで代表値 (planner / generator / evaluator など) を提示する
  - **adapter_type**: 4.1 章の bindings 型と整合する文字列入力 + プレースホルダ。enum 化は QTM-009 が本筋なので Phase 2 では強制しない
  - **status**: select / radio などで 4 値 (`idle` / `running` / `error` / `needs_input`) から選択する (デフォルト `idle`)
  - prompt_path / config_path: 既存通り optional 自由文字列
- 必須項目は `name`。送信成功で一覧に追加され、フォームは初期値に戻る
- 失敗時 (例: status の範囲外、必須未入力) は既存パターンで footer バナー表示

### 4.4 Agent 編集

- 既存 `AgentEditForm` を継承し以下を追加 / 変更する
  - status を select で 4 値から選択
  - active worktree select は維持
  - フォーム上部または下部に「複製」ボタンを追加する (4.5 参照)
- 既存の更新処理 (`agent_update`) が status を 4 値以外で送ると `InvalidInput` を返す状況に追従し、UI 側の state を select 化することで物理的に範囲外を入力できないようにする

### 4.5 Agent 複製

- Overview タブの Agent 行と編集フォームの両方に「複製」ボタンを置く (どちらか片方でも可だが、編集中の Agent を複製したいケースが多いので編集フォーム側を必須とする)
- 複製ボタン押下時のフロー
  1. 確認ダイアログ (modal でなくてもよい、inline の確認バナーでも可) を表示し、以下を明示する
     - 「複製される項目: 名前 / Role / Adapter Type / Prompt Path / Config Path」
     - 「**引き継がれない項目: Agent 固有の memory (raw / curated)、active worktree、status (idle で開始)**」
     - キャンセル / 実行の 2 択
  2. ユーザーが実行を選ぶと `agent_duplicate` Tauri command を呼ぶ
  3. 成功すると一覧が refresh され、新規 Agent が選択状態 (`selectedAgentId`) になる
- 名前の衝突: Phase 2 では `<元 name> (copy)` で許容する (重複でもエラーにしない、`agents.name` には UNIQUE 制約がないため)。ユーザーは複製直後に編集で改名できる

### 4.6 Agent Status 表示

- 4 値の状態を以下のように扱う
  - `idle`: ニュートラル / muted (例: gray-400)
  - `running`: sage (Phase 1 のプライマリ色)
  - `error`: red 系 (新たに `--color-danger` セマンティック alias を tokens に追加してもよい)
  - `needs_input`: amber (Phase 1 のアクセント色)
- 一覧 (LeftSidebar / Overview) と編集フォームの両方で同じ視覚言語を使う
- アクセシビリティ: 色だけに依存せず、ラベルテキスト (`idle` / `running` / `error` / `needs input`) を必ず併記する。`role="status"` または `aria-label` で screen reader 対応
- Phase 2 では status の自動更新は行わない (QTM-006 で接続)

### 4.7 LeftSidebar 統合

- Phase 1 で placeholder のままだった「Agent 一覧は後続タスクで接続します」を撤去
- Project が選択されていない時の空状態は据え置き
- Project 選択中は当該 Project の Agent 一覧を表示し、各行に name + status バッジを置く
- LeftSidebar の Agent 行 click と Overview の編集ボタン click の双方で `selectedAgentId` を同じ store キーで管理する (Phase 1 では Overview ローカル state だった可能性があるため、必要なら uiStore か agentStore に昇格する)

---

## 5. データ層変更

### 5.1 スキーマ

- **追加・変更なし**。Phase 1 の `agents` テーブル定義 (`status TEXT NOT NULL DEFAULT 'idle'` を含む) をそのまま利用する
- マイグレーションファイルは追加しない

### 5.2 アプリケーション層の status enum

- Rust 側に `domain::agent::AgentStatus` を新設 (`enum` または `&'static str` 定数 4 つ)
- `agent_create` / `agent_update` / `agent_duplicate` の入力 `status` を上記ホワイトリストで検証
- 範囲外: `AppError::InvalidInput("status must be one of idle|running|error|needs_input")` で reject
- DB 側の文字列カラムは維持 (前方互換性の確保)
- 既存テスト (`update_with_none_fields_preserves_existing_values` で `running` を投入している) と整合するため、`running` は ホワイトリストに含める

### 5.3 memory テーブル

- 触れない。`raw_memory_entries` / `curated_memories` への INSERT / UPDATE / DELETE は Phase 2 では発生しない
- これによって複製時の「memory 非引継ぎ」は自動的に満たされる

---

## 6. Tauri commands 追加

| コマンド名 (Rust) | 引数                  | 戻り値  | 備考                                                           |
| ----------------- | --------------------- | ------- | -------------------------------------------------------------- |
| `agent_duplicate` | `AgentDuplicateInput` | `Agent` | 元 Agent の設定をコピーし、新 id / idle / null worktree で開始 |

`AgentDuplicateInput` (Rust)

```rust
#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentDuplicateInput {
    pub source_agent_id: String,
    pub name: Option<String>, // 省略時は <元 name> (copy)
}
```

`AgentDuplicateInput` (TS)

```ts
export interface AgentDuplicateInput {
  sourceAgentId: string;
  name?: string | null;
}
```

既存コマンド (`agent_create` / `agent_update`) は status バリデーション以外シグネチャを変えない。

---

## 7. 受け入れ条件 (Acceptance Criteria)

### 7.1 Agent 一覧 (LeftSidebar + Overview)

- LeftSidebar の Agents セクションが選択中 Project 配下の Agent 一覧を表示する (placeholder ではない)
- Overview タブの Agent 一覧に、各 Agent の name / role / status / active worktree branch (または em dash) が表示される
- Project を切り替えると Agents セクションが対応 Project の一覧に差し替わる
- Agent が 0 件のときは空状態メッセージを表示する

### 7.2 Agent 作成

- Agents セクションまたは Overview タブから Agent を新規作成できる
- name / role / adapter_type / status (4 値から選択) / prompt_path / config_path を入力できる
- name が空のとき create はフロント検証で止まり、サーバまで届かない
- status を 4 値以外に設定する手段が UI 上に存在しない (select で値を制限する)
- 作成成功で一覧に新 Agent が現れ、フォームが初期値に戻る

### 7.3 Agent 編集

- 一覧の編集ボタンから既存 Agent を編集できる
- name / role / adapter_type / status / active worktree を変更し保存できる
- 保存後、一覧の表示が更新後の内容に切り替わる
- 別の Agent を選ぶとフォームが当該 Agent の値で初期化される (Phase 1 で対応済)

### 7.4 Agent 複製

- 編集フォーム (および/または 一覧行) に「複製」ボタンが存在する
- ボタン押下で確認 UI が出て、「memory を引き継がない / status は idle で開始 / active worktree は未割当で開始」が明示される
- 実行すると新 Agent が `agent_duplicate` 経由で作成され、一覧に現れる
- 新 Agent の `id` / `created_at` / `updated_at` は元と異なる
- 新 Agent の `role` / `adapter_type` / `prompt_path` / `config_path` は元と一致する
- 新 Agent の `status` は `idle`、`active_worktree_id` は `null`
- `raw_memory_entries` / `curated_memories` テーブルに新 Agent 用の行が **生成されていない** (Phase 2 では Phase 1 同様、これらのテーブルは触らないので自動的に満たされるが、検証として SELECT で 0 件であることを確認できる)

### 7.5 Status 表示

- 4 値 (`idle` / `running` / `error` / `needs_input`) が一覧と編集フォームの双方で視覚的に区別される
- 視覚区別は色のみに依存せず、ラベルテキストでも状態名を読める
- 4 値以外を `agent_create` / `agent_update` / `agent_duplicate` の入力として送ると `InvalidInput` が返る (Rust 単体テストで検証)

### 7.6 Project Switcher

- 複数 Project が存在するとき、LeftSidebar から切り替えると Agents セクションも追従する
- Header に選択中 Project の slug が表示される (Phase 1 で実装済)

### 7.7 統合 Smoke

- アプリ起動 → 既存 Project を選択 → Agent A を作成 → A を複製して Agent A2 を生成 → A2 の status を `running` に編集 → A2 を別 Worktree に紐付け → 一覧で A と A2 が並び、A は `idle`、A2 は `running` で表示される、までを GUI 上で完遂できる
- 上記操作後に Tauri アプリを再起動しても、A / A2 とその設定値・status・active worktree が保持されている

---

## 8. 非機能要件

- **プラットフォーム**: macOS (darwin arm64) を主、Windows / Linux で破壊的にならない方針継続
- **ランタイム**: Phase 1 と同一 (Tauri v2 + React + TypeScript + Vite + rusqlite 0.31)
- **状態管理**: zustand v5 を継続。Phase 2 で新 store は原則作らず、既存 `agentStore` を拡張する
- **アクセシビリティ**: status バッジは色 + テキストの両方で状態を表現。複製ダイアログはキーボードで操作可能
- **i18n**: Phase 1 と同じく日本語表記を維持
- **テスト**:
  - Rust 単体テスト: `agent_duplicate` の repo 関数を `:memory:` DB で検証 (元 Agent コピー / id 別 / status idle / active_worktree_id null / memory テーブル無変化)
  - Rust 単体テスト: `agent_create` / `agent_update` で status の範囲外値を reject すること
  - フロント: Phase 2 では手動 Smoke を必須、ユニットテストはオプション (Phase 1 と同方針)
- **ロギング**: 既存方針継続

---

## 9. 技術前提と確定事項

- Phase 1 の DB スキーマと CRUD 基盤を破壊的変更なしに継承する
- 新規マイグレーションは追加しない
- 状態管理は zustand v5 を継続
- ルーティングは uiStore.route 方式を継続
- status の有効値は Rust 側のホワイトリストで制御し、DB カラム型は変更しない
- 複製の memory 非引継ぎは「memory テーブルに INSERT を行わない」ことで実現する
- ID 採番方式は UUID v7 を継続
- パッケージマネージャは pnpm 9 を継続

---

## 10. 未確定事項 / 後続フェーズで決める事項

以下は architect / 実装フェーズで決定する。Planner では固定しない。

- 複製の確認 UI が「modal」か「inline ダイアログ」か (UX 判断)
- LeftSidebar の Agent 行の高さ・密度・status バッジの具体形 (色 + 文字 / アイコン併用 / etc.)
- `selectedAgentId` を `uiStore` / `agentStore` / OverviewTab ローカル state のどこに置くか
- bindings.ts の `Agent.status` を `AgentStatus` に厳格化するか、`AgentStatus | string` のユニオンで運用するか
- `--color-danger` の追加と具体カラー値 (現在 tokens.css には red 系がない)
- 既存 technical debt (project commands の rename_all 統一、bindings.ts の optional ズレ) を Phase 2 でついでに解消するか、QTM-009 まで残すか
- Phase 2 で新たに 1 つでもユニットテストを追加するか (Rust 側は必須、フロント側は判断)
- 複製時の「名前」入力欄の有無 (デフォルト `(copy)` のままで良いか、ユーザー入力を許容するか)

---

## 11. 想定ユーザーフロー (Smoke Flow)

1. ユーザーが QuietMem を起動する (Phase 1 で作成済の Project が 1 件以上存在)
2. LeftSidebar から対象 Project を選択する
3. LeftSidebar の Agents セクションに当該 Project の Agent 一覧が表示される
4. Overview タブで「New Agent」フォームから Agent A (name=`planner`, role=`planner`, adapter_type=`cli`, status=`idle`) を作成する
5. 一覧に Agent A が追加され、status バッジが `idle` (muted) で表示される
6. Agent A の編集ボタンを押し、編集フォームを開く
7. 編集フォーム上部の「複製」ボタンを押す
8. 確認 UI で「memory を引き継がない / status は idle / active worktree は未割当」が明示される
9. ユーザーが「複製を実行」を選ぶと、Agent A2 (`planner (copy)`) が一覧に追加される
10. Agent A2 の status を編集フォームで `running` に変更し保存する
11. Agent A2 の編集フォームで active worktree に既存 Worktree を紐付ける
12. 一覧で Agent A (`idle` / muted) と Agent A2 (`running` / sage) が並んで表示される
13. アプリを再起動し、A / A2 の設定値・status・active worktree が保持されていることを確認する

---

## 12. 実装順序 (推奨)

依存関係を踏まえた推奨順。実装者の判断で前後してよい。

1. `domain::agent::AgentStatus` の定義 + Rust 側 status バリデーション追加
2. `agent_create` / `agent_update` の status バリデーション既存テスト追従と新規ケース追加
3. `agent_duplicate` repo 関数の実装 + Rust 単体テスト
4. `agent_duplicate` Tauri command 追加 + invoke_handler 登録
5. bindings.ts に `AgentStatus` / `AgentDuplicateInput` 型追加
6. `agentService.duplicate(...)` 追加
7. `agentStore.duplicateAgent(...)` 追加 (refresh を含む)
8. `AgentList` (Overview) と LeftSidebar Agents セクションの統合 + status バッジ
9. `AgentCreateForm` の status を select に変更
10. `AgentEditForm` の status を select に変更 + 「複製」ボタン追加 + 確認 UI
11. 複製確認 UI のテキスト確定 (memory 非引継ぎを明示)
12. tokens.css に必要に応じて status 表示用の色 alias を追加
13. Smoke Flow を手動で全通しし、再起動後の保持を確認
14. (任意) Phase 1 残課題の technical debt 解消

---

## 13. 評価観点 (Evaluator Checklist)

### 13.1 主要ユーザーフロー

- 既存 Project を選択 → Agent 作成 → 複製 → status 編集 → active worktree 紐付け → 一覧反映 が GUI 上で完遂するか
- 複製した Agent の status が `idle` で開始するか
- 複製した Agent の active_worktree_id が `null` で開始するか
- 複製確認 UI に「memory を引き継がない」旨が明示されているか
- 複製後の名前が `<元 name> (copy)` (または編集可能ならユーザー入力値) になっているか

### 13.2 LeftSidebar 統合

- LeftSidebar Agents セクションが placeholder ではなく実 Agent 一覧であるか
- LeftSidebar の Agent 行と Overview タブの編集状態が連動しているか (selectedAgentId の共有)
- Project を切り替えると LeftSidebar Agents セクションも追従するか

### 13.3 Status 表示

- 4 値 (`idle` / `running` / `error` / `needs_input`) が視覚的に区別されているか
- 各 status 値がテキストでも読めるか (色のみに依存していないか)
- 編集フォームと一覧の双方で同じ視覚言語が使われているか
- status を 4 値以外に設定する手段が UI 上に存在しないか (select / radio で物理的に制限されているか)

### 13.4 API (Tauri commands)

- `agent_duplicate(input: AgentDuplicateInput)` が呼び出せ、新 Agent DTO を返すか
- 戻り値の `id` / `created_at` / `updated_at` が元 Agent と異なるか
- 戻り値の `role` / `adapter_type` / `prompt_path` / `config_path` が元 Agent と一致するか
- 戻り値の `status` が `'idle'`、`active_worktree_id` が `null` か
- 存在しない `sourceAgentId` を渡したとき `AppError::NotFound` が返るか
- `agent_create` / `agent_update` / `agent_duplicate` で status の範囲外値が `AppError::InvalidInput` になるか

### 13.5 保存状態

- アプリ再起動後、複製した Agent が保持されているか
- 複製後に status / active_worktree_id を編集した値が再起動後も保持されているか
- `raw_memory_entries` / `curated_memories` テーブルの行数が複製操作前後で変化していないか (sqlite3 で SELECT COUNT による確認)

### 13.6 エラー時挙動

- 必須項目未入力で create を呼んだとき UI に分かる形でメッセージが出るか
- 範囲外 status を `agent_update` に送信した場合、UI 側で発生し得ないことを確認 (select で物理的に不可能であること)
- バックエンドが `InvalidInput` を返した場合、フォーム下部のエラーバナーで表示されるか

### 13.7 スタブ / 見せかけ実装の検出

- 複製ボタンが UI だけで実際には Tauri command を呼んでいない、ということが起きていないか
- LeftSidebar Agents セクションが疑似データを返していないか (実 store 経由か)
- status バッジの色がデザイントークンを参照しているか (raw 色値直書きでないか)
- 確認 UI の「memory を引き継がない」テキストが実装と矛盾していないか (raw_memory_entries に INSERT していないことを Rust テストで担保)

---

## 14. 依存関係

- **前提**: Phase 1 (QTM-001 + QTM-002) 完了済 — Project / Agent / Worktree CRUD、Workspace Shell、デザイントークン、zustand store、bindings.ts、Tauri commands 基盤
- **後続**:
  - QTM-006 (Run / Adapter): 本フェーズの status 表示が Run のライフサイクルと自動連動するように接続される。本フェーズではユーザー手動更新で構わない
  - QTM-005 (Memory): 本フェーズで「memory を引き継がない」と明示した方針が、実 memory CRUD の実装時に矛盾なく動作することを前提とする
  - QTM-009 (Polish / enum 化): role / adapter_type の本格的な enum 化、エラーメッセージ日本語化、Phase 1 残課題の technical debt 解消などはこちらで継続
- **横方向**:
  - Phase 1 で残った LeftSidebar Agents セクションの placeholder を本フェーズで撤去する
  - Phase 1 で残った AgentCreateForm の自由文字列 status を本フェーズで select 化する
