# motion-design-with-claude

Agent skills for motion designers working in Blender and After Effects. Built for Claude Code, and they run the same way under GPT-6 Astra in Codex.

**Install time: under 15 minutes.** After that, your agent knows motion design principles, After Effects scripting patterns, and Blender's bpy API, without you re-explaining any of it.

---

## What it is

Four skills that give your agent the taste and tool knowledge to work alongside a senior motion designer:

- **`motion-design`**: foundation. 12 principles, easing taxonomy, timing and spacing, composition for motion, defaults to steer away from. Tool-agnostic. Loads when motion is the subject.
- **`aftereffects-motion`**: AE specialist. Three-mode workflow (live MCP, JSX scripts, Higgsfield Bridge), ExtendScript patterns, expressions, effects catalog. Loads when AE is named or implied.
- **`blender-motion`**: Blender specialist. bpy keyframing, materials, lighting, cameras, F-curve modifiers, drivers, geometry nodes, render setup, Higgsfield blockouts. Loads when Blender is named or implied.
- **`motion-design-critique`**: QA and diagnostics. Loads when something looks wrong, a script throws an error, or a render isn't what it should be.

MCP servers wire the agent directly into your tools:
- **After Effects MCP** (`TheLlamainator/after-effects-mcp`): live commands into AE and a JSX bridge.
- **Blender MCP** (official Blender Lab MCP, `projects.blender.org/lab/blender_mcp`): Python commands into a running Blender session.
- **Higgsfield Bridge** (optional, `bridge.higgsfield.ai/mcp`): drives the Higgsfield plugins inside Blender and AE. Blockouts, generated meshes, rigged characters, and Seedance clips in Blender. Generated plates, background removal, reframing, and upscaling in AE. Runs on your Higgsfield credits.

The skills work without the MCPs. If you only want writing-level help (planning, reviewing timing, critiquing a script), skip the MCP setup.

---

## Install: 15-minute path

Using GPT-6 Astra instead of Claude? Do Step 1, then jump to [Running with GPT-6 Astra](#running-with-gpt-6-astra-codex-cli).

### Step 1: Clone this repo

```bash
git clone https://github.com/LobzyJay/motion-design-with-claude.git
cd motion-design-with-claude
```

### Step 2: Install After Effects MCP

```bash
git clone https://github.com/TheLlamainator/after-effects-mcp.git
cd after-effects-mcp
npm install
npm run build
npm run install-bridge
cd ..
```

Register with Claude Code:
```bash
claude mcp add AfterEffectsMCP node "$(pwd)/after-effects-mcp/build/index.js"
```

Verify: `claude mcp list` should show `AfterEffectsMCP`.

### Step 3: Install Blender MCP

1. Download the Blender Lab MCP add-on from `projects.blender.org/lab/blender_mcp`.
2. In Blender: Edit > Preferences > Add-ons > Install > select the downloaded file > Enable.
3. In the add-on preferences: click **Start MCP Server**. You should see "MCP Server running on localhost:9876".

Register with Claude Code:
```bash
claude mcp add BlenderMCP sse http://localhost:9876/sse
```

Verify: `claude mcp list` should show `BlenderMCP`.

### Step 4: Install Higgsfield for Blender (optional)

Needs Blender 5.1 or newer and a Higgsfield account. Generation runs in the cloud, so no big GPU needed.

1. Download the add-on .zip from `higgsfield.ai/plugins/blender`. Keep it zipped.
2. Drag the .zip onto an open Blender window. It installs and enables itself. (Or: Edit > Preferences > Add-ons > Install.)
3. Sign in on the floating Higgsfield bar over the viewport.

Register the bridge with Claude Code:
```bash
claude mcp add --transport http HiggsfieldBridge https://bridge.higgsfield.ai/mcp
```

Then run `/mcp` inside Claude Code, pick `HiggsfieldBridge`, and sign in.

Verify: `claude mcp list` should show `HiggsfieldBridge`.

Keep the Blender MCP from Step 3 running too. The Blender MCP reads and edits the scene; the bridge generates new things into it. The skill knows which to use when.

### Step 5: Install Higgsfield for After Effects (optional)

Needs After Effects 2024 (24.0) or newer. One installer covers AE and Premiere Pro.

**macOS:**
1. Download the .dmg from `higgsfield.ai/plugins/after-effects`.
2. Open it, drag Higgsfield to Applications, double-click to launch it once.
3. In AE: Window > Extensions > Higgsfield AI. Sign in.

**Windows:**
1. Install the free ZXP Installer from aescripts.
2. Drag the Higgsfield .zxp onto it.
3. In AE: Window > Extensions > Higgsfield AI. Sign in.

The bridge is the same one from Step 4. If you already registered it, you're done. If not, run the `claude mcp add` command from Step 4.

Verify: `claude mcp list` should show `HiggsfieldBridge`.

Want Higgsfield image and video generation outside Blender and AE too? Add the generation MCP:
```bash
claude mcp add --transport http Higgsfield https://mcp.higgsfield.ai/mcp
```

### Step 6: Install the skills

Copy or symlink the skills directory into your Claude Code skills path:

```bash
# macOS/Linux
mkdir -p ~/.claude/skills
cp -r skills/* ~/.claude/skills/
```

Already installed an older version? Run the same `cp` again to pick up the Higgsfield updates.

Or add to your project's `.claude/settings.json`:
```json
{
  "skillsPath": "/path/to/motion-design-with-claude/skills"
}
```

### Step 7: Sanity checks

**AE sanity check:**
1. Open AE with a project.
2. Window > `mcp-bridge-auto.jsx` > tick "Auto-run commands".
3. In Claude Code: `"Use the aftereffects-motion skill. List the compositions in my current AE project."`
4. Expected: Claude returns a list of comp names.

**Blender sanity check:**
1. Open Blender with the MCP server running.
2. In Claude Code: `"Use the blender-motion skill. Connect to Blender MCP and tell me what objects are in my current scene."`
3. Expected: Claude returns the object list.

**Higgsfield in Blender sanity check:**
1. Open Blender with the Higgsfield bar signed in and the Blender MCP running.
2. In Claude Code: `"Use the blender-motion skill. Blockout a product plinth with two softbox stands using Higgsfield, then list what it added."`
3. Expected: Claude tells you what it's about to generate and asks before spending credits. After your yes, the blockout lands in the scene and Claude lists the new objects, collected into `HF_Blockout`.

**Higgsfield in AE sanity check:**
1. Open AE with the Higgsfield panel signed in and a comp with a footage layer.
2. In Claude Code: `"Use the aftereffects-motion skill. Remove the background on the top footage layer with Higgsfield."`
3. Expected: Claude names the layer, asks before spending credits, runs it, then reports the new layers it found.

**Foundation sanity check:**
`"Use the motion-design skill. Review my timing: I have a logo reveal where everything animates simultaneously over 300ms with linear easing."`
Expected: Claude names exactly what's wrong and gives specific fixes.

---

## Running with GPT-6 Astra (Codex CLI)

Same skills, same MCPs, different driver. Codex reads `SKILL.md` skills natively, and this repo ships an `AGENTS.md` and a `.agents/skills` link so Astra picks everything up when you launch Codex inside the repo.

### Step A: Set Astra as the model

Install Codex CLI and sign in with your ChatGPT account. Then add to `~/.codex/config.toml`:

```toml
model = "gpt-6-astra"
model_reasoning_effort = "high"
```

Use `xhigh` for long multi-step builds. The full example with every MCP is in `codex-config.toml.example`.

### Step B: Register the MCPs

Do Steps 2 to 5 above for the tool-side installs (AE bridge script, Blender add-ons, Higgsfield plugins). Then register with Codex instead of Claude Code:

```bash
codex mcp add AfterEffectsMCP -- node "$(pwd)/after-effects-mcp/build/index.js"
```

```bash
codex mcp add BlenderMCP -- npx -y mcp-remote http://localhost:9876/sse
```

```bash
codex mcp add HiggsfieldBridge --url https://bridge.higgsfield.ai/mcp
```

```bash
codex mcp login HiggsfieldBridge
```

Verify: `codex mcp list` should show all three.

The Blender MCP serves SSE, so `mcp-remote` bridges it for Codex. Needs Node installed.

### Step C: Skills

Launch Codex from inside this repo and the skills load from `.agents/skills`. To use them in any folder:

```bash
mkdir -p ~/.agents/skills
cp -r skills/* ~/.agents/skills/
```

### Step D: Sanity checks

Run the same prompts from Step 7 in Codex. The skills say "Claude"; Astra reads that as itself. `AGENTS.md` tells it so.

**ChatGPT desktop instead of Codex:** the Higgsfield plugin for ChatGPT has a `/use-after-effects` command that drives AE directly. It doesn't load these skills, so you lose the timing and easing rules. Codex is the better route.

---

## .mcp.json

See `.mcp.json.example` for the full Claude Code config and `codex-config.toml.example` for Codex. Copy the one you need and adjust paths for your machine.

---

## Who it's for

Senior motion designers who want an agent as a working collaborator, not a tutorial bot. You know what anticipation and follow-through are. You know the difference between ease-in and ease-out. You want your agent to know that too, without you explaining it every session.

---

## What's out of scope

- Cinema 4D, Houdini, Nuke, DaVinci Resolve. Not in v1.
- Web-motion (GSAP, Framer Motion, R3F). Use [claudedesignskills](https://github.com/freshtechbro/claudedesignskills) for those.
- Cowork plugin packaging.

---

## Troubleshooting

**AE MCP not responding:**
- Close and reopen `Window > mcp-bridge-auto.jsx` in AE.
- Confirm the "Auto-run commands" checkbox is ticked.
- Confirm `claude mcp list` shows `AfterEffectsMCP`.

**Blender MCP not responding:**
- Check that Blender is open and the add-on is enabled.
- Click "Start MCP Server" again in the add-on preferences.
- Confirm `claude mcp list` shows `BlenderMCP`.
- Confirm Blender's console shows "MCP Server running on localhost:9876".

**Higgsfield Bridge not responding:**
- Confirm `claude mcp list` (or `codex mcp list`) shows `HiggsfieldBridge`.
- Re-authenticate: `/mcp` in Claude Code, `codex mcp login HiggsfieldBridge` in Codex.
- In Blender: sign in on the floating Higgsfield bar. Blender must be 5.1 or newer.
- In AE: Window > Extensions > Higgsfield AI, signed in, panel open. AE must be 2024 or newer.
- Generation stops partway: check your credit balance.

**Script throws an error in AE:**
- Screenshot the error and paste it in. The agent will patch.
- AE's Undo can't reliably undo script operations. If something went wrong, use your most recent save.

**Render looks wrong in Blender:**
- Use the `motion-design-critique` skill. Drop a screenshot and describe what's wrong. The agent will diagnose.

---

## License

MIT. See [LICENSE](LICENSE).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add new tool skills (e.g. a future `cinema4d-motion`).
