# Composition for Motion

Static composition rules apply to motion, but the frame changes over time. That changes everything.

---

## The moving frame problem

In a still design, the composition is fixed. The viewer's eye can scan at will.

In motion, the composition at frame 0 is different from frame 60 and frame 120. The designer is responsible for every frame in between, not just the start and end states. A transition that passes through a compositionally broken midpoint is a broken transition.

Check the midpoint. Always.

---

## Negative space over time

Static design uses negative space to create breathing room and direct the eye.

In motion, negative space is dynamic. An element moving into a corner compresses the negative space in that corner. An element scaling up can fill negative space that was deliberately there at the start state.

Rules:
- Plan where negative space will be at each key moment in the animation.
- Avoid midpoints where negative space is distributed accidentally (e.g. two elements in opposite corners, equidistant from center, creating dead symmetry during a transition).
- Entering elements should move from a dead zone (outside frame, or an area of planned negative space) toward the point of highest compositional interest.

---

## Entry and exit paths

Where an element comes from communicates intent.

| Entry direction | Reads as |
|---|---|
| From bottom | Rising, elevation, growth |
| From top | Dropping, falling, authority |
| From leading edge (left in left-to-right reading) | Forward, arrival, natural reading direction |
| From trailing edge (right) | Retreat, secondary, or deliberate reversal of expectation |
| Scale from center | Materializing, emerging, zoom focus |
| Scale from a functional point | Connected to that point (a button that expands into a panel) |
| Fade only | System-level, no physical metaphor intended |

Exit paths should be the inverse of the entry, unless the narrative demands otherwise. An element that entered from the bottom should exit toward the bottom. Breaking this reads as teleportation.

---

## Focal hierarchy in motion

In a still design, focal hierarchy is set by size, color, contrast, and position.

In motion, timing is an additional hierarchy signal. The first thing to move draws the eye. The fastest thing to move draws the eye. Use both deliberately.

If the wrong element is drawing first attention, either:
- Delay its movement so the primary element moves first, or
- Slow it down so the primary element is faster and more decisive.

---

## Reading direction and motion direction

Motion that travels in the same direction as the reading language (left-to-right) feels natural and progressive. Motion that travels against it can feel like retreat or reversal.

Use directional rules to reinforce narrative:
- Forward motion (left-to-right) for advancement, next steps, progress.
- Backward motion (right-to-left) for going back, undo, history.
- Vertical motion for hierarchy shifts (deeper = downward, elevated = upward).
- Scale changes (grow) for gaining importance; scale changes (shrink) for receding.

Mixing directional metaphors in the same sequence creates confusion. Pick a direction for each spatial relationship and hold it across the piece.

---

## Anchoring

Elements should feel anchored to the design grid, not floating independently.

When multiple elements move: if they all have a relationship to a common axis or anchor point, have them reference it. A lockup that reveals outward from the logo center feels grounded. A lockup where each element flies in from a random direction feels like clip art.

In practice: define your center of composition before building. Everything moves toward or away from that anchor, not arbitrarily.

---

## The frame edge

Screen edges are walls. Motion toward an edge is directional. Motion away from an edge is an arrival.

Elements that exit off-frame feel like they've moved to another place. Elements that disappear in place feel like they've ended. Choose which you want based on whether the element is leaving the scene permanently or temporarily.

Elements that stop exactly at the frame edge (cropped composition) should stay there with purpose. A random crop that happens to land at the edge reads as a mistake.

---

## Camera in motion design

Even in 2D work, the camera can move. Zooms and pans in AE are not camera moves; they are scale and position changes on a composition. But they read as camera moves to the viewer.

Zoom into a subject: increases intimacy, makes it feel significant.
Zoom out: reveals context, suggests the viewer is gaining perspective.
Pan: follows a subject, or reveals what was off-screen.

Do not zoom and pan simultaneously unless you are intentionally simulating a camera with drift. Random simultaneous zoom-pan reads as instability, not dynamism.
