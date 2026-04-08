# L01 Product Definition

## Objective

QuietMem の製品定義、世界観、ターゲット、提供価値を明確化する。

## Scope

- プロダクトの目的
- コンセプト
- ターゲットユーザー
- 提供価値
- 非機能的なブランド方針

## Requirements

### 1. Product Identity

- 製品名は QuietMem とする
- QuietMem は「静かに支える記憶 / 静かな記憶」のニュアンスを持つ名称として扱う
- 世界観は「派手な AI チャット」ではなく「継続的な AI 運用を静かに支える workspace」とする

### 2. Product Positioning

- QuietMem は単なる AI チャットアプリではなく、AI agent の継続運用を支える管理 OS を目指す
- QuietMem は memory editor と workspace manager の両方の性格を持つ
- QuietMem は AI を会話相手ではなく、継続作業する存在として扱いたいユーザー向けに設計する

### 3. Target Users

- 複数 AI agent を使って開発 / 調査 / 運用を回したいユーザー
- OpenClaw やローカル CLI agent を活用するユーザー
- worktree を使った並列開発を行いたいユーザー
- agent を長期的に育てて運用したいユーザー

### 4. Primary Value

- agent ごとに役割、記憶、作業場を分離して管理できること
- memory を可視化しながら継続的に編集できること
- 実行、編集、差分確認、定期実行を 1 つの GUI に集約できること

### 5. Visual Direction

- Quiet / calm / reliable / memory-oriented をデザインキーワードとする
- IDE らしい実務感と、memory ツールらしい柔らかさを両立する
- 基本配色はセージグリーン、ダークグレー、アンバー補助を採用する

## Acceptance Criteria

- プロダクト説明文だけで、QuietMem がチャットアプリではなく agent 運用ツールであると理解できる
- ターゲット像が複数 agent 運用ユーザーに明確に寄っている
- UI / ブランディング方針が静かで実務的な方向に統一されている

## Non-Goals

- 汎用 AI チャットサービスとしての最適化
- コンシューマー向けエンタメ的 UX の追求
- SaaS 中心の派手なコラボレーション体験の提供
