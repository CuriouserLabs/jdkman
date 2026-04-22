// Prevents a second console window on Windows in release mode
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::list_versions,
            commands::add_jdk,
            commands::remove_jdk,
            commands::use_jdk,
            commands::verify_jdk,
            commands::refresh_jdk,
            commands::get_env_status,
            commands::get_current_alias,
            commands::scan_jdks,
            commands::add_discovered_jdk,
            commands::add_all_discovered,
            commands::run_diagnostics,
            commands::get_config_path,
            commands::get_config_dir,
            commands::validate_jdk_path,
            commands::probe_jdk_metadata,
            commands::get_suggested_alias,
            commands::import_java_home,
        ])
        .run(tauri::generate_context!())
        .expect("error while running JDK Manager");
}
