# Geometry Nodes for Motion

Procedural animation patterns using Geometry Nodes. Load when the brief calls for loops, distributions, reveals, or patterns that would be impractical to keyframe manually.

---

## When to use Geometry Nodes vs keyframes

| Use Geometry Nodes | Use keyframes |
|---|---|
| Looping / repeating patterns | One-off motion with a specific arc |
| Distributing instances across a surface | Animating individual named objects |
| Text reveals that depend on geometry | Text animation that AE handles better |
| Procedural loops and reveals that update with the mesh | Static topology that just needs to move |
| "The pattern should change if the mesh changes" | The mesh is fixed and won't change |

---

## Setting up a Geometry Nodes modifier

```python
import bpy

def add_geonodes_modifier(obj, modifier_name):
    mod = obj.modifiers.new(name=modifier_name, type='NODES')
    node_group = bpy.data.node_groups.new(name=modifier_name, type='GeometryNodeTree')
    mod.node_group = node_group

    # every geo nodes tree needs input and output
    nodes = node_group.nodes
    links = node_group.links

    group_input  = nodes.new('NodeGroupInput')
    group_output = nodes.new('NodeGroupOutputNode' if bpy.app.version >= (4,0,0) else 'NodeGroupOutput')

    # connect geometry pass-through
    node_group.interface.new_socket('Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
    node_group.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
    links.new(group_input.outputs['Geometry'], group_output.inputs['Geometry'])

    return mod, node_group
```

Note: Geometry Nodes API changed significantly in Blender 4.0+ (interface sockets vs. inputs/outputs). Verify Blender version before scripting. The MCP server's Blender version determines what API is available.

---

## Pattern: looping position offset with a wave

Drives each instance or vertex along a sine wave, creating a cascading loop.

Core node graph (describe to Claude as a setup brief):
1. **Group Input** (Geometry)
2. **Position** node (reads each vertex position)
3. **Separate XYZ** (get individual axes)
4. **Math: Add** (X + scene time * speed)
5. **Math: Sine** (sine of the result)
6. **Math: Multiply** (sine * amplitude)
7. **Combine XYZ** (reassemble with modified Z)
8. **Set Position** (apply to geometry)
9. **Group Output** (Geometry)

Via bpy (simplified):
```python
# In Geometry Nodes, add a Scene Time node and use Frame/Second to drive offsets
# This is easier to set up in the UI and then animate the modifier's input parameters
# via keyframes on the modifier

mod = obj.modifiers["GeoNodes"]
# expose an input for "wave_speed" as a Float input on the group
# then keyframe: mod["Input_3"] = 0.5  (input name depends on socket index)
```

---

## Pattern: instancing on a grid with staggered reveal

Distribute instances across a grid, reveal them with a staggered offset based on position.

Key nodes:
- **Mesh Primitive: Grid** or existing mesh as base
- **Distribute Points on Faces** (density-based or set count)
- **Instance on Points** (places your object at each point)
- **Index** (each instance has a unique index)
- **Math** (use index to compute an offset time per instance)
- **Switch** or **Compare** (gate visibility based on index + time)

The pattern: `visible = frame > (instance_index * stagger_frames)`. As the frame increases, each successive instance becomes visible. For a 24fps stagger at 2 frames per instance, a 100-instance grid reveals over ~50 frames.

---

## Pattern: geometry reveal by position (linear wipe)

Reveal geometry progressively by masking vertices that are "below" a threshold that animates over time.

Key nodes:
- **Position** (get vertex position)
- **Separate XYZ** (get Z)
- **Math: Greater Than** (Z > threshold)
- **Delete Geometry** (delete faces where result = 0)
- OR: **Set Material** (switch material based on the mask — keeps geometry, changes appearance)

Animate the `threshold` value (exposed as a modifier input, keyframed) from the minimum Z of the mesh to the maximum Z over the desired reveal duration.

---

## Modifier inputs as keyframeable properties

Exposed inputs on a Geometry Nodes modifier can be keyframed like any other property.

```python
# access modifier input by name (after exposing it in the node group interface)
mod = obj.modifiers["GeoReveal"]
mod["Socket_2"] = 0.0           # input socket value
obj.keyframe_insert(f'modifiers["GeoReveal"]["Socket_2"]', frame=1)

mod["Socket_2"] = 1.0
obj.keyframe_insert(f'modifiers["GeoReveal"]["Socket_2"]', frame=48)
```

The socket name (`"Socket_2"`) depends on how the group interface is set up. In Blender 4.x, use `mod.id_properties_ensure()` and the socket's identifier string.

---

## Limits

- Geometry Nodes trees can become complex fast. Keep the graph focused on one effect per modifier; stack multiple modifiers for layered effects.
- Scripting complex geo nodes trees via bpy is verbose and error-prone. For anything beyond simple setups, describe the node network in plain English and have the user build it in the UI. Then expose inputs and keyframe them via bpy.
- Geometry Nodes does not replace the compositor for post-process effects (bloom, color grading, lens distortion). Use the Compositor for those.
