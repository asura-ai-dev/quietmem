# Ticket

## Title

- QTM-008 Cron Scheduling

## Goal

- agent の定期実行と Memory Digest をアプリ内蔵スケジューラで管理し、run と一元的に追跡できるようにする。

## Scope

- cron job CRUD
- ON / OFF
- 手動実行
- cron 実行履歴
- run との紐付け
- Memory Digest 生成

## Done Criteria

- cron job を作成、編集、一覧表示できる
- cron job を ON / OFF できる
- cron job を手動実行できる
- 実行結果が Run として保存される
- 実行履歴を確認できる
- daily / weekly / monthly / yearly の Memory Digest を生成できる

## Validation

- スケジュール登録確認
- 手動実行確認
- run 紐付け確認
- 履歴表示確認
- Memory Digest 生成確認

## Notes

- [L08-cron-management.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L08-cron-management.md)
