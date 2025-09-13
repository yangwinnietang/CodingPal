// 手势识别服务 - Tauri后端
use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use std::collections::HashMap;

// 手势配置结构
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GestureConfig {
    pub id: Option<i64>,
    pub name: String,
    pub gesture_type: String,
    pub threshold: f64,
    pub enabled: bool,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

// 手势记录结构
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GestureRecord {
    pub id: Option<i64>,
    pub gesture_type: String,
    pub confidence: f64,
    pub detected_at: String,
    pub config_id: Option<i64>,
}

// 关键点数据结构
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KeypointData {
    pub id: Option<i64>,
    pub record_id: i64,
    pub keypoints: String, // JSON格式的关键点数据
    pub frame_width: i32,
    pub frame_height: i32,
    pub created_at: Option<String>,
}

// 手势统计结构
#[derive(Debug, Serialize, Deserialize)]
pub struct GestureStats {
    pub total_detections: i64,
    pub gesture_counts: HashMap<String, i64>,
    pub average_confidence: f64,
    pub last_detection: Option<String>,
}

// 初始化手势数据库表
pub async fn init_gesture_tables(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    // 创建手势配置表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS gesture_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) NOT NULL,
            gesture_type VARCHAR(20) NOT NULL,
            threshold REAL DEFAULT 0.8,
            enabled BOOLEAN DEFAULT true,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        "#,
    )
    .execute(pool)
    .await?;

    // 创建索引
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_gesture_configs_type ON gesture_configs(gesture_type)")
        .execute(pool)
        .await?;
    
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_gesture_configs_enabled ON gesture_configs(enabled)")
        .execute(pool)
        .await?;

    // 创建手势记录表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS gesture_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gesture_type VARCHAR(20) NOT NULL,
            confidence REAL NOT NULL,
            detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            config_id INTEGER,
            FOREIGN KEY (config_id) REFERENCES gesture_configs(id)
        )
        "#,
    )
    .execute(pool)
    .await?;

    // 创建索引
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_gesture_records_type ON gesture_records(gesture_type)")
        .execute(pool)
        .await?;
    
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_gesture_records_time ON gesture_records(detected_at DESC)")
        .execute(pool)
        .await?;

    // 创建关键点数据表
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS keypoint_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            record_id INTEGER NOT NULL,
            keypoints TEXT NOT NULL,
            frame_width INTEGER NOT NULL,
            frame_height INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (record_id) REFERENCES gesture_records(id)
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_keypoint_data_record ON keypoint_data(record_id)")
        .execute(pool)
        .await?;

    // 插入默认配置数据
    insert_default_configs(pool).await?;

    Ok(())
}

// 插入默认手势配置
async fn insert_default_configs(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    let default_configs = vec![
        ("握拳", "fist", 0.85),
        ("张开手掌", "five", 0.80),
        ("手枪手势", "gun", 0.75),
        ("爱心手势", "love", 0.70),
        ("食指", "one", 0.85),
        ("六", "six", 0.75),
        ("三", "three", 0.80),
        ("点赞", "thumbup", 0.90),
        ("耶", "yeah", 0.75),
    ];

    for (name, gesture_type, threshold) in default_configs {
        // 检查是否已存在
        let exists = sqlx::query("SELECT COUNT(*) as count FROM gesture_configs WHERE gesture_type = ?")
            .bind(gesture_type)
            .fetch_one(pool)
            .await?
            .get::<i64, _>("count") > 0;

        if !exists {
            sqlx::query(
                "INSERT INTO gesture_configs (name, gesture_type, threshold) VALUES (?, ?, ?)"
            )
            .bind(name)
            .bind(gesture_type)
            .bind(threshold)
            .execute(pool)
            .await?;
        }
    }

    Ok(())
}

// Tauri命令：获取手势配置
#[tauri::command]
pub async fn get_gesture_configs() -> Result<Vec<GestureConfig>, String> {
    use crate::DATABASE;
    let db = {
        let db_guard = DATABASE.lock().map_err(|e| e.to_string())?;
        db_guard.as_ref().ok_or("数据库未初始化")?.clone()
    };
    let pool = db.get_pool();
    let configs = sqlx::query_as::<_, GestureConfig>(
        "SELECT id, name, gesture_type, threshold, enabled, created_at, updated_at FROM gesture_configs ORDER BY id"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(configs)
}

// Tauri命令：更新手势配置
#[tauri::command]
pub async fn update_gesture_config(
    config: GestureConfig,
) -> Result<bool, String> {
    use crate::DATABASE;
    let db = {
        let db_guard = DATABASE.lock().map_err(|e| e.to_string())?;
        db_guard.as_ref().ok_or("数据库未初始化")?.clone()
    };
    let pool = db.get_pool();
    let result = sqlx::query(
        "UPDATE gesture_configs SET name = ?, threshold = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
    .bind(&config.name)
    .bind(config.threshold)
    .bind(config.enabled)
    .bind(config.id)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(result.rows_affected() > 0)
}

// Tauri命令：保存手势记录
#[tauri::command]
pub async fn save_gesture_record(
    gesture_type: String,
    confidence: f64,
    keypoints: Option<String>,
    frame_width: Option<i32>,
    frame_height: Option<i32>,
) -> Result<i64, String> {
    use crate::DATABASE;
    let db = {
        let db_guard = DATABASE.lock().map_err(|e| e.to_string())?;
        db_guard.as_ref().ok_or("数据库未初始化")?.clone()
    };
    let pool = db.get_pool();
    // 插入手势记录
    let record_result = sqlx::query(
        "INSERT INTO gesture_records (gesture_type, confidence) VALUES (?, ?) RETURNING id"
    )
    .bind(&gesture_type)
    .bind(confidence)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    let record_id: i64 = record_result.get("id");

    // 如果有关键点数据，也保存
    if let (Some(kp), Some(fw), Some(fh)) = (keypoints, frame_width, frame_height) {
        sqlx::query(
            "INSERT INTO keypoint_data (record_id, keypoints, frame_width, frame_height) VALUES (?, ?, ?, ?)"
        )
        .bind(record_id)
        .bind(kp)
        .bind(fw)
        .bind(fh)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    }

    Ok(record_id)
}

// Tauri命令：获取手势历史记录
#[tauri::command]
pub async fn get_gesture_history(
    limit: Option<i32>,
    offset: Option<i32>,
) -> Result<Vec<GestureRecord>, String> {
    use crate::DATABASE;
    let db = {
        let db_guard = DATABASE.lock().map_err(|e| e.to_string())?;
        db_guard.as_ref().ok_or("数据库未初始化")?.clone()
    };
    let pool = db.get_pool();
    let limit = limit.unwrap_or(50);
    let offset = offset.unwrap_or(0);

    let records = sqlx::query_as::<_, GestureRecord>(
        "SELECT id, gesture_type, confidence, detected_at, config_id FROM gesture_records ORDER BY detected_at DESC LIMIT ? OFFSET ?"
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(records)
}

// Tauri命令：获取手势统计
#[tauri::command]
pub async fn get_gesture_stats() -> Result<GestureStats, String> {
    use crate::DATABASE;
    let db = {
        let db_guard = DATABASE.lock().map_err(|e| e.to_string())?;
        db_guard.as_ref().ok_or("数据库未初始化")?.clone()
    };
    let pool = db.get_pool();
    // 总检测次数
    let total_detections: i64 = sqlx::query("SELECT COUNT(*) as count FROM gesture_records")
        .fetch_one(pool)
        .await
        .map_err(|e| e.to_string())?
        .get("count");

    // 各手势统计
    let gesture_counts_rows = sqlx::query(
        "SELECT gesture_type, COUNT(*) as count FROM gesture_records GROUP BY gesture_type"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    let mut gesture_counts = HashMap::new();
    for row in gesture_counts_rows {
        let gesture_type: String = row.get("gesture_type");
        let count: i64 = row.get("count");
        gesture_counts.insert(gesture_type, count);
    }

    // 平均置信度
    let average_confidence: f64 = sqlx::query("SELECT AVG(confidence) as avg_conf FROM gesture_records")
        .fetch_one(pool)
        .await
        .map_err(|e| e.to_string())?
        .get::<Option<f64>, _>("avg_conf")
        .unwrap_or(0.0);

    // 最后检测时间
    let last_detection: Option<String> = sqlx::query(
        "SELECT detected_at FROM gesture_records ORDER BY detected_at DESC LIMIT 1"
    )
    .fetch_optional(pool)
    .await
    .map_err(|e| e.to_string())?
    .map(|row| row.get("detected_at"));

    Ok(GestureStats {
        total_detections,
        gesture_counts,
        average_confidence,
        last_detection,
    })
}

// Tauri命令：清除历史记录
#[tauri::command]
pub async fn clear_gesture_history() -> Result<bool, String> {
    use crate::DATABASE;
    let db = {
        let db_guard = DATABASE.lock().map_err(|e| e.to_string())?;
        db_guard.as_ref().ok_or("数据库未初始化")?.clone()
    };
    let pool = db.get_pool();
    // 先删除关键点数据
    sqlx::query("DELETE FROM keypoint_data")
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

    // 再删除手势记录
    let result = sqlx::query("DELETE FROM gesture_records")
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(result.rows_affected() > 0)
}

// 实现 sqlx::FromRow for GestureConfig
impl sqlx::FromRow<'_, sqlx::sqlite::SqliteRow> for GestureConfig {
    fn from_row(row: &sqlx::sqlite::SqliteRow) -> Result<Self, sqlx::Error> {
        Ok(GestureConfig {
            id: Some(row.get("id")),
            name: row.get("name"),
            gesture_type: row.get("gesture_type"),
            threshold: row.get("threshold"),
            enabled: row.get("enabled"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }
}

// 实现 sqlx::FromRow for GestureRecord
impl sqlx::FromRow<'_, sqlx::sqlite::SqliteRow> for GestureRecord {
    fn from_row(row: &sqlx::sqlite::SqliteRow) -> Result<Self, sqlx::Error> {
        Ok(GestureRecord {
            id: Some(row.get("id")),
            gesture_type: row.get("gesture_type"),
            confidence: row.get("confidence"),
            detected_at: row.get("detected_at"),
            config_id: row.get("config_id"),
        })
    }
}