# Blender Diagnostics

bpy errors, render artifacts, material and lighting problems, MCP failures. Read the error first, then find the pattern.

---

## bpy script errors

### `RuntimeError: Operator bpy.ops.X.Y poll failed`

The operator requires a specific context (active object, mode, area type) that isn't set.

Common cause: calling an Object mode operator while in Edit mode, or calling an operator with no active object.

Fix:
```python
# ensure correct mode
bpy.ops.object.mode_set(mode='OBJECT')

# ensure active object is set
obj = bpy.data.objects["MyObject"]
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
```

---

### `KeyError: 'MyObject'`

`bpy.data.objects["MyObject"]` raises this when the object doesn't exist by that exact name.

Fix: check available objects first:
```python
print([obj.name for obj in bpy.data.objects])
```

Names are case-sensitive and space-sensitive. Blender appends `.001`, `.002` to duplicate names. Ask the user to confirm the exact object name, or run `get_objects_summary` via MCP.

---

### `AttributeError: 'NoneType' object has no attribute 'X'`

A variable that should hold a Blender object is None. Usually: `bpy.data.objects.get("Name")` returned None because the object doesn't exist.

Fix: use `.get()` instead of `["name"]` and check for None:
```python
obj = bpy.data.objects.get("LogoMesh")
if obj is None:
    print("Object 'LogoMesh' not found.")
else:
    # proceed
```

---

### `TypeError: 'bpy_prop_array' object does not support item assignment`

Trying to set a single component of a vector property directly.

```python
# wrong
obj.location[0] = 5.0

# correct
loc = list(obj.location)
loc[0] = 5.0
obj.location = loc
# or just:
obj.location.x = 5.0
```

---

### Material changes are not visible

Most common cause: `mat.use_nodes = False`. The node tree exists but is bypassed.

Fix:
```python
mat.use_nodes = True
```

Second cause: the node tree is set up correctly but the Surface output is not connected to the Material Output node. Check:
```python
output_node = mat.node_tree.nodes.get("Material Output")
if output_node:
    print("Surface link:", output_node.inputs['Surface'].links)
```

---

### `node.inputs['Roughness']` does nothing

Two possible causes:
1. The node is the wrong type (not Principled BSDF).
2. The material is not using nodes.

Fix: confirm the node type and that `use_nodes` is True:
```python
for node in mat.node_tree.nodes:
    print(node.name, node.type)
```

---

## Render artifacts

### Dark patches / fireflies (bright white specks)

Cycles noise from insufficient samples or difficult lighting (caustics, highly reflective surfaces in tight spaces).

Fix:
- Raise samples: 256 → 512.
- Enable OIDN denoising: `scene.cycles.use_denoising = True`, `scene.cycles.denoiser = 'OPENIMAGEDENOISE'`.
- Reduce light energy in the problem area (fireflies come from overexposed indirect light paths).
- Avoid very small light sources combined with very reflective surfaces.

---

### Object renders black / completely dark surface

Causes in order of likelihood:
1. Normals are inverted. Faces point inward; the renderer sees no light.
   Fix in Edit mode: Mesh > Normals > Flip, or add a Solidify modifier.
2. Material is missing or has no Surface output connection.
3. Object is behind a light blocker (another object casting shadow over it entirely).
4. Material is Emission with Strength = 0.

Diagnostic:
```python
obj = bpy.data.objects["ProblemObject"]
print("Material:", obj.data.materials[:] if obj.data.materials else "None")
```

---

### Render shows wrong objects / missing objects

The most common cause: `hide_render = True` on an object the user expects to see, or an object is not in the render-visible collection.

Run the pre-render audit from `blender-motion/references/render-and-color.md`. It lists every object and its `hide_render` state.

Fix:
```python
for obj in bpy.context.scene.objects:
    if obj.name == "ProblemObject":
        obj.hide_render = False
```

---

### EEVEE render looks nothing like Cycles result

Expected. EEVEE is an approximation. Key differences:
- Volume shaders (fog, frosted glass) look significantly different.
- Subsurface scattering is approximate in EEVEE.
- Screen-space reflections in EEVEE miss off-screen geometry.

Tell the user: "EEVEE previews are directional, not final. For volume materials and SSS, the Cycles result will differ. The directional feedback (composition, framing, rough material quality) is still valid."

---

### Render output is too dark or blown out

Too dark: lights are underpowered, or AgX is applying strong tone compression.
Fix: raise light energy. Check `scene.view_settings.exposure` (should be 0.0 for a neutral start).

Blown out: lights are too powerful, or color management is set to `'Standard'` (no tone mapping).
Fix: lower light energy. Set `scene.view_settings.view_transform = 'AgX'`.

---

### Color looks wrong (hue shift on glossy surfaces)

Cause: color management set to `'Filmic'` or `'Standard'`. AgX handles hue better.

Fix:
```python
bpy.context.scene.view_settings.view_transform = 'AgX'
bpy.context.scene.view_settings.look = 'AgX - Medium High Contrast'
```

---

## MCP failures

### MCP not responding / connection refused

The Blender MCP server is not running.

Tell the user:
1. Check that Blender is open.
2. Edit > Preferences > Add-ons > Blender MCP > confirm it's enabled.
3. Click "Start MCP Server" in the add-on preferences.
4. Confirm the status line shows "MCP Server running on localhost:9876".

If the port is blocked: another process is using 9876. The user can change the port in the add-on preferences and update the MCP config to match.

---

### MCP command runs but Blender is unresponsive

Blender is likely in the middle of a long operation (rendering, simulating physics, loading a heavy file).

Wait for the current operation to complete before sending MCP commands. Do not send multiple commands in parallel when Blender is busy.

---

### `execute_blender_code` returns success but scene unchanged

The code ran but modified the wrong object, or the viewport hasn't refreshed.

Force a viewport update:
```python
bpy.context.view_layer.update()
```

If the object was modified in a data-direct way (not via operators), trigger a redraw:
```python
for area in bpy.context.screen.areas:
    area.tag_redraw()
```

---

### Object positions look correct in bpy but wrong in render

The dependency graph is stale. Computed properties (world matrix, modifier results) are not updated until the depsgraph is evaluated.

Fix:
```python
depsgraph = bpy.context.evaluated_depsgraph_get()
obj_eval = obj.evaluated_get(depsgraph)
print(obj_eval.matrix_world)
```

If the render is the issue (not the viewport), force an update before rendering:
```python
bpy.context.view_layer.update()
```
