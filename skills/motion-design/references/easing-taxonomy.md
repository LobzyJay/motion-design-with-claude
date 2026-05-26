# Easing Taxonomy

Not a list of curve shapes. A decision framework: which easing for which situation, and why.

---

## The decision tree

```
Is this an entrance (something appearing or arriving)?    → ease-out
Is this an exit (something leaving or disappearing)?      → ease-in
Is this a loop or a transition between two held states?   → ease-in-out
Is this a countdown, machine, or mechanical readout?      → linear
Does the brief have a specific mood (snap, spring, drag)? → custom bezier
```

If none of the above fit, the motion has not been scoped clearly enough. Get a clearer brief before choosing easing.

---

## Ease-out (deceleration)

**When:** Entrances. Elements entering the frame or arriving at their final position.

**Why:** Ease-out mirrors how physical objects move when arriving. Fast at the beginning, settling into position. It front-loads the energy so the eye catches the element immediately.

**AE convention:** In the graph editor, the value starts fast and slows at the end. Set the outgoing velocity high, incoming velocity near zero.

**bpy convention:** In the NLA/Graph Editor, use `EASE_OUT` interpolation or set handles so the right handle of the starting keyframe is positioned up-and-close and the left handle of the ending keyframe is positioned far-and-flat.

---

## Ease-in (acceleration)

**When:** Exits. Elements leaving the frame or transitioning away.

**Why:** Ease-in mirrors an object picking up speed as it leaves. Slow departure, fast exit. Without this, exits feel like elements getting yanked out of frame.

**AE convention:** Outgoing velocity near zero, incoming velocity high.

**bpy:** Left handle of ending keyframe positioned up-and-close, right handle of starting keyframe positioned far-and-flat.

**Caution:** Do not use ease-in for entrances. A slow-start entrance fights the eye; the viewer sees nothing happening, then suddenly the element is there.

---

## Ease-in-out (symmetric)

**When:** Loops. Transitions between two resting states where both ends deserve equal pacing. Breathing animations. Background ambient motion.

**Why:** Neither end is arrival or departure; both are held states. Symmetric easing gives them equal weight.

**AE:** F9 (Easy Ease) applies symmetric ease-in-out. It's a reasonable starting point; adjust velocity handles for the specific mood.

**bpy:** `BEZIER` interpolation with symmetric handles on both keyframes.

**Caution:** Ease-in-out on entrances and exits gives motion a "floating" quality that reads as weightless or ungrounded. Sometimes that's the brief. Usually it isn't.

---

## Linear

**When:** Countdowns and timers (the clock metaphor demands it). Progress bars with precise correspondence to elapsed time. Mechanical readouts. Type-on effects where each character appears at a uniform rate. Data visualization that encodes time.

**Why:** Linear easing communicates precision and mechanism. It's the only appropriate default for things that must feel like a machine.

**Common mistake:** Linear as a starting point because it's the default. Linear should be a deliberate choice, not the absence of a choice.

---

## Custom bezier

**When:** Any motion with a specific physical metaphor that none of the above cover cleanly. Springs. Snaps. Material drag. Overshoot followed by settle.

**AE:** Drag the velocity handles in the graph editor. A snap looks like: very fast in the middle, tight handles on both ends. A spring looks like: ease-out followed by a small ease-back past the target (overshoot), then forward again (settle). For overshoot without expressions, use an extra keyframe past the target, then a final keyframe at the target.

**bpy:** Edit the F-curve handles directly in the Graph Editor. `FREE` handle type gives full control. Use the Noise F-Curve modifier sparingly for organic drift.

**Reference curves for common moods:**

| Mood | Description |
|---|---|
| Snap | Near-linear with very fast peak velocity, tight settle at end |
| Bounce settle | Ease-out, slight overshoot, settle — better done with inertial expression in AE; explicit keyframes in bpy |
| Heavy drag | Slow, weighted entrance — very shallow start, steep middle, near-flat end |
| Elastic | Overshoot in both directions before settling — use expressions in AE; F-curve modifier in bpy |

---

## Bezier control point conventions

**After Effects (graph editor):**
- The horizontal axis is time; the vertical axis is value.
- The handles control velocity: a handle pulled far horizontally = slow velocity at that keyframe. A handle pulled close = fast velocity.
- Spatial handles (comp view) control the motion path curve. These are separate from temporal handles.
- Temporal and spatial handles are independent. Adjusting one does not affect the other.

**Blender (Graph Editor):**
- Same axis convention: horizontal = time (frames), vertical = value.
- Handle types: `AUTO` (default, smooth), `AUTO_CLAMPED` (smooth, won't overshoot), `VECTOR` (straight linear segments), `FREE` (manual), `ALIGNED` (moves both handles together).
- For most motion graphics: start with `AUTO_CLAMPED`, switch to `FREE` where precise velocity control is needed.
- In Python (`bpy`): set `keyframe_points[i].handle_left_type = 'FREE'` and set `handle_left` and `handle_right` coordinates explicitly.

---

## Common easing errors to name on sight

| What you see | What it means | Fix |
|---|---|---|
| Linear entrance or exit | Default — no decision made | Ease-out on entrance, ease-in on exit |
| Ease-in-out on an entrance | Floaty start, element isn't clearly arriving | Switch to ease-out |
| Everything the same easing | Easing was applied globally, not per-element | Per-element easing based on function |
| Fast ease-out overshoot that doesn't settle | Overshoot without decay | Add follow-through keyframe or inertial expression |
| Perfectly symmetric bounce | Keyframe ping-pong, not physics | Decay the bounce — each cycle should be shorter than the last |
