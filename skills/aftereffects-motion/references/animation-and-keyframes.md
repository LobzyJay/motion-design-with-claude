# Animation and Keyframes

Keyframe creation, interpolation, and velocity control via ExtendScript. Load before any keyframe-level build. For the JSX object model and idempotent script template, see `references/scripting-patterns.md`. For expression-driven motion, see `references/expressions.md`.

---

## Two dimensions: temporal and spatial

AE keyframes carry two independent kinds of interpolation. Confusing them is the most common reason scripted motion looks wrong.

| Dimension | Controls | Where you see it |
|---|---|---|
| Temporal | When the value changes (easing, velocity) | Graph editor (speed/value graph) |
| Spatial | The path a position value travels | Comp view (motion path curve) |

Temporal interpolation applies to every animatable property. Spatial interpolation applies only to multi-dimensional spatial properties (Position, Anchor Point, effect point controls). Setting Position to BEZIER temporally does not smooth the path; you set spatial tangents separately.

---

## Interpolation types

```js
KeyframeInterpolationType.LINEAR     // constant velocity, no ease
KeyframeInterpolationType.BEZIER     // manual handle control, in and out
KeyframeInterpolationType.HOLD       // value snaps, no transition
KeyframeInterpolationType.EASY_EASE  // symmetric ease in and out (F9 in UI)
```

Set interpolation after the keyframes exist:

```js
var prop = comp.layer("Card").property("Transform").property("Position");
prop.setValueAtTime(0, [960, 700]);
prop.setValueAtTime(0.6, [960, 540]);

// in, out
prop.setInterpolationTypeAtKey(1, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
prop.setInterpolationTypeAtKey(2, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
```

HOLD is for snaps, cuts, and mechanical on/off states (a counter ticking, a strobe, a hard cut between poses). Never use it for motion that should read as smooth. LINEAR is for countdowns, machine readouts, and constant-rate loops only. Everything else gets BEZIER with deliberate velocity, per the foundation skill's easing rules.

---

## Velocity: the part most scripts skip

`setInterpolationTypeAtKey` only sets the handle type. It does not set the curve shape. A BEZIER keyframe with default handles is barely different from EASY_EASE. To shape real velocity, set temporal ease with `KeyframeEase` objects.

```js
// KeyframeEase(speed, influence)
//   speed: value units per second at the keyframe (usually 0 to stop motion)
//   influence: 0.1 to 100 percent, how far the handle reaches toward the next key
var easeOut = new KeyframeEase(0, 80);   // strong ease out: long influence, parks at 0 speed
var easeMild = new KeyframeEase(0, 33);  // gentle ease (AE default influence is ~16.7)

var prop = comp.layer("Card").property("Transform").property("Position");
// setTemporalEaseAtKey(keyIndex, [inEase per dimension], [outEase per dimension])
// Position is 2D, so pass an array of two eases for each side.
prop.setTemporalEaseAtKey(1, [easeMild, easeMild], [easeOut, easeOut]);
prop.setTemporalEaseAtKey(2, [easeOut, easeOut], [easeMild, easeMild]);
```

For a 1D property (Opacity, Rotation), pass a single-element array:

```js
var op = comp.layer("Card").property("Transform").property("Opacity");
op.setValueAtTime(0, 0);
op.setValueAtTime(0.4, 100);
op.setTemporalEaseAtKey(2, [new KeyframeEase(0, 70)], [new KeyframeEase(0, 70)]);
```

Rule of thumb for entrances: low influence on the outgoing handle of the first key, high influence on the incoming handle of the second key. That is an ease-out: fast departure, soft arrival.

---

## Spatial tangents (motion path shape)

Position keys travel in a straight line until you give them spatial tangents. Tangents are offsets in comp pixels, measured from the keyframe.

```js
var pos = comp.layer("Card").property("Transform").property("Position");
// setSpatialTangentsAtKey(keyIndex, inTangent[x,y], outTangent[x,y])
pos.setSpatialTangentsAtKey(1, [0, 0], [120, 0]);   // leaves moving right
pos.setSpatialTangentsAtKey(2, [120, 0], [0, 0]);   // arrives from the left, curved
```

To force a straight path (no overshoot arc), set both tangents to `[0, 0]` or use `setSpatialContinuousAtKey(keyIndex, false)`.

For an overshoot landing, add a third key past the target and pull the middle key's tangent through it. Do not fake overshoot with extra easing; it reads as mush.

---

## Hold-at-peak and snaps

```js
var scale = comp.layer("Pop").property("Transform").property("Scale");
scale.setValueAtTime(0.0, [0, 0]);
scale.setValueAtTime(0.25, [110, 110]); // overshoot
scale.setValueAtTime(0.4, [100, 100]);  // settle
// snap a strobe off with HOLD:
var op = comp.layer("Strobe").property("Transform").property("Opacity");
op.setValueAtTime(0.0, 100);
op.setInterpolationTypeAtKey(1, KeyframeInterpolationType.HOLD);
op.setValueAtTime(0.1, 0);
```

---

## Roving keyframes

Roving keys let middle position keys float in time so velocity stays smooth across the whole path (good for camera moves and continuous travel). Set the rove flag on interior keys only; the first and last key cannot rove.

```js
var pos = comp.layer("Camera Rig").property("Transform").property("Position");
// keys 2..(n-1) can rove
for (var k = 2; k < pos.numKeys; k++) {
    pos.setRovingAtKey(k, true);
}
```

---

## Time remapping

`timeRemapEnabled` exposes a Time Remap property you keyframe to freeze, reverse, ramp, or stutter a layer's internal time. Useful for hold-at-peak on nested comps and footage.

```js
var layer = comp.layer("PrecompLoop");
layer.timeRemapEnabled = true;
var tr = layer.property("Time Remap");
tr.setValueAtTime(0, 0);      // start of source
tr.setValueAtTime(1, 0.5);    // play first half over 1s
tr.setValueAtTime(1.5, 0.5);  // freeze for 0.5s
tr.setValueAtTime(2.5, 1.0);  // finish
tr.setInterpolationTypeAtKey(3, KeyframeInterpolationType.HOLD); // clean freeze
```

---

## Reading keyframes back

Before patching motion the user adjusted by hand, read the existing keys instead of guessing.

```js
var prop = comp.layer("Card").property("Transform").property("Position");
for (var k = 1; k <= prop.numKeys; k++) {
    var t = prop.keyTime(k);
    var v = prop.keyValue(k);
    // inspect prop.keyInTemporalEase(k), prop.keyInInterpolationType(k) for ease state
}
```

If the comp state may have diverged from what you know, run the state dump in `references/scripting-patterns.md` rather than assuming.

---

## Common mistakes

- Setting BEZIER but not setting `setTemporalEaseAtKey`. The motion stays near-linear and reads cheap.
- Treating Position like a 1D property. It needs an array of eases per side, and separate spatial tangents.
- Using EASY_EASE on entrances. Symmetric ease fights the eye on the way in. Entrances want ease-out, exits want ease-in.
- HOLD on motion that should be smooth, or BEZIER on a strobe that should snap.
