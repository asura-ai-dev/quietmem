# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo test --lib db::repo::project
```

## チェック項目

- `src-tauri/src/domain/project.rs` が存在し `Project`, `ProjectCreateInput`, `ProjectUpdateInput` を公開する
- `Project` は `id, name, slug, root_path, created_at, updated_at` を持つ
- `Project` / 入力型は `serde::Serialize` / `serde::Deserialize` を derive し `rename_all = "camelCase"`
- `src-tauri/src/db/repo/project.rs` が存在し `create` / `list` / `update` 関数を持つ
- id は UUID v7 形式で生成される
- `slug` が不正 (空 / 記号混入) のとき `InvalidInput`
- 同一 slug での 2 回目 create は `InvalidInput`
- 存在しない id での update は `NotFound`
- update の `None` フィールドは既存値を保持
- `list` が `updated_at DESC` 順で返る
- ユニットテストが最低 5 件存在 (正常 create, list, update, 重複 slug, NotFound)
- `cargo test --lib db::repo::project` が成功する
