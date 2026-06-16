# motion-design-with-claude

Claude Code skills for motion designers working in Blender and After Effects.

Think of it as handing Claude the years of taste and tool knowledge you'd otherwise have to re-explain every single session. You set it up once, and from then on Claude already knows the difference between ease-in and ease-out, why everything animating at once looks cheap, and how to actually drive your tools.

**Install time: under 15 minutes.** Grab a coffee, you probably won't finish it before you're done.

---

## What it is

Four skills that turn Claude into a collaborator who already gets it. Here's the crew:

- **`motion-design`**: foundation. 12 principles, easing taxonomy, timing and spacing, composition for motion, defaults to steer away from. Tool-agnostic. Loads when motion is the subject.
- **`aftereffects-motion`**: AE specialist. Two-mode workflow (live MCP vs JSX scripts), ExtendScript patterns, expressions, effects catalog. Loads when AE is named or implied.
- **`blender-motion`**: Blender specialist. bpy keyframing, materials, lighting, cameras, F-curve modifiers, drivers, geometry nodes, render setup. Loads when Blender is named or implied.
- **`motion-design-critique`**: QA and diagnostics. Loads when something looks wrong, a script throws an error, or a render isn't what it should be.

Two MCP servers wire Claude directly into your tools:
- **After Effects MCP** (`TheLlamainator/after-effects-mcp`): live commands into AE and a JSX bridge.
- **Blender MCP** (official Blender Lab MCP, `projects.blender.org/lab/blender_mcp`): Python commands into a running Blender session.

Good news: the skills work just fine without the MCPs. If all you want is a sharp second brain for planning, reviewing timing, or critiquing a script, skip the MCP setup entirely and jump to Step 4.

---

## Install: 15-minute path

**Before you start, you need:**
- [Claude Code](https://docs.claude.com/en/docs/claude-code) installed (the `claude` command works in your terminal).
- Git.
- Node.js 18+ and npm (only for the After Effects MCP in Step 2). Check with `node -v`.
- After Effects and/or Blender, if you want live tool control.

Steps 1 and 4 are the must-dos. Steps 2 and 3 are pick-your-own-adventure: do Step 2 if you live in After Effects, Step 3 if Blender's your home, both if you bounce between them. Skip both and the skills still give you solid writing-level help.

### Step 1: Clone this repo

Get the skills onto your machine. Stay in this folder for the commands that follow.

```bash
git clone https://github.com/LobzyJay/motion-design-with-claude.git
cd motion-design-with-claude
```

### Step 2 (optional, After Effects users): Install the After Effects MCP

This lets Claude send live commands into a running AE. Run these from inside the `motion-design-with-claude` folder from Step 1.

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

### Step 3 (optional, Blender users): Install the Blender MCP

This lets Claude send Python commands into a running Blender session.

1. Download the Blender Lab MCP add-on from `projects.blender.org/lab/blender_mcp`.
2. In Blender: Edit > Preferences > Add-ons > Install > select the downloaded file > Enable.
3. In the add-on preferences: click **Start MCP Server**. You should see "MCP Server running on localhost:9876".

Register with Claude Code:
```bash
claude mcp add BlenderMCP sse http://localhost:9876/sse
```

Verify: `claude mcp list` should show `BlenderMCP`.

### Step 4: Install the skills

This is the step that actually installs the skills. Claude Code discovers them from `~/.claude/skills/` (personal, available in every project) and `.claude/skills/` (project-local). Pick one and copy the skills into it.

Personal install (available everywhere):
```bash
# macOS/Linux
mkdir -p ~/.claude/skills
cp -r skills/* ~/.claude/skills/
```

Or project-local, so the skills travel with one repo:
```bash
mkdir -p /path/to/your-project/.claude/skills
cp -r skills/* /path/to/your-project/.claude/skills/
```

There is no `skillsPath` setting; the two directories above are the only places Claude Code looks.

### Step 5: Sanity checks

Run the foundation check below (works for everyone). Run the AE check only if you did Step 2, and the Blender check only if you did Step 3.

**AE sanity check (if you did Step 2):**
1. Open AE with a project.
2. Window > `mcp-bridge-auto.jsx` > tick "Auto-run commands".
3. In Claude Code: `"Use the aftereffects-motion skill. List the compositions in my current AE project."`
4. Expected: Claude returns a list of comp names.

**Blender sanity check (if you did Step 3):**
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

Working motion designers who want a collaborator, not a tutorial bot that explains what a keyframe is for the hundredth time. You already know anticipation and follow-through. You already know ease-in from ease-out. You just want Claude to know it too, so you can skip the small talk and get to the good part. If that's you, you're home.

---

## What's out of scope

Setting expectations so nobody's surprised:

- Cinema 4D, Houdini, Nuke, DaVinci Resolve. Not covered, sorry.
- Web-motion (GSAP, Framer Motion, R3F). Wrong toolbox. Go grab [claudedesignskills](https://github.com/freshtechbro/claudedesignskills) instead.
- Cowork plugin packaging. This is Claude Code, pure and simple.

---

## Troubleshooting

Something acting up? Don't panic, it's almost always one of these.

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

Want to add your own tool skill (a `cinema4d-motion`, maybe)? Awesome, we'd love that. [CONTRIBUTING.md](CONTRIBUTING.md) walks you through it.
