# AI 代码精炼之道

让 AI 写出清晰、简洁、规范、可靠的代码。

跨语言 AI 辅助开发检查清单与 DSH bundle。规则按任务风险读取，适用于实现功能、修复缺陷和代码审查；项目约定、用户授权和目标语言工具链优先。

## v0.2.3

- Skill：[`.agents/skills/ai-code-refinement/SKILL.md`](.agents/skills/ai-code-refinement/SKILL.md)
- DSH 入口：[index.js](index.js) 和 [cordis.patch.yml](cordis.patch.yml)
- 按需规则：[通用规则与语言案例](.agents/skills/ai-code-refinement/references/通用规则与语言案例.md)、[易错案例与检查方法](.agents/skills/ai-code-refinement/references/易错案例与检查方法.md)
- 维护记录：[docs/规则来源与维护记录.md](docs/规则来源与维护记录.md)
- 验证记录：[docs/首版说明与验证.md](docs/首版说明与验证.md)

## 安装与停用

复用 Skill 目录前检查目标项目是否已有 `.agents/skills/ai-code-refinement`；已有同名目录先比较版本，不覆盖。已安装旧插件时先停用或卸载旧插件，再安装新插件，避免两份规则同时注入；不会自动操作用户 profile。DSH bundle 安装：

```sh
dsh plugin --profile <profile> add /absolute/path/to/ai-code-refinement-dsh-0.2.3.tgz
```

停用时在 profile 的 `cordis.patch.yml` 追加 `ai-code-refinement` 的 `disabled: true` 覆盖项；卸载：

```sh
dsh plugin --profile <profile> remove ai-code-refinement-dsh
```

未启用 HMR 的 profile 需要重启。安装、停用和卸载影响该 profile 的会话，建议先用隔离 profile 验证。

## 兼容边界

bundle 按 DSH `0.2.0-rc.2` 的本地公开接口和 Node `v24.12.0` 验证；未做默认 coder/creator/team、ACP、profile 安装闭环或在线 LLM 验证。scoped `complete` system prompt 可能排除外部 section。没有跨语言应用 benchmark 或 A/B 对照，不能据此声称减少缺陷。
