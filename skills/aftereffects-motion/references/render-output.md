# Render and Output

Render Queue setup, output modules, and codec choices via ExtendScript. Load when preparing a render or auditing output settings. For the JSX object model, see `references/scripting-patterns.md`.

Claude never triggers the render. The user always presses the button. Your job is to set the queue up correctly and audit it before they do.

---

## What Claude can and cannot do

| Can | Cannot |
|---|---|
| Add a comp to the Render Queue | Start the render (it is a user action) |
| Set render settings and output module | Reliably render H.264 from older AE without AME |
| Set the output file path | Render faster than the machine allows |
| Read and audit all current settings | See the rendered result without a screenshot |

RAM preview (numpad 0) is not a render. It caches to RAM for real-time playback only. The Render Queue writes to disk.

---

## Adding a comp to the queue

```js
var comp = app.project.activeItem;
app.beginUndoGroup("Queue render v1");

var rq = app.project.renderQueue;
var rqItem = rq.items.add(comp);          // returns the RenderQueueItem
rqItem.timeSpanStart = 0;                 // render the whole comp
rqItem.timeSpanDuration = comp.duration;

app.endUndoGroup();
```

To audit instead of add, read existing items:

```js
var rq = app.project.renderQueue;
for (var i = 1; i <= rq.numItems; i++) {
    var item = rq.item(i);
    // item.status, item.comp.name, item.timeSpanDuration
    var om = item.outputModule(1);
    // om.file (output path), om.name (template)
}
```

---

## Render settings vs output module

Two separate things. Render Settings controls resolution, frame rate, and quality of the render itself. The Output Module controls the file format and codec written to disk.

```js
// apply a saved Render Settings template by name
rqItem.applyTemplate("Best Settings");

// apply a saved Output Module template by name
rqItem.outputModule(1).applyTemplate("ProRes 422 HQ");

// set the output path
rqItem.outputModule(1).file = new File("~/Desktop/render/shot_01.mov");
```

Template names must already exist in the project's render settings/output module presets. If a named template is missing, `applyTemplate` throws. Wrap it in try/catch and tell the user which template to create.

---

## Codec choice by delivery

| Delivery | Format | Why |
|---|---|---|
| Final master, handoff with alpha | ProRes 4444 | 12-bit, alpha channel, near-lossless |
| Final master, no alpha | ProRes 422 HQ | broadcast standard, manageable size |
| Frame-accurate iteration, safest | PNG sequence | per-frame, resumable, no codec artifacts |
| Web / client review | H.264 (.mp4) | small, plays everywhere |

Hard rule: do not render H.264 directly from AE for a final master if quality matters. Render ProRes or a PNG sequence, then transcode to H.264 in Adobe Media Encoder. Direct H.264 from the AE queue is lower quality and, in current versions, routed through AME anyway.

---

## Adobe Media Encoder handoff

For H.264 and most delivery codecs, send to AME instead of the AE queue:

```js
// queues the active comp in Adobe Media Encoder (AME must be installed)
app.project.renderQueue.queueInAME(false); // false = do not start immediately
```

The user picks the preset and starts the render in AME. This keeps AE free and gives better H.264 output.

---

## Pre-render audit (run before they hit Render)

Before any final render, confirm:

1. Resolution and frame rate match the comp's intent (`comp.width`, `comp.height`, `comp.frameRate`).
2. Time span is the whole comp, not a stray work-area trim (`rqItem.timeSpanStart`, `rqItem.timeSpanDuration`).
3. Output module codec matches the delivery (see table above).
4. Output path exists and is writable; the filename is descriptive, not `Comp 1.mov`.
5. No solo'd or hidden layers that should be visible (cross-check with `references/limits-and-pitfalls.md` and a state dump).

Then tell the user: "Cmd+S first. Settings are confirmed. Hit Render (or Start Queue in AME)."

---

## Common mistakes

- Rendering with the work area trimmed by accident, so the output is half the comp. Set `timeSpanDuration` explicitly.
- Applying an output module template that does not exist in the project. Confirm the preset name first.
- Rendering H.264 as a master, then wondering why the gradients band. Render ProRes or PNG, transcode after.
- Forgetting that the queue writes over an existing file silently if the path matches. Version the filename.
