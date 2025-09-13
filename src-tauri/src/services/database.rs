use sqlx::{SqlitePool, Row};
use serde::{Deserialize, Serialize};
use anyhow::Result;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Setting {
    pub id: i64,
    pub key: String,
    pub value: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessHistory {
    pub id: i64,
    pub process_name: String,
    pub pid: i32,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub max_cpu_usage: f32,
    pub max_memory_usage: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationHistory {
    pub id: i64,
    pub original_prompt: String,
    pub optimized_prompt: String,
    pub confidence: f32,
    pub tokens_used: i32,
    pub processing_time_ms: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone)]
pub struct DatabaseService {
    pool: SqlitePool,
}

impl DatabaseService {
    pub async fn new(database_url: &str) -> Result<Self> {
        let pool = SqlitePool::connect(database_url).await?;
        let service = Self { pool };
        service.init_tables().await?;
        service.init_default_settings().await?;
        Ok(service)
    }
    
    async fn init_tables(&self) -> Result<()> {
        // 创建设置表
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key VARCHAR(100) UNIQUE NOT NULL,
                value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            "#
        ).execute(&self.pool).await?;
        
        // 创建进程历史表
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS process_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                process_name VARCHAR(100) NOT NULL,
                pid INTEGER NOT NULL,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP,
                max_cpu_usage REAL DEFAULT 0.0,
                max_memory_usage INTEGER DEFAULT 0
            )
            "#
        ).execute(&self.pool).await?;
        
        // 创建优化历史表
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS optimization_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                original_prompt TEXT NOT NULL,
                optimized_prompt TEXT NOT NULL,
                confidence REAL DEFAULT 0.0,
                tokens_used INTEGER DEFAULT 0,
                processing_time_ms INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            "#
        ).execute(&self.pool).await?;
        
        // 创建任务文件夹表
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS task_folders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                folder_name VARCHAR(100) NOT NULL,
                folder_path VARCHAR(500) NOT NULL,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            "#
        ).execute(&self.pool).await?;
        
        Ok(())
    }
    
    async fn init_default_settings(&self) -> Result<()> {
        let default_settings = vec![
            ("glm_api_key", ""),
            ("auto_start", "false"),
            ("window_always_on_top", "true"),
            ("monitoring_interval", "5000"),
        ];
        
        for (key, value) in default_settings {
            sqlx::query(
                "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
            )
            .bind(key)
            .bind(value)
            .execute(&self.pool)
            .await?;
        }
        
        Ok(())
    }
    
    pub async fn get_setting(&self, key: &str) -> Result<Option<String>> {
        let row = sqlx::query("SELECT value FROM settings WHERE key = ?")
            .bind(key)
            .fetch_optional(&self.pool)
            .await?;
        
        Ok(row.map(|r| r.get::<String, _>("value")))
    }
    
    pub async fn set_setting(&self, key: &str, value: &str) -> Result<()> {
        sqlx::query(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)"
        )
        .bind(key)
        .bind(value)
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }
    
    pub async fn save_process_history(&self, history: &ProcessHistory) -> Result<i64> {
        let result = sqlx::query(
            r#"
            INSERT INTO process_history 
            (process_name, pid, start_time, end_time, max_cpu_usage, max_memory_usage)
            VALUES (?, ?, ?, ?, ?, ?)
            "#
        )
        .bind(&history.process_name)
        .bind(history.pid)
        .bind(history.start_time)
        .bind(history.end_time)
        .bind(history.max_cpu_usage)
        .bind(history.max_memory_usage)
        .execute(&self.pool)
        .await?;
        
        Ok(result.last_insert_rowid())
    }
    
    pub async fn save_optimization_history(&self, history: &OptimizationHistory) -> Result<i64> {
        let result = sqlx::query(
            r#"
            INSERT INTO optimization_history 
            (original_prompt, optimized_prompt, confidence, tokens_used, processing_time_ms)
            VALUES (?, ?, ?, ?, ?)
            "#
        )
        .bind(&history.original_prompt)
        .bind(&history.optimized_prompt)
        .bind(history.confidence)
        .bind(history.tokens_used)
        .bind(history.processing_time_ms)
        .execute(&self.pool)
        .await?;
        
        Ok(result.last_insert_rowid())
    }
    
    pub async fn get_optimization_history(&self, limit: i32) -> Result<Vec<OptimizationHistory>> {
        let rows = sqlx::query(
            "SELECT * FROM optimization_history ORDER BY created_at DESC LIMIT ?"
        )
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;
        
        let mut histories = Vec::new();
        for row in rows {
            histories.push(OptimizationHistory {
                id: row.get("id"),
                original_prompt: row.get("original_prompt"),
                optimized_prompt: row.get("optimized_prompt"),
                confidence: row.get("confidence"),
                tokens_used: row.get("tokens_used"),
                processing_time_ms: row.get("processing_time_ms"),
                created_at: row.get("created_at"),
            });
        }
        
        Ok(histories)
    }
    
    // 获取数据库连接池的方法，供其他服务使用
    pub fn get_pool(&self) -> &SqlitePool {
        &self.pool
    }
}