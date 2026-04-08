# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo test --lib db::repo::agent
```

## チェック項目

- `src-tauri/src/domain/agent.rs` が存在し `Agent`, `AgentCreateInput`, `AgentUpdateInput` を公開
- `Agent` は `id, project_id, name, role, adapter_type, prompt_path, config_path, status, active_worktree_id, created_at, updated_at` を持つ
- `src-tauri/src/db/repo/agent.rs` に `create` / `list_by_project` / `update` が存在
- 存在しない `project_id` での create は `NotFound`
- 存在しない `project_id` での `list_by_project` は空 Vec (エラーにしない)
- `update` で `active_worktree_id` を任意の文字列に設定できる
- 存在しない id の update は `NotFound`
- `list_by_project` が `updated_at DESC` 順で返る
- 最低 6 件のユニットテストが存在 (正常 create, list, update name, update active_worktree_id, 存在しない project, 空 list)
- `cargo test --lib db::repo::agent` が成功する
