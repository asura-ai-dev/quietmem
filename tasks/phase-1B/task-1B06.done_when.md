# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo test --lib db::repo::worktree
```

## チェック項目

- `src-tauri/src/domain/worktree.rs` が存在し `Worktree`, `WorktreeCreateInput`, `WorktreeUpdateInput` を公開
- `Worktree` は `id, project_id, agent_id, branch_name, path, base_branch, status, created_at, updated_at` を持つ
- `src-tauri/src/db/repo/worktree.rs` に `create` / `list_by_project` / `update` が存在
- 存在しない project_id の create は `NotFound`
- 空 branch_name / path の create は `InvalidInput`
- 存在しない id の update は `NotFound`
- 存在しない project_id の `list_by_project` は空 Vec
- 最低 5 件のユニットテストが存在
- `cargo test --lib db::repo::worktree` が成功する
