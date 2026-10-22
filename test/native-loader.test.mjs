import assert from "node:assert/strict"
import { cp, mkdir, mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import test from "node:test"

const runtimeRoot = process.env.DSH_RUNTIME_ROOT
if (!runtimeRoot) throw new Error("DSH_RUNTIME_ROOT must point to the installed @deepseek-ai/dsh package")

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const dshRoot = resolve(runtimeRoot)
const load = (path) => import(pathToFileURL(path))
const cordis = await load(join(dshRoot, "node_modules/@deepseek-ai/cordis/lib/index.js"))
const Loader = (await load(join(dshRoot, "node_modules/@deepseek-ai/cordis-plugin-loader/lib/index.js"))).default
const SystemPrompt = (await load(join(dshRoot, "node_modules/@deepseek-ai/dsh-system-prompt/lib/index.js"))).default
const handbook = await load(join(repoRoot, "index.js"))

async function rootWithPrompt() {
  const root = new cordis.Context()
  await root.plugin(SystemPrompt, { includeHarnessIdentity: false, includeRuntimeContext: false })
  return root
}

function handbookSections(root) {
  return root.systemPrompt.assemble().then((assembly) => assembly.sections.filter((section) => section.name === "ai-code-refinement:core"))
}

test("native systemPrompt registration is singleton and disposed with its fiber", async () => {
  const root = await rootWithPrompt()
  try {
    assert.equal((await handbookSections(root)).length, 0)
    await root.plugin(handbook)
    assert.equal((await handbookSections(root)).length, 1)
    assert.equal((await handbookSections(root)).length, 1)
  } finally {
    await root.fiber.dispose()
  }
  const after = await rootWithPrompt()
  try {
    assert.equal((await handbookSections(after)).length, 0)
  } finally {
    await after.fiber.dispose()
  }
})

test("native Loader loads, disables, reloads, and removes the bundle", async () => {
  const root = await rootWithPrompt()
  try {
    await root.plugin(Loader, { baseUrl: pathToFileURL(`${repoRoot}/`).href })
    const id = await root.loader.create({ id: "handbook", name: join(repoRoot, "index.js") })
    await root.loader.await()
    assert.equal((await handbookSections(root)).length, 1)
    await root.loader.update(id, { disabled: true })
    await root.loader.await()
    assert.equal((await handbookSections(root)).length, 0)
    await root.loader.update(id, { disabled: false })
    await root.loader.await()
    assert.equal((await handbookSections(root)).length, 1)
    await root.loader.remove(id)
    await root.loader.await()
    assert.equal((await handbookSections(root)).length, 0)
  } finally {
    await root.fiber.dispose()
  }
})

test("missing packaged Skill resource marks the plugin fiber failed", async () => {
  const temp = await mkdtemp(join(tmpdir(), "ai-code-refinement-missing-"))
  try {
    await cp(join(repoRoot, "index.js"), join(temp, "index.js"))
    await cp(join(repoRoot, "package.json"), join(temp, "package.json"))
    const root = await rootWithPrompt()
    try {
      await root.plugin(Loader, { baseUrl: pathToFileURL(`${temp}/`).href })
      await root.loader.create({ id: "missing", name: join(temp, "index.js") })
      await root.loader.await()
      const entry = root.loader.resolve("missing")
      assert.equal(entry.fiber.state, 3) // public FiberState.FAILED enum value
      assert.equal((await handbookSections(root)).length, 0)
    } finally {
      await root.fiber.dispose()
    }
  } finally {
    await rm(temp, { recursive: true, force: true })
  }
})


test("assembled section includes the complete base development rules exactly once", async () => {
  const root = await rootWithPrompt()
  try {
    await root.plugin(handbook)
    const [section] = await handbookSections(root)
    const base = (await readFile(join(repoRoot, ".agents/skills/ai-code-refinement/references/general/基础开发规范.md"), "utf8")).trim()
    assert.equal((await handbookSections(root)).length, 1)
    assert.ok(section.text.includes(base))
    assert.equal(section.text.split(base).length - 1, 1)
  } finally {
    await root.fiber.dispose()
  }
})

test("missing base rules fail the plugin fiber without registering a partial section", async () => {
  const temp = await mkdtemp(join(tmpdir(), "ai-code-refinement-missing-base-"))
  try {
    await cp(join(repoRoot, "index.js"), join(temp, "index.js"))
    const skillDir = join(temp, ".agents/skills/ai-code-refinement")
    await mkdir(skillDir, { recursive: true })
    await cp(join(repoRoot, ".agents/skills/ai-code-refinement/SKILL.md"), join(skillDir, "SKILL.md"))
    await cp(join(repoRoot, "package.json"), join(temp, "package.json"))
    const root = await rootWithPrompt()
    try {
      await root.plugin(Loader, { baseUrl: pathToFileURL(`${temp}/`).href })
      await root.loader.create({ id: "missing-base", name: join(temp, "index.js") })
      await root.loader.await()
      assert.equal(root.loader.resolve("missing-base").fiber.state, 3)
      assert.equal((await handbookSections(root)).length, 0)
    } finally {
      await root.fiber.dispose()
    }
  } finally {
    await rm(temp, { recursive: true, force: true })
  }
})
