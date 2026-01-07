# 更新日志

本文档记录 Spectre 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [1.1.0] - 2026-01-07

### 新增 ✨

#### Dify Workflow 集成
- 支持 Dify Workflow API 接入方式
- 可配置的 AI 服务提供商（OpenAI / Dify）
- 统一的客户端接口，自动路由到对应服务
- 流式（streaming）和阻塞（blocking）两种响应模式

#### 灵活的输入长度限制
- 可配置的 `maxInputLength` 参数
  - `-1`：不限制长度
  - `>0`：限制为指定字符数
- 自动截断超长文本，保留最后 N 个字符
- 控制台日志提示截断信息

#### 无结果标识符
- 可配置的 `noResultIdentifier` 参数（默认 `[NONE]`）
- 当 Dify 返回标识符时，自动过滤，不显示补全
- 支持自定义标识符字符串

#### 构建优化
- 使用 Sass 现代编译器 API
- 调整 chunk 大小警告限制
- 构建过程无警告

### 改进 🔧

- 优化了配置文件结构，支持多提供商
- 改进了错误处理和日志输出
- 完善了类型定义和注释
- 优化了文档结构，创建 `docs/` 目录

### 文档 📚

- 新增 Dify 接入详细指南
- 新增配置示例文档
- 新增无结果标识符说明
- 新增快速开始指南
- 新增限制说明文档
- 整理文档到 `docs/` 目录

### 技术细节 🔍

**新增文件**：
- `src/api/client.ts` - 统一客户端接口
- `src/api/dify.ts` - Dify Workflow 客户端
- `docs/` - 文档目录

**修改文件**：
- `src/api/config.ts` - 扩展配置类型
- `src/api/openai.ts` - 适配新配置结构
- `vite.config.ts` - Sass 和构建优化

---

## [1.0.0] - 2025-12-16

### 新增 ✨

#### 核心功能
- 基于 Monaco Editor 的 AI 文本补全编辑器
- 类似 Cursor/Copilot 的补全体验
- 灰色"幽灵文字"显示补全建议
- Tab 键接受补全，Esc 键取消

#### OpenAI 集成
- OpenAI API 集成
- 流式输出支持
- 兼容多种 OpenAI 格式的 API
  - OpenAI 官方
  - Azure OpenAI
  - 通义千问
  - 本地 Ollama

#### 编辑器功能
- 多语言支持（JavaScript、TypeScript、Python、Java、Go、Rust 等）
- 多主题切换（深色/浅色/高对比度）
- 语法高亮和代码检查
- 自动补全触发机制
- 防抖优化

#### 技术栈
- Vue 3 + TypeScript + Vite
- Monaco Editor
- Element Plus UI 组件库
- Pinia 状态管理
- VueUse 工具库

#### 部署
- Docker 支持
- Nginx 静态资源服务
- 多阶段构建优化

### 配置 ⚙️

- 可配置的 API 地址和密钥
- 可配置的模型参数
- 可配置的触发条件
- 可配置的防抖延迟

### 文档 📚

- 项目 README
- 快速开始指南
- Docker 部署说明
- 配置说明

---

## 版本说明

### 版本号规则

采用语义化版本号：`主版本号.次版本号.修订号`

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 变更类型

- **新增** (Added)：新功能
- **改进** (Changed)：现有功能的变更
- **弃用** (Deprecated)：即将移除的功能
- **移除** (Removed)：已移除的功能
- **修复** (Fixed)：Bug 修复
- **安全** (Security)：安全相关的修复

---

## 路线图

### v1.2.0 (计划中)

- [ ] 智能提供商切换（根据输入长度自动选择）
- [ ] 多个 Dify workflow 配置
- [ ] 请求重试机制
- [ ] 更详细的错误提示
- [ ] 性能监控和统计

### v2.0.0 (未来)

- [ ] 支持更多 AI 服务（Claude、Gemini）
- [ ] 提供商切换 UI
- [ ] 补全历史记录
- [ ] 用户偏好设置
- [ ] 插件系统

---

## 贡献指南

如果你想为项目做出贡献，请：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

**最后更新**：2026-01-07
