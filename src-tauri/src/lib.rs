mod app_state;
pub mod commands;
pub mod db;
pub mod domain;
mod error;
mod paths;

use app_state::AppState;

pub fn run() {
    // AppData ルートの解決 → ベースディレクトリ作成 → SQLite 接続 →
    // マイグレーション適用までをまとめて実行する。
    // 失敗時は eprintln! でログ出力し、tauri の起動には進まない。
    let state = match AppState::initialize() {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[quietmem] failed to initialize app state: {e}");
            return;
        }
    };

    println!("quietmem: initialized db at {:?}", state.paths.db_file());

    tauri::Builder::default()
        .setup(|_app| Ok(()))
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::project::project_create,
            commands::project::project_list,
            commands::project::project_update,
            commands::agent::agent_create,
            commands::agent::agent_list_by_project,
            commands::agent::agent_update,
            commands::agent::agent_duplicate,
            commands::worktree::worktree_create,
            commands::worktree::worktree_get_file_content,
            commands::worktree::worktree_get_file_tree,
            commands::worktree::worktree_list_by_project,
            commands::worktree::worktree_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
