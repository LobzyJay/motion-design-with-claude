# Higgsfield Bridge (After Effects)

Mode C. How to run the Higgsfield AE plugin through its MCP bridge alongside the AE MCP and JSX. Load when the user mentions Higgsfield, generated footage, background removal, reframing, upscaling, or Draw to Edit.

---

## Bridge setup (user-side, once per machine)

Requirements: After Effects 2024 (24.0) or newer, macOS (Apple Silicon or Intel) or Windows 10/11 64-bit, internet, a Higgsfield account with credits. One installer covers AE and Premiere Pro.

**macOS**
1. Download the .dmg from `higgsfield.ai/plugins/after-effects`.
2. Open it, drag Higgsfield to Applications, double-click to launch once.
3. In AE: Window > Extensions > Higgsfield AI. Sign in.

**Windows**
1. Install the free ZXP Installer from aescripts.
2. Drag the Higgsfield .zxp onto it.
3. In AE: Window > Extensions > Higgsfield AI. Sign in.

Then register the bridge with the agent (see README). Name it `HiggsfieldBridge`. URL: `https://bridge.higgsfield.ai/mcp`. Authenticate once when the agent asks.

Keep the Higgsfield panel open and signed in for the session. The AE MCP bridge (`mcp-bridge-auto.jsx`) stays open too if you want Mode A.

Verification prompt:
> "Use the aftereffects-motion skill. Check the Higgsfield Bridge is connected and list the comps in my project."

---

## Three modes

| Task | Mode |
|---|---|
| Read a property, nudge one keyframe, inspect the comp | A. AE MCP |
| Any multi-keyframe build, anything re-runnable | B. JSX |
| Shape layers, Trim Paths, text animators | B. JSX |
| Generate a plate, background, overlay, or title card image | C. Bridge |
| Generate a video clip onto the timeline | C. Bridge |
| Key a subject without green screen | C. Bridge: Remove Background |
| Deliver 9:16, 1:1, 4:3, 3:4, 21:9 from a 16:9 master | C. Bridge: Reframe |
| Paint out an object or add an element on a frame | C. Bridge: Draw to Edit |
| Push footage to 4K or 8K | C. Bridge: Upscale |
| Prompt-based change to existing footage | C. Bridge: Edit Video |

The bridge can also write layers, keyframes, and expressions. Don't use it for that. Motion builds stay in Mode B: a JSX file is reproducible, idempotent, and reviewable. A bridge build is none of those. The only exception is when the user explicitly asks the bridge to build it.

---

## Credit discipline

Generation, Remove Background, Reframe, Upscale, and Edit Video all spend Higgsfield credits (unless the model is on the user's Unlimited list; you can't see that).

1. Say what you're about to run, on which layer, at what output: "Remove Background on `Talent_A.mov`, full duration. Spends credits. Go?"
2. Wait for a yes. One operation per yes.
3. Trim the work area or precomp to the used range before processing footage. Don't upscale or key frames that never make the cut.
4. No variants unless asked.
5. If an operation fails, report it once and ask before retrying.

---

## After every bridge operation: dump state

Generated or processed media lands in the project and usually on the timeline. You don't know where until you look.

1. Run the state dump from `scripting-patterns.md` (or a Mode A read of the active comp).
2. List what was added: new footage items, new layers, their index, in and out points.
3. Rename new layers to the comp's naming convention. Prefix `HF_` if there isn't one.
4. Park generated footage in a project folder (`HF Generations`). Idempotent JSX pattern:

```js
(function () {
    var FOLDER = "HF Generations";
    var proj = app.project;
    if (!proj) { alert("No project open."); return; }

    app.beginUndoGroup("Collect HF generations");
    try {
        var folder = null;
        for (var i = 1; i <= proj.numItems; i++) {
            var it = proj.item(i);
            if (it instanceof FolderItem && it.name === FOLDER) { folder = it; break; }
        }
        if (!folder) folder = proj.items.addFolder(FOLDER);

        // names come from the state dump, never guessed
        var names = ["HF_plate_01.mp4", "HF_bg_sky.png"];
        var missing = [];
        for (var n = 0; n < names.length; n++) {
            var found = false;
            for (var j = 1; j <= proj.numItems; j++) {
                var item = proj.item(j);
                if (item.name === names[n] && !(item instanceof FolderItem)) {
                    item.parentFolder = folder;
                    found = true;
                    break;
                }
            }
            if (!found) missing.push(names[n]);
        }
        if (missing.length) alert("Not found: " + missing.join(", "));
    } catch (e) {
        alert("Collect failed: " + e.toString());
    } finally {
        app.endUndoGroup();
    }
})();
```

5. Only then run any JSX that touches the comp. A JSX written against a pre-bridge state dump can target the wrong layer index.

---

## Using generated media well

- Generated footage is a plate, not the design. Motion, timing, and hierarchy still come from you and the foundation skill.
- Match frame rate. Check the generated clip's fps against the comp before building on it. Interpret Footage if it's off; never let AE frame-blend silently.
- Remove Background output carries alpha. Check edges at 200% on a hair or motion-blur frame before approving. Ask for a screenshot at a specific time.
- Reframe tracks the subject. It doesn't know your type safe areas. Check titles and lower thirds in every aspect ratio after reframing.
- Upscale before grading and effects, not after.

---

## Supercomputer and ChatGPT routes

Higgsfield's Supercomputer detects the plugin with no bridge setup. ChatGPT has its own Higgsfield plugin with a `/use-after-effects` command. Same rules apply there: credits confirmed, JSX for motion builds, state dump after every operation.

---

## Limits

- Cloud only. No offline mode. The panel must be signed in.
- AE 2023 and older are unsupported.
- Generation time scales with resolution and duration. Don't promise turnaround.
- The bridge sees the project, not the viewer. You still need a user screenshot to judge the result.
- Commercial rights depend on the user's Higgsfield plan. Flag it once if the work is for a client.
