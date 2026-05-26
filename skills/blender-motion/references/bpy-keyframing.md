# bpy Keyframing

Setting keyframes programmatically. Load before writing any animation script in Blender.

---

## keyframe_insert

The primary method for setting a keyframe via Python.

```python
import bpy

obj = bpy.data.objects["MyObject"]
scene = bpy.context.scene

# set the value you want at a given frame, then insert a keyframe
scene.frame_set(1)
obj.location = (0, 0, 0)
obj.keyframe_insert(data_path="location", frame=1)

scene.frame_set(30)
obj.location = (0, 0, 2)
obj.keyframe_insert(data_path="location", frame=30)
```

`data_path` is the Python attribute path on the object. Common paths:

| What you want to keyframe | data_path | index |
|---|---|---|
| Location (all axes) | `"location"` | — |
| Location X only | `"location"` | `0` |
| Location Y only | `"location"` | `1` |
| Location Z only | `"location"` | `2` |
| Rotation (Euler) | `"rotation_euler"` | — |
| Scale | `"scale"` | — |
| Visibility (hide_render) | `"hide_render"` | — |
| Material slot 0 roughness | on the material node, not the object | see below |

For properties on materials/nodes, access the node tree directly:
```python
mat = bpy.data.materials["MyMat"]
node = mat.node_tree.nodes["Principled BSDF"]
node.inputs["Roughness"].default_value = 0.07
node.inputs["Roughness"].keyframe_insert("default_value", frame=1)
```

---

## Setting interpolation type

After inserting keyframes, set the interpolation on each F-curve.

```python
# get the action (created when you first keyframe)
action = obj.animation_data.action

for fcurve in action.fcurves:
    if fcurve.data_path == "location":
        for kp in fcurve.keyframe_points:
            kp.interpolation = 'BEZIER'   # or 'LINEAR', 'CONSTANT', 'EASE', etc.
            kp.easing = 'EASE_OUT'        # 'EASE_IN', 'EASE_IN_OUT', 'AUTO', 'NONE'
```

Interpolation types:
- `'BEZIER'` — smooth curves, handles manually adjustable
- `'LINEAR'` — straight lines between keyframes
- `'CONSTANT'` — hold value until next keyframe (snap)
- `'EASE'` — built-in easing (uses the `easing` property below)
- `'BOUNCE'`, `'ELASTIC'`, `'BACK'` — procedural easing presets

Easing modifier (only applies when `interpolation = 'EASE'`):
- `'EASE_IN'` — accelerates (slow start)
- `'EASE_OUT'` — decelerates (slow end)
- `'EASE_IN_OUT'` — both ends slow

For most motion graphics: use `'BEZIER'` and control handles manually, or use `'EASE'` with the appropriate easing type for quick setup.

---

## Setting handle positions (BEZIER handles)

For precise velocity curves, set handle positions explicitly.

```python
for fcurve in action.fcurves:
    if fcurve.data_path == "location" and fcurve.array_index == 2:  # Z only
        kps = fcurve.keyframe_points
        kps.update()

        # first keyframe: fast exit
        kps[0].handle_right_type = 'FREE'
        kps[0].handle_right = (kps[0].co[0] + 5, kps[0].co[1] + 1.0)

        # last keyframe: slow arrival
        kps[-1].handle_left_type = 'FREE'
        kps[-1].handle_left = (kps[-1].co[0] - 5, kps[-1].co[1] + 0.5)
```

`co` is `(frame, value)`. Handle coordinates are in the same space.

---

## Stagger across multiple objects

```python
import bpy

objects = [bpy.data.objects[n] for n in ["Word1", "Word2", "Word3", "Word4"]]
stagger_frames = 4  # frames between each start
duration_frames = 20

for i, obj in enumerate(objects):
    start = 1 + i * stagger_frames
    end = start + duration_frames

    # start: off-screen (below)
    obj.location.z = -1.0
    obj.keyframe_insert("location", frame=start)

    # end: in position
    obj.location.z = 0.0
    obj.keyframe_insert("location", frame=end)

    # ease-out on arrival
    action = obj.animation_data.action
    for fc in action.fcurves:
        if fc.data_path == "location" and fc.array_index == 2:
            for kp in fc.keyframe_points:
                kp.interpolation = 'EASE'
                kp.easing = 'EASE_OUT'
```

---

## Accessing and editing F-curves directly

```python
action = obj.animation_data.action
if action:
    for fc in action.fcurves:
        print(f"data_path: {fc.data_path}, index: {fc.array_index}, keys: {len(fc.keyframe_points)}")
        for kp in fc.keyframe_points:
            print(f"  frame {kp.co[0]}: value {kp.co[1]}, interp {kp.interpolation}")
```

To delete all keyframes on an object:
```python
obj.animation_data_clear()
```

To delete keyframes on a specific property:
```python
action = obj.animation_data.action
if action:
    for fc in [f for f in action.fcurves if f.data_path == "location"]:
        action.fcurves.remove(fc)
```

---

## Idempotent animation script pattern

Clear existing keyframes before setting new ones, so the script is safe to re-run.

```python
import bpy

def animate_object(obj_name):
    obj = bpy.data.objects.get(obj_name)
    if not obj:
        print(f"Object '{obj_name}' not found.")
        return

    # clear existing animation on this object
    obj.animation_data_clear()

    # set new keyframes
    obj.location = (0, 0, -1)
    obj.keyframe_insert("location", frame=1)
    obj.location = (0, 0, 0)
    obj.keyframe_insert("location", frame=24)

    # set easing
    action = obj.animation_data.action
    for fc in action.fcurves:
        if fc.data_path == "location":
            for kp in fc.keyframe_points:
                kp.interpolation = 'EASE'
                kp.easing = 'EASE_OUT'

animate_object("LogoMesh")
```
