# Expressions

Load when you reach for `wiggle`, `loopOut`, `valueAtTime`, or any time-driven motion. These are the patterns worth knowing. Not a complete reference.

---

## Inertial bounce and overshoot

Dan Ebberts' canonical math. Use this, not a cheap wiggle. Apply to Position, Scale, or Rotation after a settle keyframe.

```js
// Inertial Bounce (post-overshoot settle)
// Apply to the property you want to bounce after its final keyframe
n = 0;
if (numKeys > 0) {
    n = nearestKey(time).index;
    if (key(n).time > time) n--;
}
if (n == 0) {
    t = 0;
} else {
    t = time - key(n).time;
}

if (n > 0 && t < 1) {
    v = velocityAtTime(key(n).time - .001);
    amp = .08;
    freq = 2.5;
    decay = 6.0;
    value + v * amp * Math.sin(freq * 2 * Math.PI * t) / Math.exp(decay * t)
} else {
    value
}
```

Tuning:
- `amp` (amplitude): how far past the target it overshoots. 0.04-0.12 is the useful range.
- `freq` (frequency): oscillation speed. 2.0-4.0 covers most motion graphics use cases.
- `decay`: how fast it settles. Higher = faster decay. 4-8 for UI motion, 2-4 for softer material.

This expression reads the velocity at the last keyframe and decays it. The keyframe value IS the resting target. Don't add a bounce keyframe manually and then add this. Just end at the final value.

---

## loopOut and loopIn

Four modes worth knowing:

```js
loopOut("cycle")       // exact loop from first to last keyframe
loopOut("pingpong")    // forward then backward, seamless
loopOut("offset")      // repeats but offsets by the last-first keyframe delta each cycle
loopOut("continue")    // keeps going at the velocity of the last keyframe (no loop, just continues)
```

Same modes apply to `loopIn`.

Loop a bounce:
```js
loopOut("pingpong")
```

Drift that never repeats exactly:
```js
loopOut("offset")
```

Spin forever from last keyframe velocity:
```js
loopOut("continue")
```

Most useful for:
- Looping icons, badges, badges
- Ambient motion that runs in the background of a longer piece
- Loading states

---

## valueAtTime for stagger and offset

Delay one layer's value by reading another layer's earlier value:

```js
// reads this layer's own value 0.15s ago
// creates a natural lag/echo
thisComp.layer(thisLayer.index).transform.position.valueAtTime(time - 0.15)
```

Delay a property based on another layer:
```js
// reads the "Source" layer's position with a 0.2s delay
thisComp.layer("Source").transform.position.valueAtTime(time - 0.2)
```

Good for:
- Trail effects (position ghost following a lead layer)
- Organic text cascades that don't feel mechanical
- Character rig layers following a root

---

## time and time-driven motion

`time` is always the current composition time in seconds.

Linear value over time:
```js
time * 180   // rotates 180 degrees per second
```

Oscillation with Math.sin:
```js
amplitude = 30;
frequency = 0.5;   // cycles per second
offset = 0;
amplitude * Math.sin(2 * Math.PI * frequency * time + offset)
```

Ramp from 0 to a target value over a fixed duration:
```js
startTime = 0;
duration = 2;
targetValue = 500;
linear(time, startTime, startTime + duration, 0, targetValue)
```

---

## linear() and ease() for remapping

Map time or any value to a range, with or without easing.

```js
// linear(t, tMin, tMax, value1, value2)
// no easing, straight interpolation
linear(time, 0, 3, [0, 540], [960, 540])  // position slides over 3 seconds

// ease(t, tMin, tMax, value1, value2)
// smooth ease-in-out between value1 and value2
ease(time, 0.5, 2.5, 0, 100)  // opacity eases in over 2 seconds

// easeIn and easeOut are also available
easeIn(time, 0, 1, 0, 100)   // starts slow, ends fast
easeOut(time, 0, 1, 0, 100)  // starts fast, ends slow
```

---

## Wiggle done right

Raw `wiggle` on Position with defaults is the fastest way to signal you didn't think. If you reach for wiggle, have a reason.

Default you should not use:
```js
wiggle(5, 20)   // 5 cycles/sec, 20px amplitude. It's just noise.
```

Wiggle with intent:
```js
// slow, large drift, ambient camera-like movement
wiggle(0.5, 8)

// fast, small, mechanical jitter
wiggle(24, 2)

// time-limited wiggle (only during a window, settles after)
amp = 15;
freq = 3;
decay = 2;
n = 0;
if (numKeys > 0) n = nearestKey(time).index;
if (n > 0) {
    t = time - key(n).time;
    amp * Math.exp(-decay * t) * Math.sin(freq * 2 * Math.PI * t) + value
} else {
    value
}
```

Seeded wiggle (two layers that move together):
```js
seedRandom(42, true);  // true = time-independent seed
wiggle(2, 10)
```

Position wiggle in 2D only (don't wiggle Z on a 2D layer):
```js
w = wiggle(1.5, 12);
[w[0], w[1]]
```

---

## Parenting via expressions

Inherit a parent's position without creating an AE parent link (useful when you need additional offset):

```js
// follow "Parent" layer's position with a 20px vertical offset
thisComp.layer("Parent").transform.position + [0, 20]
```

Match rotation:
```js
thisComp.layer("Parent").transform.rotation
```

This is not the same as AE's built-in parent. Use it when you need the parent to exist independently or when you need the relationship to be value-driven, not hierarchy-driven.
