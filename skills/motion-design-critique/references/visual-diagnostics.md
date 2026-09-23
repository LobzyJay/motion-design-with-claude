# Visual Diagnostics

For when the animation runs but looks wrong. Work through this list from top to bottom. Stop at the first match and fix it before moving to the next.

---

## Diagnostic checklist

**1. Is easing linear?**
Check the first and last keyframes of every moving property. If the interpolation is linear, that is the problem. Linear easing reads as mechanical and artificial in any motion graphics context that isn't a machine or countdown.
Fix: ease-out on entrances, ease-in on exits, ease-in-out on loops.

**2. Is everything moving at once?**
If all layers start and end their animation on the same frames, there is no hierarchy. The eye has no entry point.
Fix: stagger by 50–100ms between elements. Primary element first, secondary follows, decorative last. See `motion-design/references/timing-and-spacing.md`.

**3. Does everything have the same duration?**
If a heavy logo and a light caption both animate over 300ms, the motion has no weight differentiation.
Fix: heavy elements take longer (400–600ms). Light elements take less (150–250ms). Duration encodes weight.

**4. Is there anticipation before fast moves?**
A fast entrance with no wind-up reads as a sudden pop. If the move is aggressive (high velocity, large displacement), it needs anticipation.
Fix: add a keyframe 80–120ms before the main action, displaced 15–25px in the opposite direction of travel. Then into the main move.

**5. Is there follow-through after the settle?**
All elements stopping on the exact same frame reads like a PowerPoint slide change.
Fix: offset the final keyframe of secondary and decorative elements by 3–6 frames after the primary lands. Or add a slight overshoot keyframe 3–5 frames past the target, then settle back.

**6. Does the animation pass through a broken midpoint?**
At 50% through any transition, take a screenshot. Does the frame look like a deliberate design state, or like elements in transit to somewhere else? If the midpoint looks accidental, the motion path or easing needs adjustment.
Fix: check spatial handles (AE) or F-curve handles (Blender). The motion path between keyframes should be clean.

**7. Is wiggle being used without purpose?**
Raw `wiggle(5, 20)` on a Position property reads as "I added organic motion without designing it."
Fix: either justify the wiggle (slow ambient drift: `wiggle(0.5, 6)`) or replace it with a specific motion decision. See `aftereffects-motion/references/expressions.md`.

**8. Is the motion too slow or too fast for the visual weight?**
A small, light UI element animating over 1 second reads as broken. A heavy logo animating over 80ms reads as a glitch.
Fix: see timing table in `motion-design/references/timing-and-spacing.md`.

**9. Is the easing symmetric when it should be asymmetric?**
A bouncing element that bounces with equal height each time is a ping-pong between keyframes, not physics. Each bounce should be shorter than the last.
Fix: in AE, use the inertial bounce expression from `aftereffects-motion/references/expressions.md`. In Blender, add a Noise F-curve modifier with decay, or manually reduce amplitude per cycle.

**10. Is opacity the only entrance mechanic?**
A pure fade-in communicates nothing about where the element came from. It is the absence of a motion decision.
Fix: pair opacity with a position or scale move. The fade is the transition vehicle; the position or scale provides the direction and weight.

---

## How to request more information

If the above checklist doesn't identify the problem from a description alone, ask for:

- A screenshot at the specific timestamp where it looks wrong (e.g. "screenshot at 1.5s with comp panel at 100% zoom").
- If timing is the question: two screenshots, one at the start of the problematic range and one at the end.
- If layering is the question: a timeline screenshot showing layer in/out points and keyframe positions.
- If the problem is motion path: a comp screenshot with motion paths visible (View > Show Layer Controls).

One request. Be specific about what you need and why.

---

## Common describes and their translations

| The user says | What it actually means |
|---|---|
| "Looks robotic" | Linear easing, simultaneous animation, or no anticipation/follow-through |
| "Looks cheap" | Default easing, no weight differentiation, or opacity-only entrances |
| "Too fast" | Duration too short for the visual weight of the element |
| "Too floaty" | Ease-in-out on an entrance (slow start fights the eye); or overshoot without decay |
| "Looks like a slideshow" | No stagger, everything moves at once, no follow-through |
| "Feels flat" | No depth cues: no stagger, no size differentiation, no motion path arcs |
| "Doesn't feel premium" | Default easing, missing anticipation, or wiggle without purpose |
| "The bounce looks fake" | Symmetric bounce, needs decay per cycle |
| "Letters look the same" | Stagger too large or too small, or same easing on every character |
| "The settle looks off" | Overshoot too large, or decay too slow, adjust amplitude and decay rate |
