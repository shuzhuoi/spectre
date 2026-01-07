# Spectre 项目文档

欢迎查阅 Spectre AI 文本补全编辑器的完整文档。

## 📚 文档导航

### 快速开始

- [项目主页](../README.md) - 项目介绍和快速开始
- [更新日志](../CHANGELOG.md) - 版本历史和变更记录

### Dify 集成文档

位于 `docs/dify/` 目录：

| 文档 | 说明 | 适合人群 |
|------|------|---------|
| [快速开始](./dify/QUICK_START_DIFY.md) | 5 分钟快速接入 Dify | 新手 ⭐ |
| [详细接入指南](./dify/DIFY_INTEGRATION.md) | 完整的配置和使用说明 | 开发者 |
| [配置示例](./dify/CONFIG_EXAMPLES.md) | 各种场景的配置示例 | 所有人 |
| [限制说明](./dify/DIFY_LIMITATIONS.md) | Dify 的限制和最佳实践 | 所有人 |
| [无结果标识符](./dify/NO_RESULT_IDENTIFIER.md) | 无结果处理机制 | 开发者 |
| [更新日志](./dify/CHANGELOG_DIFY.md) | Dify 功能更新历史 | 维护者 |

### 架构文档

位于 `docs/architecture/` 目录：

| 文档 | 说明 | 适合人群 |
|------|------|---------|
| [项目架构分析](./architecture/AGENT.md) | 技术栈和目录结构详解 | 开发者 ⭐ |
| [实现总结](./architecture/IMPLEMENTATION_SUMMARY.md) | 功能实现细节 | 开发者 |
| [开发总结](./architecture/SUMMARY.md) | 开发过程和成果 | 维护者 |

## 🎯 按场景查找文档

### 我是新手，想快速上手

1. 阅读 [项目主页](../README.md)
2. 选择 AI 服务：
   - 使用 OpenAI → 查看 [README 配置部分](../README.md#2-配置-api)
   - 使用 Dify → 查看 [Dify 快速开始](./dify/QUICK_START_DIFY.md)
3. 启动项目：`pnpm dev`

### 我想接入 Dify Workflow

1. [快速开始](./dify/QUICK_START_DIFY.md) - 5 分钟快速配置
2. [详细接入指南](./dify/DIFY_INTEGRATION.md) - 完整说明
3. [配置示例](./dify/CONFIG_EXAMPLES.md) - 参考示例

### 我遇到了问题

1. 查看 [Dify 限制说明](./dify/DIFY_LIMITATIONS.md) - 常见问题
2. 查看 [详细接入指南](./dify/DIFY_INTEGRATION.md) - 调试技巧
3. 查看 [更新日志](../CHANGELOG.md) - 已知问题

### 我想了解项目架构

1. [项目架构分析](./architecture/AGENT.md) - 技术栈和结构
2. [实现总结](./architecture/IMPLEMENTATION_SUMMARY.md) - 实现细节
3. 查看源代码注释

### 我想贡献代码

1. 阅读 [项目架构分析](./architecture/AGENT.md)
2. 查看 [更新日志](../CHANGELOG.md) - 了解最新变更
3. 查看 [路线图](../CHANGELOG.md#路线图) - 计划中的功能

## 📖 文档结构

```
docs/
├── README.md                    # 本文件 - 文档导航
├── dify/                        # Dify 相关文档
│   ├── QUICK_START_DIFY.md     # 快速开始
│   ├── DIFY_INTEGRATION.md     # 详细接入指南
│   ├── CONFIG_EXAMPLES.md      # 配置示例
│   ├── DIFY_LIMITATIONS.md     # 限制说明
│   ├── NO_RESULT_IDENTIFIER.md # 无结果标识符
│   └── CHANGELOG_DIFY.md       # Dify 更新日志
└── architecture/                # 架构文档
    ├── AGENT.md                 # 项目架构分析
    ├── IMPLEMENTATION_SUMMARY.md # 实现总结
    └── SUMMARY.md               # 开发总结
```

## 🔗 外部资源

### 官方文档

- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Monaco Editor 文档](https://microsoft.github.io/monaco-editor/)
- [Element Plus 文档](https://element-plus.org/zh-CN/)

### AI 服务文档

- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [Dify 文档](https://docs.dify.ai/)
- [通义千问文档](https://help.aliyun.com/zh/dashscope/)

### 工具文档

- [TypeScript 文档](https://www.typescriptlang.org/zh/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [VueUse 文档](https://vueuse.org/)

## 💡 文档贡献

如果你发现文档有误或需要改进，欢迎：

1. 提交 Issue 说明问题
2. 提交 Pull Request 改进文档
3. 在讨论区提出建议

## 📝 文档约定

### 图标说明

- ⭐ - 推荐阅读
- ✨ - 新功能
- 🔧 - 配置相关
- 🐛 - Bug 修复
- 📚 - 文档更新
- ⚠️ - 重要提示
- 💡 - 提示和技巧

### 代码块说明

```typescript
// TypeScript 代码示例
```

```bash
# Shell 命令示例
```

```json
// JSON 配置示例
```

## 🆘 获取帮助

如果文档无法解决你的问题：

1. 查看 [Issues](https://github.com/your-repo/issues) 是否有类似问题
2. 提交新的 Issue 描述你的问题
3. 加入讨论区与其他开发者交流

---

**文档版本**：1.1.0  
**最后更新**：2026-01-07  
**维护者**：Spectre Team
