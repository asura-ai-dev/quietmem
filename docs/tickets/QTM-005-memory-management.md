# Ticket

## Title

- QTM-005 Memory Management

## Goal

- project / agent 両スコープの raw / curated memory を保存、表示、検索、編集し、想起導線を扱えるようにする。

## Scope

- project / agent scope 切替
- curated memory CRUD
- digest 一覧表示
- raw memory index 表示
- raw memory 本文参照
- raw / curated の semantic 検索
- raw → curated 昇格 UI
- source refs / before / after / related context の想起導線

## Done Criteria

- project / agent の両 scope を切り替えて閲覧できる
- curated memory を `Digest` と `Notes` に分けて表示できる
- `Notes` では manual / promoted をフィルタできる
- digest を daily / weekly / monthly / yearly で表示できる
- raw memory index を一覧表示できる
- raw / curated を semantic 検索できる
- raw memory から curated memory へ昇格できる
- promoted note から source refs に戻れる
- before / after / related context を読み込める

## Validation

- CRUD 動作確認
- scope 切替確認
- digest 表示確認
- semantic 検索確認
- 昇格フロー確認
- source refs / related context の想起導線確認

## Notes

- [L03-memory-requirements.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L03-memory-requirements.md)
- 本文保存は [L09-data-storage.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L09-data-storage.md) に従う
