# L06 Editor / Git / Worktree

## Objective

コード編集、ファイル参照、worktree 切替、Git 状態確認を 1 つの workspace 内で扱うための要件を定義する。

## Scope

- Monaco Editor
- file tree
- worktree 管理
- Git 状態確認
- diff 閲覧

## Requirements

### 1. Editor

- Monaco Editor でコード、文書、prompt、設定ファイルを編集できる
- ファイルの読み書きができる
- 複数タブ表示をサポートする

### 2. File Tree

- Project / worktree 配下のファイルツリーを表示できる
- file tree からファイルを開ける
- 現在の agent と worktree に応じて表示対象を切り替えられる

### 3. Worktree Management

- agent ごとに worktree を管理できる
- worktree を作成できる
- worktree 一覧を表示できる
- branch 表示と branch 切替ができる

### 4. Git Visibility

- changed files を確認できる
- diff を確認できる
- branch 状態を確認できる

### 5. GUI Operation Scope

- MVP では worktree 作成、一覧表示、branch 表示、branch 切替、changed files 確認、diff 確認を GUI 化する
- rebase、squash、複雑な merge、PR 自動化は後回しとする

## Acceptance Criteria

- ユーザーは GUI だけで worktree と branch の状態を把握できる
- コード編集から diff 確認までを同一 workspace で行える
- 並列開発時に agent ごとの作業場が混線しない

## Non-Goals

- 高度な Git クライアント機能の完全代替
- GitHub PR 作成の高度自動化
