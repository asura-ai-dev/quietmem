# Ticket

## Title

- QTM-004 Monaco Editor and File Tree

## Goal

- Monaco Editor を統合し、worktree 配下のファイル閲覧と編集を可能にする。

## Scope

- Monaco 統合
- file tree
- ファイル読み書き
- editor tab
- prompt / config / text / code 編集

## Done Criteria

- file tree を表示できる
- file tree からファイルを開ける
- Monaco 上でファイル内容を編集できる
- 複数タブを扱える
- 現在の worktree に応じて対象ファイルが切り替わる
- active worktree 切替時に editor / file tree の対象が更新される

## Validation

- ファイル読込確認
- 保存確認
- タブ切替確認
- worktree 切替時の表示確認

## Notes

- [L06-editor-git-worktree.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L06-editor-git-worktree.md)

## Implementation Checklist

### Phase 1: Foundation

- [ ] Monaco Editor 導入方針を確定する
- [ ] 既存 workspace shell 内で editor 表示領域の責務を整理する
- [ ] editor 用コンポーネントの配置場所を決める
- [ ] active worktree を参照して対象ルートパスを決定するデータフローを整理する
- [ ] hidden file や対象外ディレクトリの扱いを MVP 方針で決める
- [ ] テキストファイルのみを扱う制約を UI と処理に反映する

### Phase 2: Editor Base

Depends on: Phase 1

- [ ] Monaco の初期化を行い、プレースホルダ表示から実エディタ表示へ置き換える
- [ ] テーマ、フォントサイズ、基本オプションを MVP 向けに設定する
- [ ] ファイル拡張子に応じて Monaco の language を切り替える
- [ ] editor 変更を state に反映する
- [ ] 読み込み失敗時のエラー表示を追加する

### Phase 3: File Tree Data and UI

Depends on: Phase 1

- [ ] worktree 配下のディレクトリ・ファイル一覧取得 API を用意する
- [ ] file tree 用の表示データ構造を定義する
- [ ] file tree UI を実装する
- [ ] フォルダ展開・折りたたみを実装する
- [ ] ファイル選択時に open file アクションが発火するようにする
- [ ] worktree 未選択時の empty state を表示する

### Phase 4: File Open Flow

Depends on: Phase 2, Phase 3

- [ ] 選択ファイルの内容を読み込む API を用意する
- [ ] 初回オープン時に editor へ内容を表示する
- [ ] 同一ファイルの二重オープン防止を実装する

### Phase 5: Editor Tabs

Depends on: Phase 4

- [ ] editor tab の状態管理を定義する
- [ ] 複数ファイルをタブで開けるようにする
- [ ] タブ切替で editor 内容が正しく切り替わるようにする
- [ ] タブ close を実装する
- [ ] 未保存状態をタブ表示に反映する

### Phase 6: Save Flow

Depends on: Phase 4, Phase 5

- [ ] 保存 API を用意する
- [ ] worktree 外パスへ書き込まないガードを入れる
- [ ] 保存操作を UI から実行できるようにする
- [ ] 保存成功時に未保存状態を解消する
- [ ] 保存失敗時の復旧しやすいエラー表示を追加する

### Phase 7: Worktree Synchronization

Depends on: Phase 3, Phase 5, Phase 6

- [ ] active worktree 切替時に file tree を再読込する
- [ ] active worktree 切替時に editor tab の扱いを決めて実装する
- [ ] worktree 切替後に旧 worktree の内容が残留しないことを確認する

### Phase 8: Validation

Depends on: Phase 7

- [ ] prompt / config / text / code ファイルで基本動作を手動確認する
- [ ] file tree 表示、ファイル open、編集、保存の一連動作を確認する
- [ ] 複数タブ切替と未保存表示を確認する
- [ ] active worktree 切替時の tree / tab / editor 更新を確認する
- [ ] 既知の非対応事項を ticket か Notes に明記する

## Suggested Implementation Tickets

### QTM-004A Editor Foundation

Depends on: QTM-002

- Goal
- Monaco を workspace shell に載せられる最小構成を作る
- Checklist
- [x] Monaco Editor 導入方針を確定する
- [x] editor 表示領域の責務と配置場所を決める
- [x] Monaco の初期化を行い、プレースホルダ表示を置き換える
- [x] テーマ、フォントサイズ、基本オプションを設定する
- Done
- Monaco ベースの editor ペインが表示される
- worktree や file tree が未接続でも editor の土台が成立している

### QTM-004B Worktree Context and Tree Source

Depends on: QTM-002, QTM-003

- Goal
- active worktree から file tree を構築するためのデータ取得基盤を作る
- Checklist
- [ ] active worktree を参照して対象ルートパスを決定するデータフローを整理する
- [ ] hidden file や対象外ディレクトリの MVP 方針を決める
- [ ] worktree 配下のディレクトリ・ファイル一覧取得 API を用意する
- [ ] file tree 用の表示データ構造を定義する
- [ ] worktree 未選択時の empty state を定義する
- Done
- active worktree に応じた file tree データを取得できる
- worktree 未選択時の UI 方針が決まっている

### QTM-004C File Tree UI

Depends on: QTM-004B

- Goal
- ユーザーが worktree 配下のファイルを辿って選択できる UI を成立させる
- Checklist
- [ ] file tree UI を実装する
- [ ] フォルダ展開・折りたたみを実装する
- [ ] ファイル選択時に open file アクションが発火するようにする
- [ ] worktree 未選択時の empty state を表示する
- Done
- file tree を表示できる
- ファイルクリックで open file アクションまで到達する

### QTM-004D File Open and Editor Binding

Depends on: QTM-004A, QTM-004C

- Goal
- file tree で選択したファイルを editor に表示できるようにする
- Checklist
- [ ] 選択ファイルの内容を読み込む API を用意する
- [ ] テキストファイルのみを扱う制約を UI と処理に反映する
- [ ] ファイル拡張子に応じて Monaco の language を切り替える
- [ ] 初回オープン時に editor へ内容を表示する
- [ ] 読み込み失敗時のエラー表示を追加する
- [ ] 同一ファイルの二重オープン防止を実装する
- Done
- file tree からファイルを開ける
- Monaco 上で対象ファイル内容を読める

### QTM-004E Editor Tabs and Dirty State

Depends on: QTM-004D

- Goal
- 複数ファイル編集に必要な tab 状態管理を整備する
- Checklist
- [ ] editor tab の状態管理を定義する
- [ ] 複数ファイルをタブで開けるようにする
- [ ] タブ切替で editor 内容が正しく切り替わるようにする
- [ ] タブ close を実装する
- [ ] editor 変更を state に反映する
- [ ] 未保存状態をタブ表示に反映する
- Done
- 複数タブを扱える
- 未保存状態を UI 上で識別できる

### QTM-004F Save Flow

Depends on: QTM-004E

- Goal
- editor 上の変更を安全に worktree 配下へ保存できるようにする
- Checklist
- [ ] 保存 API を用意する
- [ ] worktree 外パスへ書き込まないガードを入れる
- [ ] 保存操作を UI から実行できるようにする
- [ ] 保存成功時に未保存状態を解消する
- [ ] 保存失敗時の復旧しやすいエラー表示を追加する
- Done
- 編集内容を保存できる
- 保存成功・失敗の状態が UI に反映される

### QTM-004G Worktree Switch Synchronization

Depends on: QTM-004C, QTM-004E, QTM-004F

- Goal
- active worktree 切替時に tree と editor の表示整合を保つ
- Checklist
- [ ] active worktree 切替時に file tree を再読込する
- [ ] active worktree 切替時に editor tab の扱いを決めて実装する
- [ ] worktree 切替後に旧 worktree の内容が残留しないことを確認する
- Done
- 現在の worktree に応じて対象ファイルが切り替わる
- active worktree 切替時に editor / file tree の対象が更新される

### QTM-004H Validation and Known Gaps

Depends on: QTM-004G

- Goal
- QTM-004 の受け入れ確認と既知制約の明文化を行う
- Checklist
- [ ] prompt / config / text / code ファイルで基本動作を手動確認する
- [ ] file tree 表示、ファイル open、編集、保存の一連動作を確認する
- [ ] 複数タブ切替と未保存表示を確認する
- [ ] active worktree 切替時の tree / tab / editor 更新を確認する
- [ ] 既知の非対応事項を ticket か Notes に明記する
- Done
- 親 ticket の Validation を一通り確認できている
- 非対応事項と残課題が文書化されている
