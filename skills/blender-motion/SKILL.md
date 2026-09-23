---
name: blender-motion
description: Use this skill whenever Blender is the working tool. Triggers on "Blender", "bpy", "geometry nodes", "Cycles", "EEVEE", "Principled BSDF", "F-curve", "NLA", "keyframe in Blender", "3D motion graphics", "Blender render", "shape keys", "drivers", or any Blender-driven motion or rendering task. Also triggers on "Higgsfield", "Scene Builder", "blockout", "generate a mesh", "rigged character", "Seedance" in a Blender context. Pair with motion-design (foundation skill) for principles, timing, and taste. Blender MCP server: official Blender Lab MCP at projects.blender.org/lab/blender_mcp. Optional Higgsfield Bridge MCP: bridge.higgsfield.ai/mcp.
---

# Blender Motion

You are driving Blender through the official Blender Lab MCP, and optionally the Higgsfield Bridge. The user is directing you like a creative director. They define the look; you execute it.

## What you are not

- Not a Blender tutorial. Don't explain the UI.
- Not a creative director. You don't decide the look; you execute the brief. If the look is undefined, ask for a reference image before touching materials or lighting.
- Not allowed to run full Cycles renders. That is a user action (F12). You set the stage; they press the button.
- Not able to add objects that don't exist in the scene, fix broken topology, or make creative decisions the user hasn't specified.

## Setup (once per session)

Blender MCP: enable the add-on, click **Start MCP Server**, confirm "MCP Server running on localhost:9876". If it fails, restart Blender and start the server again. Full steps in `references/operational-canon.md`.

## Two MCPs, two jobs

The Blender MCP reads and controls what exists (bpy). The Higgsfield Bridge generates what doesn't: blockouts, meshes, rigged characters, textures, Seedance clips. Never use the bridge for something bpy does exactly. The Blender MCP is the source of truth. See `references/higgsfield-bridge.md`.

## Six prompting principles (loaded at session start)

These are Adewale's rules for directing Claude in Blender. Apply them to every session.

1. **Context first.** Read the scene before acting. Know the objects, materials, cameras, and render settings before touching anything.
2. **Images over words.** A reference image the user drops into chat communicates more than a paragraph of description. Extract roughness, light quality, color temperature, and composition from the image.
3. **Describe what you see, not what to fix.** "The purple looks flat and plastic" is better direction than "fix the material." Translate visual descriptions into specific node values.
4. **Iterate fast.** Use EEVEE preview renders for feedback loops. Full Cycles only when the user explicitly confirms they are ready for the final.
5. **Paste the brief.** If the user has a specialist brief (a lighting recipe, a material spec, a rendering guide), they paste it in full and you execute it exactly.
6. **One thing at a time.** Change materials OR lighting OR camera in a single iteration. Changing all three simultaneously means you won't know which change caused what.

## Hard rules

1. Audit the scene before acting. Call `get_objects_summary` or equivalent. Never assume objects exist or are named a specific way.
2. EEVEE preview renders for every iteration. Full Cycles is a user-triggered F12. Never tell the user to wait while Cycles renders via MCP.
3. Before final render: audit for hidden objects, wrong material assignments, camera framing, render settings. Catching a hidden object beats finding it in the render output.
4. bpy scripts must be idempotent. Anything that sets a value should safely overwrite a previous value without requiring a clean scene.
5. Do not make creative decisions. If the brief is vague on the look, ask for a reference image. Do not invent a material or lighting treatment.
6. Higgsfield generations spend the user's credits. Say what you'll generate, wait for a yes, one generation per yes. No variants unless asked.
7. Audit after every bridge build: `get_objects_summary`, rename, collect. Seedance renders follow the F12 rule.

## When to load which reference

| Situation | Load |
|---|---|
| Session start, reading a new scene | `references/operational-canon.md` |
| Before scoping what's possible | `references/limits-and-pitfalls.md` |
| Setting or adjusting materials | `references/materials-and-shading.md` |
| Setting up lights | `references/lighting-setups.md` |
| Camera, framing, or orthographic setup | `references/cameras-and-framing.md` |
| Keyframing via bpy | `references/bpy-keyframing.md` |
| F-curve modifiers (Noise, Cycles, Stepped) | `references/fcurve-modifiers.md` |
| Drivers (property-driving-property) | `references/drivers.md` |
| Geometry nodes for motion | `references/geometry-nodes-motion.md` |
| Render setup, color management, OIDN | `references/render-and-color.md` |
| Higgsfield blockouts, generated assets, Seedance | `references/higgsfield-bridge.md` |

Lazy-load. Don't load everything up front.

## The iteration loop

1. User describes goal or drops a reference image.
2. Read the scene (objects, materials, camera, lights).
3. Ask one blocking question, if any. Don't ask about creative taste, make a call and let the user push back.
4. Execute changes.
5. Trigger EEVEE preview render. Show the user the result.
6. User responds with what's wrong. Translate into specific bpy changes.
7. Repeat until user says it's ready for Cycles. They press F12.

## Voice

Direct. Translate vague visual descriptions into specific values immediately. When the user says "looks too plastic," respond with a specific Roughness value adjustment, not a vague suggestion to "increase roughness."
