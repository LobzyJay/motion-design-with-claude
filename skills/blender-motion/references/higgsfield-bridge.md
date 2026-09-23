# Higgsfield Bridge (Blender)

How to run a session with the Higgsfield add-on and its MCP bridge alongside the Blender MCP. Load when the user mentions Higgsfield, a blockout, Scene Builder, a generated mesh or character, or a Seedance render.

---

## Bridge setup (user-side, once per machine)

Requirements: Blender 5.1 or newer, macOS or Windows, internet, a Higgsfield account with credits. No GPU needed for generation; it runs on Higgsfield's servers.

1. Download the add-on .zip from `higgsfield.ai/plugins/blender`. Keep it zipped.
2. Drag the .zip onto an open Blender window. It installs and enables itself. (Fallback: Edit > Preferences > Add-ons > Install.)
3. Sign in on the floating Higgsfield bar over the viewport.
4. Register the bridge with the agent (see README). Name it `HiggsfieldBridge`. URL: `https://bridge.higgsfield.ai/mcp`.
5. Authenticate once when the agent asks. Leave Blender open with the add-on signed in for the whole session.

Verification prompt:
> "Use the blender-motion skill. Check the Higgsfield Bridge is connected and tell me which tools it exposes."

If the bridge answers but nothing lands in the scene, the add-on is signed out. The user signs in on the floating bar again.

---

## Two MCPs, two jobs

The Blender MCP and the Higgsfield Bridge are separate connections. Pick the right one per task. Never use the bridge for something bpy does exactly.

| Task | Use |
|---|---|
| Read the scene, list objects, check materials and cameras | Blender MCP |
| Keyframes, F-curves, drivers, modifiers, render settings | Blender MCP (bpy) |
| Exact material values from a reference image | Blender MCP (bpy) |
| Blockout a set or layout from a description | Bridge: Scene Builder |
| A prop or hero mesh that doesn't exist yet | Bridge: 3D Model (mesh at the 3D cursor) |
| A rigged, animated figure | Bridge: Character Animation |
| A texture, backdrop plate, or set-dressing image | Bridge: Image |
| A finished AI video shot from the assembled scene | Bridge: Video (Seedance), user-approved only |
| Pulling a past generation back in | Bridge: Asset library |

Rule of thumb: the bridge makes things that don't exist. bpy controls things that do. The Blender MCP is the source of truth for what's actually in the scene.

---

## Credit discipline

Every bridge generation spends the user's Higgsfield credits. The add-on shows the cost on the Generate button before it runs; you don't see that number.

1. Before generating, say exactly what you're about to generate and with which tool: "Scene Builder: a 4m concrete plinth, two softbox stands, one backdrop sweep. This spends credits. Go?"
2. Wait for a yes. One generation per yes.
3. Never generate variants unless the user asks. Variants multiply the cost.
4. Never regenerate to fix something bpy can fix. Wrong scale, position, rotation, material value, or name is a bpy change, not a new generation.
5. If a generation fails, report it once and ask before retrying. Don't loop.

---

## After every bridge build: audit

The bridge drops real Blender objects into the scene. Treat them like objects the user added by hand: you don't know their names or structure until you read them.

1. Run `get_objects_summary` through the Blender MCP.
2. Diff against the pre-build state. List what was added.
3. Rename generated objects to match the scene's naming convention. Ask if there isn't one.
4. Move them into a named collection (e.g. `HF_Blockout`, `HF_Props`, `HF_Character`). This keeps reblocks clean.
5. Check scale against existing objects. Generated meshes often arrive at arbitrary scale.
6. Continue the normal EEVEE preview loop from `operational-canon.md`.

Idempotent collection setup, safe to re-run:

```python
import bpy

def ensure_collection(name):
    coll = bpy.data.collections.get(name)
    if coll is None:
        coll = bpy.data.collections.new(name)
    if coll.name not in bpy.context.scene.collection.children:
        bpy.context.scene.collection.children.link(coll)
    return coll

def move_to_collection(obj_names, coll_name):
    coll = ensure_collection(coll_name)
    missing = []
    for name in obj_names:
        obj = bpy.data.objects.get(name)
        if obj is None:
            missing.append(name)
            continue
        for c in list(obj.users_collection):
            if c != coll:
                c.objects.unlink(obj)
        if obj.name not in coll.objects:
            coll.objects.link(obj)
    if missing:
        raise RuntimeError("Not found: " + ", ".join(missing))

# names come from the audit, never guessed
move_to_collection(["Plinth", "Softbox_L", "Softbox_R"], "HF_Blockout")
```

---

## Blockouts are previz

Scene Builder output is layout geometry. It is not production topology.

- Don't promise clean UVs, rig-ready meshes, or final-quality topology from a blockout.
- 3D Model output (Meshy 5) arrives with quad topology, UVs, and PBR maps. Still check it before hero use.
- Character Animation arrives with a weighted armature and standard actions. The keyframes are normal F-curves; polish them with the motion-design foundation rules like any other animation.

### Reblock pattern

When the layout changes, reblock instead of hand-moving twenty objects.

1. Confirm the collection holding the old blockout (`HF_Blockout`).
2. Ask the user: hide it or delete it. Default to hide. Never delete without a yes.
3. Generate the new blockout (credit rule applies).
4. Audit and collect into `HF_Blockout_v2`.
5. Anything the user hand-edited in the old blockout is lost in the new one. Say so before generating.

---

## Seedance renders

Video generates a finished clip from the assembled scene. It costs more than stills and takes around a minute.

- Treat it like F12. The user triggers it or explicitly approves it.
- It does not replace a Cycles final. It's an AI shot built from the scene, not a render of it. Say so if the user seems to expect frame-accurate output.
- Run the pre-render scene audit from `operational-canon.md` first. A hidden prop still shows up in the result.

---

## Camera tab

The Camera tab syncs the viewport camera to the user's phone for handheld motion. You can't operate it. If the user records a take, read the resulting camera animation with the Blender MCP and treat it as keyframes you can clean up (see `fcurve-modifiers.md` for smoothing or adding controlled noise).

---

## Limits

- Cloud only. No offline generation. Saved generations stay usable offline.
- Latency and plan-based rate limits apply. Don't promise a turnaround time.
- Camera language from prompts usually needs several passes. Give the user specific camera direction to approve, not a vague move.
- No public spec on polygon counts or export formats. Inspect, don't assume.
- Commercial rights depend on the user's Higgsfield plan. Flag it once if the work is for a client.
- Works with any MCP client (Claude Code, Codex with GPT-6 Astra, Cursor). The rules here apply regardless of which agent is driving.
