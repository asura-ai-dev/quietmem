# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo check
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src-tauri/tauri.conf.json` の `build.devUrl`, `build.frontendDist`, `build.beforeDevCommand`, `build.beforeBuildCommand` が設定されている
- `src/App.tsx` に「QuietMem」テキストが含まれる
- `package.json` の scripts に `tauri`, `tauri:dev`, `tauri:build` がある
- `cargo check` (src-tauri) がエラーなし
- `pnpm tsc --noEmit` がエラーなし
- `pnpm build` が成功し `dist/index.html` が最新化される
- `pnpm tauri dev` コマンドがコマンドラインから発見できる (`pnpm tauri --help` が成功)
