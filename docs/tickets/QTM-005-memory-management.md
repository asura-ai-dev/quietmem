# Ticket

## Title

- QTM-005 Memory Management

## Goal

- agent ごとの raw / curated memory を保存、表示、検索、編集できるようにする。

## Scope

- curated memory CRUD
- raw memory index 表示
- raw memory 本文参照
- raw memory 検索
- raw → curated 昇格 UI

## Done Criteria

- curated memory を一覧表示、作成、編集できる
- raw memory index を一覧表示できる
- raw memory を検索できる
- raw memory から curated memory へ昇格できる
- agent 単位で memory を切り替えて閲覧できる

## Validation

- CRUD 動作確認
- 検索確認
- 昇格フロー確認

## Notes

- [L03-memory-requirements.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L03-memory-requirements.md)
- 本文保存は [L09-data-storage.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L09-data-storage.md) に従う
