# 更新日志

本文档记录 Spectre 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

# [1.1.0] - 2026-01-07

## 新增 ✨

### 智能上下文管理

- 可配置的上下文获取策略 按行数模式：发送前 N 行 + 当前行 按字符数模式：发送最后 N 个字符
- 支持 `maxLines: 0`只发送当前行（节省 token）
- 自动截断超长上下文，保留最后的内容

### 差异化防抖延迟

- 正常编写延迟（默认 500ms）
- 换行时延迟（默认 200ms）- 快速响应
- 粘贴后延迟（默认 1000ms）
- 自动检测换行和粘贴事件
- 给用户更多时间调整粘贴内容

### 智能触发条件

- 换行时快速触发（可配置）
- 标点符号后不触发（句号、问号等）
- 可自定义跳过的标点符号列表
- 避免不必要的补全请求

### Dify Workflow 集成

- 支持 Dify Workflow API 接入方式
- 可配置的 AI 服务提供商（OpenAI / Dify）
- 统一的客户端接口，自动路由到对应服务
- 流式（streaming）和阻塞（blocking）两种响应模式

### 灵活的输入长度限制

- 可配置的 `maxInputLength`参数 `-1`：不限制长度 `>0`：限制为指定字符数
- 自动截断超长文本，保留最后 N 个字符
- 控制台日志提示截断信息

### 无结果标识符

- 可配置的 `noResultIdentifier`参数（默认 `[NONE]`）
- 当 Dify 返回标识符时，自动过滤，不显示补全
- 支持自定义标识符字符串

## 改进 🔧

### 配置结构优化

- 新增 `autoComplete`配置节 `minTriggerLength`：触发补全的最小字符数 `debounce.normal`：正常编写延迟 `debounce.newLine`：换行时延迟 `debounce.paste`：粘贴后延迟 `context.mode`：上下文模式（lines/chars） `context.maxLines`：最多发送前 N 行 `context.maxChars`：最多发送 N 个字符 `trigger.onNewLine`：换行时是否快速触发 `trigger.skipAfterPunctuation`：不触发的标点符号列表
- 优化了配置文件结构，支持多 AI 服务提供商
- 改进了错误处理和日志输出
- 完善了类型定义和注释

### 性能优化

- 减少发送给 AI 的文本量
- 避免发送全部文档内容
- 智能上下文窗口控制
- 降低 API 调用成本
- 添加请求取消机制，避免重复请求
- 正确清理定时器，防止内存泄漏

### 构建优化

- 使用 Sass 现代编译器 API
- 调整 chunk 大小警告限制
- 构建过程无警告

## 修复 🐛

- 修复 `maxLines: 0`时无法获取当前行内容的问题
- 修复快速换行时触发多条请求的问题
- 修复换行后空行无法触发补全的问题（换行时自动获取上一行内容）
- 修复换行时 `minTriggerLength`限制过严的问题（换行时放宽为1字符）

## 文档 📚

- 更新配置说明文档
- 新增上下文优化说明
- 新增 Dify 接入详细指南
- 新增无结果标识符说明
- 新增快速开始指南
- 新增限制说明文档
- 更新配置示例文件
- 新增功能验证清单
- 整理文档到 `docs/`目录

## 技术细节 🔍

**新增文件**：

- `src/api/client.ts`- 统一客户端接口
- `src/api/dify.ts`- Dify Workflow 客户端
- `docs/`- 文档目录

**修改文件**：

- `src/api/config.ts`- 扩展配置类型，新增 `AutoCompleteConfig`接口
- `src/api/config.local.ts`- 更新配置结构
- `src/api/config.local.example.ts`- 更新配置示例
- `src/components/AiEditor.vue`- 实现上下文获取和粘贴检测
- `src/composables/useAiCompletion.ts`- 支持差异化防抖
- `src/api/openai.ts`- 适配新配置结构
- `vite.config.ts`- Sass 和构建优化
- `README.md`- 更新配置说明

**破坏性变更**：

- 配置文件结构变更：`minTriggerLength`和 `debounceDelay`移至 `autoComplete`节点下
- 需要更新现有的 `config.local.ts`文件

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

### v1.2.0 (画饼)

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
