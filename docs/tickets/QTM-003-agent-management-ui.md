# Ticket

## Title

- QTM-003 Agent Management UI

## Goal

- agent 一覧、作成、編集、複製、状態表示を GUI から行えるようにする。

## Scope

- agent list
- agent create / edit
- agent duplicate
- status 表示
- project / agent switcher

## Done Criteria

- agent 一覧に名前、role、status が表示される
- agent を新規作成できる
- agent の設定を編集できる
- agent を複製できる
- `idle` / `running` / `error` / `needs input` が UI 上で識別できる
- 複製時に agent 固有 memory を引き継がない方針が UI と処理に反映される

## Validation

- 一覧表示の手動確認
- フォーム入力確認
- 複製処理の確認
- 状態表示の見え方確認

## Notes

- [L05-agent-management.md](/Users/kzt/Desktop/project-d/product/quietmem/docs/L05-agent-management.md)
- QTM-006 の run 状態と整合が必要
