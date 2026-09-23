# AGENTS.md

Instructions for Codex (GPT-6 Astra) and any other agent that reads AGENTS.md. Claude Code uses the skills directly and ignores this file.

## What this repo is

Four skills for motion designers working in Blender and After Effects. They live in `skills/` and are exposed to Codex through `.agents/skills` (a symlink to `skills/`).

| Skill | Load when |
|---|---|
| `motion-design` | Motion, timing, easing, or composition over time is the subject. Load first. |
| `aftereffects-motion` | After Effects is the tool. Covers AE MCP, JSX, and the Higgsfield Bridge (Mode C). |
| `blender-motion` | Blender is the tool. Covers the Blender MCP, bpy, and the Higgsfield Bridge. |
| `motion-design-critique` | Something looks wrong, a script throws, or the user wants a review. |

Tool skills layer on top of `motion-design`. Load references lazily, from the table in each SKILL.md.

## Hard rules

1. Every skill says "Claude". Read it as you. The rules apply to whichever agent is driving.
2. Higgsfield generations spend the user's credits. Say what you'll generate, wait for a yes, one generation per yes.
3. Never trigger a final render (Cycles F12, AE Render Queue, Seedance video) without the user's explicit go.
4. Every JSX and bpy script is idempotent and fails loudly.
5. Save before any destructive script. AE's Undo can't reliably reverse script operations.

## Editing this repo

Read `STYLE.md` before writing any skill content. No em dashes. No AI phrasing. SKILL.md files stay at 40 to 80 lines; knowledge goes in `references/`. See `CONTRIBUTING.md` for adding a new tool skill.
