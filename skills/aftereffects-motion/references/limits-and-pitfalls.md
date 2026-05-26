# Limits and Pitfalls

What the AE MCP can and cannot do. Read before scoping any build.

---

## Hard limits: MCP cannot do these

**Trim Paths and shape-layer interiors.** The MCP has no access to shape layer contents. Trim Paths, stroke/fill toggles on shapes, any property inside a shape group — all JSX-only. If the user asks for a Trim Paths animation, write JSX. Do not attempt via MCP.

**3D Layer switch.** Enabling the 3D Layer flag on a layer (`layer.threeDLayer`) is not accessible via MCP. Either tell the user to do it manually or handle it via JSX.

**Render and export.** Claude cannot trigger renders or exports. The user runs the Render Queue themselves. Your job ends at "set this up to render." Don't imply otherwise.

**Viewport vision.** Claude has no live view of the AE comp. The only way to see the current state is a user screenshot. Ask for one at a specific time when you need it — "screenshot at 2.5s with the comp panel visible at 100% zoom."

---

## ExtendScript quirks (ES3, not modern JS)

AE's scripting engine runs ExtendScript, which is roughly ES3. It does not understand modern syntax.

**No `const` or `let`.** Use `var` only.

```js
// breaks
const x = 5;
let y = 10;

// correct
var x = 5;
var y = 10;
```

**No arrow functions.**

```js
// breaks
var result = items.map(i => i.name);

// correct
var result = [];
for (var i = 0; i < items.length; i++) {
    result.push(items[i].name);
}
```

**No template literals.**

```js
// breaks
var msg = `Layer: ${name}`;

// correct
var msg = "Layer: " + name;
```

**`Array.indexOf` not always available.** Check before using, or write a manual loop.

```js
// safe fallback
function indexOf(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) return i;
    }
    return -1;
}
```

**No `try/catch` on property access (no optional chaining either).** Always check for null before accessing nested properties.

---

## Bridge requirements

The AE MCP only works when:

1. The `mcp-bridge-auto.jsx` panel is open (Window menu).
2. The **Auto-run commands** checkbox is ticked.
3. The panel stays open the entire session.

If the user closes the panel mid-session, all subsequent MCP calls will silently fail or hang. When this happens, tell them: "Reopen `Window > mcp-bridge-auto.jsx` and tick Auto-run commands."

---

## Undo is unreliable after JSX

AE's Undo (Cmd+Z) cannot reliably undo script operations. If a script runs and trashes something, Undo may not recover it. Before any non-trivial script, always say: "Cmd+S first, then run." The most recent save is the real undo.

---

## State staleness

If the user has moved keyframes, adjusted values, or added layers manually since your last script ran, your model of the comp is stale. Do not write a patch script based on stale assumptions. Write a state dump first, read the result, then patch.

---

## Performance: MCP is slow

Each MCP call takes 3-5 seconds. Ten calls = 30-50 seconds of dead time. If a build takes more than 5 MCP calls, switch to JSX. Don't ask. This isn't a preference; it's respect for the user's time.

---

## What MCP can do (for reference)

- `setLayerKeyframe`: sets position, scale, rotation, opacity keyframes
- `setLayerExpression`: attaches expression strings to properties
- `apply-effect`: applies effects by effect name
- `set-effect-keyframe`: keyframes effect parameters
- `run-script` with predefined scripts: `getProjectInfo`, `getLayerInfo`, `listCompositions`

Anything not on this list either requires JSX or is not possible at all.
