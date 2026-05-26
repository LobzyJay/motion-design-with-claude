# F-Curve Modifiers

Procedural motion layered on top of explicit keyframes. Load when the brief calls for loops, organic noise, or stepped motion.

---

## When to use F-curve modifiers vs explicit keyframes

| Use modifiers when | Use explicit keyframes when |
|---|---|
| The motion should repeat indefinitely | The motion has a defined start and end |
| Organic noise is the goal (not raw wiggle) | Precise timing and values are required |
| A stepped/strobe effect is needed | The motion must match a specific easing curve |
| A mathematical pattern drives the motion | The motion responds to a reference or brief |

Modifiers are non-destructive and stack. Order matters: modifiers apply from top to bottom in the stack.

---

## bpy: add an F-curve modifier

```python
import bpy

def get_or_create_fcurve(obj, data_path, index=0):
    action = obj.animation_data_create().action or bpy.data.actions.new(f"{obj.name}Action")
    obj.animation_data.action = action
    fc = action.fcurves.find(data_path, index=index)
    if not fc:
        fc = action.fcurves.new(data_path, index=index)
    return fc

def add_modifier(fc, mod_type):
    return fc.modifiers.new(type=mod_type)
```

---

## Cycles modifier (loop)

Repeats the keyframe range indefinitely. The essential loop modifier.

```python
fc = get_or_create_fcurve(obj, "location", index=2)  # Z axis

# set base keyframes (one full cycle)
kps = fc.keyframe_points
kps.add(2)
kps[0].co = (1, 0.0)    # frame 1, value 0
kps[1].co = (25, 1.0)   # frame 25, value 1
for kp in kps:
    kp.interpolation = 'EASE'
    kp.easing = 'EASE_IN_OUT'
kps.update()

mod = add_modifier(fc, 'CYCLES')
mod.mode_before = 'REPEAT'
mod.mode_after = 'REPEAT'
# 'REPEAT' — exact loop
# 'REPEAT_OFFSET' — repeats but offsets each cycle by end-minus-start delta
# 'MIRROR' — ping-pong
```

---

## Noise modifier (organic drift)

Adds procedural noise on top of keyframe values. Equivalent to wiggle in AE but composited over the base animation.

```python
fc = get_or_create_fcurve(obj, "location", index=0)  # X axis

# optional: set a baseline keyframe so the modifier has a value to add to
kps = fc.keyframe_points
kps.add(1)
kps[0].co = (1, 0.0)
kps.update()

mod = add_modifier(fc, 'NOISE')
mod.scale = 20.0        # frequency: higher = faster variation
mod.strength = 0.3      # amplitude: how far it deviates
mod.phase = 0.0         # offset into the noise pattern (seed equivalent)
mod.depth = 0           # octaves of noise (0 = simplest)
mod.blend_type = 'ADD'  # 'REPLACE', 'ADD', 'SUBTRACT', 'MULTIPLY'
```

Noise modifier vs. raw wiggle: the modifier is composited over keyframe values, so the object still lands where you told it to land. Raw wiggle in expressions (AE) or a pure noise-driven driver would override the base value. Use the modifier when you want drift layered on controlled motion.

---

## Generator modifier (mathematical patterns)

Applies a polynomial or sinusoidal function to the F-curve value.

```python
mod = add_modifier(fc, 'GENERATOR')
mod.mode = 'POLYNOMIAL'  # or 'EXTENDED_POLYNOMIAL'
mod.poly_order = 1
mod.coefficients[0] = 0.0   # constant
mod.coefficients[1] = 1.0   # linear coefficient (slope)
```

For a sine wave:
```python
mod = add_modifier(fc, 'GENERATOR')
mod.mode = 'EXTENDED_POLYNOMIAL'
# Note: for a pure sine oscillation, use a driver with Math: sin(time * freq) instead.
# Generator is better suited for linear trends added on top of keyframes.
```

---

## Stepped modifier (strobe / hold motion)

Forces the F-curve to hold a stepped value for N frames at a time. Gives a strobe or stutter effect.

```python
mod = add_modifier(fc, 'STEPPED')
mod.frame_step = 3     # hold each value for 3 frames before stepping
mod.frame_offset = 0   # offset which frame the steps start on
mod.use_frame_start = False
mod.use_frame_end = False
```

Useful for:
- Strobe/flicker effects on visibility or scale
- Stop-motion style animation where smooth motion is intentional broken
- Data-driven animations where value changes should be discrete, not interpolated

---

## Removing modifiers

```python
fc = action.fcurves.find("location", index=0)
if fc:
    for mod in list(fc.modifiers):
        fc.modifiers.remove(mod)
```

---

## Stacking modifiers

Multiple modifiers stack. Common useful combinations:

- **Cycles + Noise:** loop the base motion, add organic drift on top. The Noise modifier adds life to an otherwise mechanical loop.
- **Stepped + Noise:** strobe motion with slight jitter on each held frame.

Order in the stack matters. Cycles should typically be first (sets the base loop), Noise second (adds deviation over the looped value).
