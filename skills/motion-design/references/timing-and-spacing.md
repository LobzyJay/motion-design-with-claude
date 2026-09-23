# Timing and Spacing

Two different things. Conflating them is where most motion decisions go wrong.

---

## The distinction

**Timing** is when things happen. The start frame of a move. The moment a beat lands.

**Spacing** is how values are distributed between those moments. Dense spacing near a keyframe = slow. Sparse spacing = fast. This is easing. Timing and spacing are independent variables.

You can have good timing (moves land on the right beats) with bad spacing (linear between keyframes, no weight). You can have good spacing (perfect ease-out) with bad timing (everything moves at once, nothing reads).

Both have to be right.

---

## Duration as a design variable

Duration encodes weight. This is not a metaphor, it is how viewers read physicality in motion.

| Duration | What it reads as |
|---|---|
| Under 150ms | Instant, mechanical, system-level |
| 150–250ms | Light, responsive, UI-scale |
| 250–500ms | Standard, intentional, most brand motion |
| 500ms–1s | Heavy, deliberate, editorial |
| Over 1s | Cinematic, slow-motion, or simply too slow |

A large heavy logo entering at 200ms reads as wrong. A light notification badge at 800ms reads as broken. Match duration to the physical metaphor of the element.

---

## Stagger

Stagger is the offset between elements that should move as a group but not simultaneously. It is the primary tool for creating hierarchy through timing.

Without stagger: everything moves at once, the eye has no path, nothing reads as primary.

With stagger: the first element moving establishes a direction, subsequent elements confirm it, the sequence reads as intentional order.

**Stagger values for motion graphics:**

| Context | Stagger range |
|---|---|
| Tight (letters, tightly related elements) | 20–50ms |
| Standard (list items, cards, words) | 50–100ms |
| Loose (sections, large elements with visual separation) | 100–200ms |

Stagger direction matters. Top-to-bottom or left-to-right stagger reinforces reading direction. Starting from the visual center and radiating outward works for reveals. Reverse stagger (last-to-first) for exits.

---

## Offset

Offset is stagger applied to follow-through: when parts of a multi-element object settle at different times.

In a text lockup: the primary word settles, then the secondary line settles 80ms later, then a supporting badge settles 80ms after that. No single element defines the endpoint, the stack lands in sequence.

Offset is not the same as delay. Delay postpones a move entirely. Offset lets the whole group start moving together but arrive at different times.

---

## Anticipation timing

Anticipation is brief. Rule: anticipation should be 20–30% of the main action duration.

If a main move is 400ms, anticipation is 80–120ms. Longer than that and the anticipation becomes the animation; shorter and it disappears.

Anticipation magnitude: small. An anticipation that travels 20px before a move that travels 300px is correct. An anticipation that travels 80px for the same move is a cartoon.

---

## Follow-through timing

Follow-through is also brief. Elements that continue past their target should overshoot by 10–20% of the main move distance, then settle in 20–40% of the main action duration.

Main move: 300px over 400ms. Overshoot: 30–60px. Settle: 80–160ms.

If the follow-through takes longer than the main action, the motion reads as a bounce animation, not a settle.

---

## Hierarchy through timing: the rule

The primary element moves first. Supporting elements follow. Decorative elements follow last.

In a logo reveal:
1. Primary mark (50ms head start)
2. Wordmark (stagger from mark, 80ms offset)
3. Tagline (200ms after wordmark starts)
4. Background texture or ambient elements (last, slowest)

If any element in the hierarchy draws the eye before the primary mark does, it is either moving too early or moving too fast. Fix the timing first; don't fix it by slowing everything down uniformly.

---

## Rhythm

When an animation has multiple sequential beats, they should feel rhythmic: not metronomic (exactly equal intervals), but musically paced (like a sentence with natural cadence).

A sequence of reveals at exactly 200ms, 400ms, 600ms, 800ms is a metronome. It reads as software, not craft.

A sequence at 0ms, 180ms, 340ms, 550ms has phrasing. Elements cluster slightly, breathe slightly. That's rhythm.

There is no formula for rhythm. The test is: does the timing map onto a phrase you can speak aloud at a natural cadence? If yes, it has rhythm.
