# AI 代码精炼之道

为 AI 辅助开发提供编码前读取、编码中遵循的跨语言开发规范。

规范用于功能实现与缺陷修复过程；项目约定、用户授权和目标语言工具链优先。

## v0.4.0

- Skill：[`.agents/skills/ai-code-refinement/SKILL.md`](.agents/skills/ai-code-refinement/SKILL.md)
- DSH 入口：[index.js](index.js) 和 [cordis.patch.yml](cordis.patch.yml)
- 基础规范：[基础开发规范](.agents/skills/ai-code-refinement/references/general/基础开发规范.md)随 DSH system prompt 注入
- 场景规范：[接口与输入](.agents/skills/ai-code-refinement/references/general/接口与输入.md)、[错误与资源](.agents/skills/ai-code-refinement/references/general/错误与资源.md)、[并发与持久化](.agents/skills/ai-code-refinement/references/general/并发与持久化.md)、[安全与依赖](.agents/skills/ai-code-refinement/references/general/安全与依赖.md)、[验证与测试](.agents/skills/ai-code-refinement/references/general/验证与测试.md)，实现对应部分前读取
- 语言专项初稿保留在源码目录，本版不打包或自动路由；待用户指定语言后逐一完善
- 维护记录：[docs/规则来源与维护记录.md](https://github.com/mchenziyi/ai-code-refinement/blob/main/docs/规则来源与维护记录.md)
- 验证记录：[docs/首版说明与验证.md](https://github.com/mchenziyi/ai-code-refinement/blob/main/docs/首版说明与验证.md)

## 安装与停用

复用 Skill 目录前检查目标项目是否已有 `.agents/skills/ai-code-refinement`；已有同名目录先比较版本，不覆盖。已安装旧插件时先停用或卸载旧插件，再安装新插件，避免两份规则同时注入；不会自动操作用户 profile。DSH bundle 安装：

```sh
dsh plugin --profile <profile> add /absolute/path/to/ai-code-refinement-dsh-0.4.0.tgz
```

停用时在 profile 的 `cordis.patch.yml` 追加 `ai-code-refinement` 的 `disabled: true` 覆盖项；卸载：

```sh
dsh plugin --profile <profile> remove ai-code-refinement-dsh
```

未启用 HMR 的 profile 需要重启。安装、停用和卸载影响该 profile 的会话，建议先用隔离 profile 验证。

## 兼容边界

bundle 按 DSH `0.2.0-rc.2` 的本地公开接口和 Node `v24.12.0` 验证；未做默认 coder/creator/team、ACP、profile 安装闭环或在线 LLM 验证。scoped `complete` system prompt 可能排除外部 section。没有跨语言应用 benchmark 或 A/B 对照，不能据此声称减少缺陷。
