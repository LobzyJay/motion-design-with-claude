# motion-design-with-claude

Claude Code skills for motion designers working in Blender and After Effects.

**Install time: under 15 minutes.** After that, Claude Code knows motion design principles, After Effects scripting patterns, and Blender's bpy API — without you re-explaining any of it.

---

## What it is

Four skills that give Claude the taste and tool knowledge to work alongside a senior motion designer:

- **`motion-design`** — foundation. 12 principles, easing taxonomy, timing and spacing, composition for motion, defaults to steer away from. Tool-agnostic. Loads when motion is the subject.
- **`aftereffects-motion`** — AE specialist. Two-mode workflow (live MCP vs JSX scripts), ExtendScript patterns, expressions, effects catalog. Loads when AE is named or implied.
- **`blender-motion`** — Blender specialist. bpy keyframing, materials, lighting, cameras, F-curve modifiers, drivers, geometry nodes, render setup. Loads when Blender is named or implied.
- **`motion-design-critique`** — QA and diagnostics. Loads when something looks wrong, a script throws an error, or a render isn't what it should be.

Two MCP servers wire Claude directly into your tools:
- **After Effects MCP** (`TheLlamainator/after-effects-mcp`) — live commands into AE and a JSX bridge.
- **Blender MCP** (official Blender Lab MCP, `projects.blender.org/lab/blender_mcp`) — Python commands into a running Blender session.

The skills work without the MCPs. If you only want writing-level help (planning, reviewing timing, critiquing a script), skip the MCP setup.

---

## Install: 15-minute path

### Step 1 — Clone this repo

```bash
git clone https://github.com/LobzyJay/motion-design-with-claude.git
cd motion-design-with-claude
```

### Step 2 — Install After Effects MCP

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

### Step 3 — Install Blender MCP

1. Download the Blender Lab MCP add-on from `projects.blender.org/lab/blender_mcp`.
2. In Blender: Edit > Preferences > Add-ons > Install > select the downloaded file > Enable.
3. In the add-on preferences: click **Start MCP Server**. You should see "MCP Server running on localhost:9876".

Register with Claude Code:
```bash
claude mcp add BlenderMCP sse http://localhost:9876/sse
```

Verify: `claude mcp list` should show `BlenderMCP`.

### Step 4 — Install the skills

Copy or symlink the skills directory into your Claude Code skills path:

```bash
# macOS/Linux
mkdir -p ~/.claude/skills
cp -r skills/* ~/.claude/skills/
```

Or add to your project's `.claude/settings.json`:
```json
{
  "skillsPath": "/path/to/motion-design-with-claude/skills"
}
```

### Step 5 — Sanity checks

**AE sanity check:**
1. Open AE with a project.
2. Window > `mcp-bridge-auto.jsx` > tick "Auto-run commands".
3. In Claude Code: `"Use the aftereffects-motion skill. List the compositions in my current AE project."`
4. Expected: Claude returns a list of comp names.

**Blender sanity check:**
1. Open Blender with the MCP server running.
2. In Claude Code: `"Use the blender-motion skill. Connect to Blender MCP and tell me what objects are in my current scene."`
3. Expected: Claude returns the object list.

**Foundation sanity check:**
`"Use the motion-design skill. Review my timing: I have a logo reveal where everything animates simultaneously over 300ms with linear easing."`
Expected: Claude names exactly what's wrong and gives specific fixes.

---

## .mcp.json

See `.mcp.json.example` for the full config. Copy it to `.mcp.json` and adjust paths for your machine.

---

## Who it's for

Senior motion designers who want Claude as a working collaborator, not a tutorial bot. You know what anticipation and follow-through are. You know the difference between ease-in and ease-out. You want Claude to know that too, without you explaining it every session.

---

## What's out of scope

- Cinema 4D, Houdini, Nuke, DaVinci Resolve. Not in v1.
- Web-motion (GSAP, Framer Motion, R3F). Use [claudedesignskills](https://github.com/freshtechbro/claudedesignskills) for those.
- Cowork plugin packaging. v1 is Claude Code only.

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

**Script throws an error in AE:**
- Screenshot the error and paste it into Claude Code. It will patch.
- AE's Undo can't reliably undo script operations. If something went wrong, use your most recent save.

**Render looks wrong in Blender:**
- Use the `motion-design-critique` skill. Drop a screenshot and describe what's wrong. Claude will diagnose.

---

## License

MIT. See [LICENSE](LICENSE).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add new tool skills (e.g. a future `cinema4d-motion`).
