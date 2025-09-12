use sysinfo::{System, Pid};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IDEProcess {
    pub pid: u32,
    pub name: String,
    pub path: String,
    pub status: String,
    pub cpu_usage: f32,
    pub memory_usage: u64,
    pub start_time: i64,
}

#[derive(Debug, Clone)]
struct ProcessInfo {
    pub name: String,
    pub path: String,
    pub start_time: DateTime<Utc>,
    pub max_cpu_usage: f32,
    pub max_memory_usage: u64,
}

pub struct ProcessMonitor {
    system: System,
    tracked_processes: HashMap<u32, ProcessInfo>,
    ide_names: Vec<String>,
}

impl ProcessMonitor {
    pub fn new() -> Self {
        let ide_names = vec![
            "cursor".to_string(),
            "trae".to_string(), 
            "qoder".to_string(),
            "kiro".to_string(),
            "code".to_string(),
            "devenv".to_string(),
            "idea".to_string(),
            "pycharm".to_string(),
            "webstorm".to_string(),
            "clion".to_string(),
        ];
        
        Self {
            system: System::new_all(),
            tracked_processes: HashMap::new(),
            ide_names,
        }
    }
    
    pub fn refresh(&mut self) {
        self.system.refresh_all();
    }
    
    pub fn get_ide_processes(&mut self) -> Vec<IDEProcess> {
        self.refresh();
        let mut processes = Vec::new();
        
        for (pid, process) in self.system.processes() {
            let process_name = process.name().to_string_lossy().to_lowercase();
            
            if self.ide_names.iter().any(|ide| process_name.contains(ide)) {
                let pid_u32 = pid.as_u32();
                let cpu_usage = process.cpu_usage();
                let memory_usage = process.memory();
                
                // 更新跟踪的进程信息
                if let Some(tracked) = self.tracked_processes.get_mut(&pid_u32) {
                    tracked.max_cpu_usage = tracked.max_cpu_usage.max(cpu_usage);
                    tracked.max_memory_usage = tracked.max_memory_usage.max(memory_usage);
                } else {
                    // 新发现的进程
                    self.tracked_processes.insert(pid_u32, ProcessInfo {
                        name: process.name().to_string_lossy().to_string(),
                        path: process.exe().map(|p| p.to_string_lossy().to_string()).unwrap_or_default(),
                        start_time: Utc::now(),
                        max_cpu_usage: cpu_usage,
                        max_memory_usage: memory_usage,
                    });
                }
                
                processes.push(IDEProcess {
                    pid: pid_u32,
                    name: process.name().to_string_lossy().to_string(),
                    path: process.exe().map(|p| p.to_string_lossy().to_string()).unwrap_or_default(),
                    status: "running".to_string(),
                    cpu_usage,
                    memory_usage,
                    start_time: Utc::now().timestamp(),
                });
            }
        }
        
        // 清理已结束的进程
        let current_pids: std::collections::HashSet<u32> = 
            self.system.processes().keys().map(|pid| pid.as_u32()).collect();
        
        self.tracked_processes.retain(|pid, _| current_pids.contains(pid));
        
        processes
    }
    
    pub fn get_process_count(&self) -> usize {
        self.tracked_processes.len()
    }
    
    pub fn get_total_cpu_usage(&mut self) -> f32 {
        self.refresh();
        let mut total_cpu = 0.0;
        
        for (pid, _) in &self.tracked_processes {
            if let Some(process) = self.system.process(Pid::from(*pid as usize)) {
                total_cpu += process.cpu_usage();
            }
        }
        
        total_cpu
    }
    
    pub fn get_total_memory_usage(&mut self) -> u64 {
        self.refresh();
        let mut total_memory = 0;
        
        for (pid, _) in &self.tracked_processes {
            if let Some(process) = self.system.process(Pid::from(*pid as usize)) {
                total_memory += process.memory();
            }
        }
        
        total_memory
    }
    
    pub fn is_any_ide_running(&self) -> bool {
        !self.tracked_processes.is_empty()
    }
    
    pub fn get_tracked_processes(&self) -> &HashMap<u32, ProcessInfo> {
        &self.tracked_processes
    }
}

impl Default for ProcessMonitor {
    fn default() -> Self {
        Self::new()
    }
}