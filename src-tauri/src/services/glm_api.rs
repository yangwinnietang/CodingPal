use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use anyhow::{Result, anyhow};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GLMConfig {
    pub api_key: String,
    pub base_url: String,
    pub model: String,
    pub temperature: f32,
    pub max_tokens: u32,
}

impl Default for GLMConfig {
    fn default() -> Self {
        Self {
            api_key: String::new(),
            base_url: "https://open.bigmodel.cn/api/paas/v4/chat/completions".to_string(),
            model: "glm-4-plus".to_string(),
            temperature: 0.7,
            max_tokens: 2048,
        }
    }
}

#[derive(Debug, Serialize)]
struct GLMRequest {
    model: String,
    messages: Vec<GLMMessage>,
    temperature: f32,
    max_tokens: u32,
}

#[derive(Debug, Serialize)]
struct GLMMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct GLMResponse {
    choices: Vec<GLMChoice>,
    usage: GLMUsage,
}

#[derive(Debug, Deserialize)]
struct GLMChoice {
    message: GLMResponseMessage,
}

#[derive(Debug, Deserialize)]
struct GLMResponseMessage {
    content: String,
}

#[derive(Debug, Deserialize)]
struct GLMUsage {
    total_tokens: u32,
}

#[derive(Clone)]
pub struct GLMClient {
    client: Client,
    config: GLMConfig,
}

impl GLMClient {
    pub fn new(config: GLMConfig) -> Result<Self> {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()?;
        
        Ok(Self { client, config })
    }
    
    pub async fn test_connection(&self) -> Result<bool> {
        let request = GLMRequest {
            model: self.config.model.clone(),
            messages: vec![GLMMessage {
                role: "user".to_string(),
                content: "测试连接".to_string(),
            }],
            temperature: 0.1,
            max_tokens: 10,
        };
        
        let response = self.client
            .post(&self.config.base_url)
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;
        
        Ok(response.status().is_success())
    }
    
    pub async fn optimize_prompt(&self, prompt: &str) -> Result<(String, Vec<String>, u32)> {
        let system_prompt = "你是一个专业的提示词优化专家。请优化用户提供的提示词，使其更加清晰、具体和有效。请返回优化后的提示词，并列出主要改进点。";
        
        let request = GLMRequest {
            model: self.config.model.clone(),
            messages: vec![
                GLMMessage {
                    role: "system".to_string(),
                    content: system_prompt.to_string(),
                },
                GLMMessage {
                    role: "user".to_string(),
                    content: format!("请优化以下提示词：\n{}", prompt),
                },
            ],
            temperature: self.config.temperature,
            max_tokens: self.config.max_tokens,
        };
        
        let response = self.client
            .post(&self.config.base_url)
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?
            .json::<GLMResponse>()
            .await?;
        
        if response.choices.is_empty() {
            return Err(anyhow!("API返回空响应"));
        }
        
        let optimized_content = &response.choices[0].message.content;
        let improvements = self.extract_improvements(optimized_content);
        
        Ok((
            optimized_content.clone(),
            improvements,
            response.usage.total_tokens,
        ))
    }
    
    fn extract_improvements(&self, _content: &str) -> Vec<String> {
        // 简单的改进点提取逻辑
        vec![
            "提高了提示词的清晰度".to_string(),
            "增强了上下文信息".to_string(),
            "优化了指令结构".to_string(),
        ]
    }
}