# Defaults to Avoid

The tells that mark motion as auto-generated or unconsidered. Name them when you see them. Replace them with decisions.

---

## Linear easing

**What it looks like:** Value changes at a perfectly constant rate from start to end. No acceleration, no deceleration.

**Why it's wrong:** Nothing in the physical world moves linearly. Linear motion reads as mechanical or digital in a way that breaks immersion in brand and product motion.

**Fix:** Ease-out for entrances. Ease-in for exits. Custom bezier for specific moods. Reserve linear for countdowns and machines — things that are supposed to feel mechanical.

---

## Everything moves at once

**What it looks like:** All elements in a scene start animating on the same frame and end on the same frame. The whole screen changes simultaneously.

**Why it's wrong:** The eye has nowhere to go. There is no visual sentence, just noise. The designer has handed off timing decisions to the software.

**Fix:** Stagger. Define the primary element, animate it first. Secondary elements follow with 50–100ms offset. Decorative elements follow last. See `timing-and-spacing.md`.

---

## Equal-duration everything

**What it looks like:** Every animation in the comp is 300ms (or 250ms, or 400ms — pick a number). A logo reveal, a text fade, and a background element all take the same amount of time.

**Why it's wrong:** Duration encodes weight. When every element has the same duration, no element has more weight than any other. The motion has no hierarchy.

**Fix:** Match duration to the physical metaphor and visual weight of each element. Heavy elements take longer. Light elements take less time.

---

## Default wiggle on Position

**What it looks like:** `wiggle(5, 20)` applied to a layer's position to add "organic movement." The result is random jitter with no relationship to the motion happening around it.

**Why it's wrong:** Wiggle with defaults communicates that you wanted organic motion but didn't design it. It's a placeholder used as a finish.

**Fix:** If you need ambient drift, use a slow, low-amplitude wiggle (`wiggle(0.5, 6)`) that is almost invisible. If you need controlled oscillation, use `Math.sin` with explicit frequency and amplitude. If you need post-action vibration, use a decaying oscillation expression, not raw wiggle. See `expressions.md` in the aftereffects-motion skill.

---

## No anticipation

**What it looks like:** A large fast element appears to move from rest with no wind-up. The motion starts abruptly at the in-keyframe.

**Why it's wrong:** Without anticipation, fast moves read as sudden and jarring. The eye hasn't been prepared for where the motion is going.

**Fix:** Add an anticipation keyframe before the main action. Duration: 20–30% of the main action. Distance: 10–20px in the opposite direction. Then into the main action at full force.

---

## No follow-through

**What it looks like:** Every element stops dead at its final keyframe. The whole comp "lands" at one frame and freezes.

**Why it's wrong:** Physical objects with momentum don't stop cleanly. The absence of follow-through is what makes motion graphics look like PowerPoint.

**Fix:** Allow elements to slightly overshoot their target, then settle. See `timing-and-spacing.md` for follow-through timing rules. Use an inertial bounce expression in AE for automatic settle.

---

## Symmetric bounce

**What it looks like:** An element bounces with equal height on each bounce. The animation loops perfectly.

**Why it's wrong:** This is a ping-pong between two keyframes. Physical bounces decay — each bounce is smaller than the last. A symmetric bounce reads as a toggle, not physics.

**Fix:** Add decay. Each cycle should be shorter in both duration and amplitude. If you want a loop, use a looping expression on a decaying pattern, not a keyframe ping-pong.

---

## Every layer on the same timeline marker

**What it looks like:** All layers in the comp start at frame 0. The whole scene builds from one moment with no pre-positioning or staggered entry.

**Why it's wrong:** This is the default state when you drop layers into AE without thinking about flow. It compounds the "everything moves at once" problem.

**Fix:** Position layer in-points across time deliberately. Layers that enter later should start later. Background elements can start at frame 0 if they establish the space; foreground elements should enter after the space is set.

---

## 2-second default duration

**What it looks like:** Comp duration is 2s and the animation roughly fills it end-to-end because that was the comp length. Or everything is 2s because AE's default layer duration is 2 seconds.

**Why it's wrong:** Duration should come from the brief, the platform, and the motion's physical metaphor — not from AE's default layer length.

**Fix:** Set comp duration based on what the motion needs. Edit layer in-points and out-points intentionally. Never let a default duration make a timing decision.

---

## Opacity as the only entrance mechanic

**What it looks like:** Every element fades in. The reveal is accomplished entirely by opacity keyframes from 0 to 100.

**Why it's wrong:** A pure fade communicates nothing about where an element came from or how it relates to the rest of the design. It is the absence of a motion decision.

**Fix:** Pair opacity with a position or scale move. The fade provides the transition; the position or scale provides the direction and weight. Exceptions: very subtle, background-level elements where a fade is correct because the element should not draw attention.

---

## Generic "glowing" or "lens flare" punctuation

**What it looks like:** A glow effect, lens flare, or streak applied at the moment an element arrives to "add energy."

**Why it's wrong:** These are stock motion graphic punctuation marks. They read as the designer not knowing how to make the motion itself carry energy.

**Fix:** If the motion needs energy, the motion itself should provide it. Faster entrance, higher initial velocity, more decisive easing. Effects are decoration; timing and easing are the work.
