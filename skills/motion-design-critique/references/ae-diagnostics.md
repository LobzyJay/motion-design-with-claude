# AE Diagnostics

Script errors, expression errors, MCP failures, and common AE states that go wrong. Read the error message first, then find the matching pattern below.

---

## Script errors (JSX)

### "undefined is not an object" / "Cannot read property of null"

The script is trying to access a layer, property, or comp that doesn't exist.

Common causes:
- `comp.layer("SomeName")` where "SomeName" is not the exact layer name (case-sensitive, space-sensitive).
- `app.project.activeItem` returns null because no comp is open or selected.
- A shape group name has changed since the script was written.

Fix:
```js
// safe layer access
var layer = null;
for (var i = 1; i <= comp.numLayers; i++) {
    if (comp.layer(i).name === "ExactLayerName") {
        layer = comp.layer(i);
        break;
    }
}
if (!layer) { alert("Layer not found."); }
```

Run a state dump (`_dump_state.jsx`) to get the exact layer names as AE sees them. See `aftereffects-motion/references/scripting-patterns.md`.

---

### "KeyframeInterpolationType is not defined"

Using `KeyframeInterpolationType.BEZIER` before AE has loaded the enum. This sometimes happens at the top of a script before `app` is fully initialized.

Fix: move all `KeyframeInterpolationType` usage inside a function body, or wrap in a short wait:
```js
app.beginUndoGroup("MyScript");
// ... all your code here, including KeyframeInterpolationType usage
app.endUndoGroup();
```

---

### "After Effects error: can't add keyframe to locked property"

The property is locked (padlock icon on the layer or property) or the layer is shy.

Fix: unlock the layer before scripting:
```js
comp.layer("LayerName").locked = false;
```

---

### "Expression disabled" / expression turns red in AE

The expression has a syntax error or references a property that doesn't exist.

Ask the user to paste the exact expression text and the red error tooltip. Common causes:

| Error | Cause | Fix |
|---|---|---|
| `thisComp.layer("X")` errors | Layer renamed or deleted | Update the layer name reference |
| `comp is not defined` | Using `comp` outside an expression context | Use `thisComp` inside expressions |
| `Error: index out of range` | `numKeys` is 0 but expression accesses `key(1)` | Add a null check: `if (numKeys > 0)` |
| `undefined` value | Property path is wrong | Check `layer.transform.position` vs `layer.property("Transform").property("Position")` |

---

### Script runs but nothing changes

Most common cause: the script ran on the wrong comp or the wrong layer.

Diagnostic:
```js
alert("Active item: " + (app.project.activeItem ? app.project.activeItem.name : "none"));
```

If the active item is wrong, the user needs to click into the correct comp in the Project panel before running the script.

Second cause: the script changed values but at time 0, and the playhead is parked at a different time. The value is set; it just isn't visible at the current time.

---

### Script stacks duplicates on re-run

The script is not idempotent. It is adding layers or effects without checking if they already exist.

Fix: every script that creates named layers must have cleanup logic at the top that removes those layers before re-creating them. See the idempotent template in `aftereffects-motion/references/scripting-patterns.md`.

---

## MCP failures

### MCP calls hang or return no response

The bridge panel is closed or the checkbox is unticked.

Fix: tell the user to reopen `Window > mcp-bridge-auto.jsx` in AE and tick "Auto-run commands."

If the panel is open and ticked but still hanging: AE may be busy (rendering, running a long preview, blocked by an alert dialog). Check the AE window for any dialog or modal that needs dismissing.

---

### MCP returns success but AE didn't change

The bridge ran the command in a different comp than expected, or the command targeted a layer by index and the layer order changed.

Fix: always target layers by name, not by index. After any operation the user might have done manually (reordering layers, renaming), run a state dump before assuming the current structure matches what the script expects.

---

### `run-script` predefined script returns stale data

`getLayerInfo` and `getProjectInfo` return a snapshot. If the user modified the comp since the last call, the data is stale.

Fix: call the state dump script and read the fresh JSON. Do not patch based on data from a prior `getLayerInfo` call if the user has touched the comp.

---

## Render and playback issues

### RAM preview is slow / choppy

AE is not fully caching to RAM before playing. This is a performance issue, not an animation problem.

Tell the user: "Hit 0 on numpad to start RAM preview. Wait until the green bar fills the timeline range before it plays back. The first pass caches; the second plays at full framerate."

This is not a script fix. Do not try to resolve this via MCP.

---

### Final render output looks different from comp preview

Common causes:
- Color profile mismatch: comp is sRGB, output module is set to a different profile.
- Effects using GPU acceleration in preview, falling back to software in render.
- Draft quality was on during preview.

Ask the user: "Did you render as PNG sequence or H.264 directly from AE?" If H.264: "H.264 rendered from AE has lossy color. Render as PNG sequence and compare a single frame before calling it a render artifact."

---

### Script ran, AE crashed on undo

AE's Undo is unreliable after script operations. If the user is reporting that Cmd+Z crashed or trashed their project after a script ran:

"AE's Undo can't reliably reverse all script operations. The safest recovery is your most recent save. Always Cmd+S before running any non-trivial script. Going forward, scripts from this workflow will always remind you to save first."

There is no code fix for this. It is a known AE limitation. See `aftereffects-motion/references/limits-and-pitfalls.md`.
