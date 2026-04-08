//! DB 層のモジュール。
//!
//! - `connection`: SQLite 接続の確立 (WAL / foreign_keys 有効化)
//! - `migration`: スキーママイグレーション runner (冪等な `run_pending`)
//! - `repo`: 各テーブルに対する CRUD 実装 (domain DTO を入出力とする)

pub mod connection;
pub mod migration;
pub mod repo;
