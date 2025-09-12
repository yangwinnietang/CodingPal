use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use chrono::Utc;
use uuid::Uuid;
use once_cell::sync::Lazy;

mod services;
use services::*;

// 全局状态管理
static PROCESS_MONITOR: Lazy<Mutex<ProcessMonitor>> = Lazy::new(|| {
    Mutex::new(ProcessMonitor::new())
});

static DATABASE: Lazy<Mutex<Option<DatabaseService>>> = Lazy::new(|| {
    Mutex::new(None)
});

static GLM_CLIENT: Lazy<Mutex<Option<GLMClient>>> = Lazy::new(|| {
    Mutex::new(None)
});

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationConfig {
    pub temperature: f32,
    pub max_tokens: u32,
    pub model: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizedPrompt {
    pub id: String,
    pub original: String,
    pub optimized: String,
    pub improvements: Vec<String>,
    pub confidence: f32,
    pub tokens_used: u32,
}

// Tauri命令函数
#[tauri::command]
async fn get_ide_processes() -> Result<Vec<IDEProcess>, String> {
    let mut monitor = PROCESS_MONITOR.lock().map_err(|e| e.to_string())?;
    Ok(monitor.get_ide_processes())
}

#[tauri::command]
async fn initialize_glm_client(api_key: String) -> Result<bool, String> {
    if api_key.is_empty() {
        return Err("API密钥不能为空".to_string());
    }
    
    let config = GLMConfig {
        api_key: api_key.clone(),
        ..Default::default()
    };
    
    let client = GLMClient::new(config).map_err(|e| e.to_string())?;
    
    // 测试连接
    let is_connected = client.test_connection().await.map_err(|e| e.to_string())?;
    
    if is_connected {
        {
            let mut glm_client = GLM_CLIENT.lock().map_err(|e| e.to_string())?;
            *glm_client = Some(client);
        } // 释放GLM客户端锁
        
        // 保存API密钥到数据库
        let db_clone = {
            let db_guard = DATABASE.lock().ok();
            db_guard.and_then(|guard| guard.as_ref().cloned())
        };
        
        if let Some(db) = db_clone {
            let _ = db.set_setting("glm_api_key", &api_key).await;
        }
    }
    
    Ok(is_connected)
}

#[tauri::command]
async fn optimize_prompt_with_config(
    prompt: String,
    _config: OptimizationConfig,
) -> Result<OptimizedPrompt, String> {
    let start_time = std::time::Instant::now();
    
    let client = {
        let glm_client_guard = GLM_CLIENT.lock().map_err(|e| e.to_string())?;
        glm_client_guard.as_ref().ok_or("GLM客户端未初始化")?.clone()
    };
    
    let (optimized_text, improvements, tokens_used) = client
        .optimize_prompt(&prompt)
        .await
        .map_err(|e| e.to_string())?;
    
    let processing_time = start_time.elapsed().as_millis() as i32;
    
    let result = OptimizedPrompt {
        id: Uuid::new_v4().to_string(),
        original: prompt.clone(),
        optimized: optimized_text,
        improvements,
        confidence: 0.85,
        tokens_used,
    };
    
    // 保存优化历史到数据库
    let db_clone = {
        let db_guard = DATABASE.lock().ok();
        db_guard.and_then(|guard| guard.as_ref().cloned())
    };
    
    if let Some(db) = db_clone {
        let history = OptimizationHistory {
            id: 0,
            original_prompt: prompt,
            optimized_prompt: result.optimized.clone(),
            confidence: result.confidence,
            tokens_used: tokens_used as i32,
            processing_time_ms: processing_time,
            created_at: Utc::now(),
        };
        let _ = db.save_optimization_history(&history).await;
    }
    
    Ok(result)
}

#[tauri::command]
async fn create_task_folder(folder_name: String) -> Result<String, String> {
    use std::fs;
    
    let base_path = "CodingPal/tasks";
    let folder_path = format!("{}/{}", base_path, folder_name);
    
    if let Err(e) = fs::create_dir_all(&folder_path) {
        return Err(format!("创建文件夹失败: {}", e));
    }
    
    Ok(folder_path)
}

#[tauri::command]
async fn get_optimization_history(limit: i32) -> Result<Vec<OptimizationHistory>, String> {
    let db = {
        let db_guard = DATABASE.lock().map_err(|e| e.to_string())?;
        db_guard.as_ref().ok_or("数据库未初始化")?.clone()
    };
    
    db.get_optimization_history(limit)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_setting(key: String) -> Result<Option<String>, String> {
    let db = {
        let db_guard = DATABASE.lock().map_err(|e| e.to_string())?;
        db_guard.as_ref().ok_or("数据库未初始化")?.clone()
    };
    
    db.get_setting(&key)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_setting(key: String, value: String) -> Result<(), String> {
    let db = {
        let db_guard = DATABASE.lock().map_err(|e| e.to_string())?;
        db_guard.as_ref().ok_or("数据库未初始化")?.clone()
    };
    
    db.set_setting(&key, &value)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_process_stats() -> Result<HashMap<String, f32>, String> {
    let mut monitor = PROCESS_MONITOR.lock().map_err(|e| e.to_string())?;
    let mut stats = HashMap::new();
    
    stats.insert("total_cpu".to_string(), monitor.get_total_cpu_usage());
    stats.insert("total_memory_mb".to_string(), (monitor.get_total_memory_usage() as f32) / (1024.0 * 1024.0));
    stats.insert("process_count".to_string(), monitor.get_process_count() as f32);
    
    Ok(stats)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_ide_processes,
            initialize_glm_client,
            optimize_prompt_with_config,
            create_task_folder,
            get_optimization_history,
            get_setting,
            set_setting,
            get_process_stats
        ])
        .setup(|_app| {
            // 初始化数据库
            tauri::async_runtime::spawn(async {
                let database_url = "sqlite::memory:";
                match DatabaseService::new(database_url).await {
                    Ok(db) => {
                        let mut db_guard = DATABASE.lock().unwrap();
                        *db_guard = Some(db);
                        println!("数据库初始化成功");
                    }
                    Err(e) => {
                        eprintln!("数据库初始化失败: {}", e);
                    }
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
