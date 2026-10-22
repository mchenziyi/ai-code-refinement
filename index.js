import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(fileURLToPath(import.meta.url))
const skillPath = join(root, ".agents", "skills", "ai-code-refinement", "SKILL.md")

function withoutFrontmatter(source) {
  if (!source.startsWith("---\n")) return source
  const end = source.indexOf("\n---", 4)
  if (end < 0) throw new Error(`invalid skill frontmatter: ${skillPath}`)
  return source.slice(end + 4).trimStart()
}

export const inject = ["systemPrompt"]

export async function apply(ctx) {
  const skill = withoutFrontmatter(await readFile(skillPath, "utf8"))
  const resourceBase = dirname(skillPath)
  const text = [
    `手册及 references 已随 Skill 打包，资源根目录为：${resourceBase}。解析 references/... 时以该目录为基准，不要以工作区 cwd 为基准。`,
    skill
  ].join("\n\n")
  ctx.effect(() => ctx.systemPrompt.section({
    name: "ai-code-refinement:core",
    order: 450,
    interpolate: false,
    text
  }), "ai-code-refinement.section()")
}
