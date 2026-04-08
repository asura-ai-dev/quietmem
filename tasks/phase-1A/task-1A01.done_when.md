# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo check
```

## チェック項目

- `src-tauri/Cargo.toml` が存在し、`tauri = "2"` を依存に含む
- `src-tauri/build.rs` が存在し `tauri_build::build()` を呼ぶ
- `src-tauri/tauri.conf.json` が存在し、`productName = "QuietMem"`, `identifier = "dev.quietmem.app"`, `build.devUrl = "http://localhost:5173"`, `build.frontendDist = "../dist"` を含む
- `src-tauri/src/main.rs` と `src-tauri/src/lib.rs` が存在する
- `src-tauri/Cargo.toml` の `[lib]` に `name = "quietmem_lib"` が定義されている
- `cargo check` が警告なし・エラーなしで成功する (未使用警告は許容)
- リポジトリルートの `.gitignore` に `node_modules/`, `dist/`, `src-tauri/target/` が含まれる
