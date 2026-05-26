# Drivers

One property controlling another. Load when a property should change in response to another property or a custom variable, not just time.

---

## When to use drivers vs keyframes

| Use drivers | Use keyframes |
|---|---|
| One property should mirror or transform another | The animation is time-based and static |
| A slider (custom property) should control multiple things | The motion is authored once and doesn't need to respond to input |
| A shape key amount should follow a bone rotation | The values are known in advance |
| You want procedural control without re-keyframing | Direct control is preferable |

---

## bpy: add a driver

The pattern: get the property you want to drive, add a driver, configure its expression and variables.

```python
import bpy

def add_driver(target_obj, data_path, array_index, expression, variables):
    """
    target_obj: the object whose property will be driven
    data_path: e.g. "location", "scale", or node input data path
    array_index: -1 for non-array properties, 0/1/2 for x/y/z
    expression: Python expression string using variable names
    variables: list of dicts describing each variable
    """
    # add a driver to the property
    if array_index >= 0:
        target_obj.driver_add(data_path, array_index)
    else:
        target_obj.driver_add(data_path)

    # get the FCurve driver that was just added
    if array_index >= 0:
        fc = target_obj.animation_data.drivers.find(data_path, index=array_index)
    else:
        fc = target_obj.animation_data.drivers.find(data_path)

    driver = fc.driver
    driver.type = 'SCRIPTED'
    driver.expression = expression

    for var_def in variables:
        var = driver.variables.new()
        var.name = var_def["name"]
        var.type = var_def.get("type", "SINGLE_PROP")

        target = var.targets[0]
        target.id = var_def["id"]
        target.data_path = var_def["data_path"]

    return driver
```

---

## Common pattern 1: one object's Z location drives another's opacity

```python
import bpy

# Object A's Z location drives Object B's opacity
# When A is at Z=0, B is fully visible (100). When A is at Z=-1, B is invisible (0).

source_obj = bpy.data.objects["ObjectA"]
target_obj = bpy.data.objects["ObjectB"]

add_driver(
    target_obj=target_obj,
    data_path='["opacity"]',  # if using a custom property; otherwise use hide_render driver
    array_index=-1,
    expression="max(0.0, min(1.0, source_z + 1.0))",  # remap -1..0 to 0..1
    variables=[{
        "name": "source_z",
        "id": source_obj,
        "data_path": "location[2]"
    }]
)
```

---

## Common pattern 2: custom property as a slider

A custom property (Float, 0–1) on a control object drives multiple properties.

```python
import bpy

ctrl = bpy.data.objects["Controller"]

# add a custom float property to the controller
ctrl["reveal"] = 0.0
ctrl.id_properties_ensure()
ctrl.id_properties_ui("reveal").update(min=0.0, max=1.0, soft_min=0.0, soft_max=1.0)

# drive an object's scale from the slider
logo = bpy.data.objects["LogoMesh"]

add_driver(
    target_obj=logo,
    data_path="scale",
    array_index=0,  # X scale
    expression="reveal",
    variables=[{
        "name": "reveal",
        "id": ctrl,
        "data_path": '["reveal"]'
    }]
)
# repeat for array_index 1 (Y) and 2 (Z) to scale uniformly
```

Keyframing the `ctrl["reveal"]` property now drives the logo's scale via the driver. This is cleaner than keyframing scale directly when multiple objects share the same reveal timing.

---

## Common pattern 3: material property driven by object transform

Drive a material's Roughness based on the object's Z position (e.g., reveals material quality as it rises into frame).

```python
import bpy

obj = bpy.data.objects["LogoMesh"]
mat = bpy.data.materials["LogoMaterial"]
node = mat.node_tree.nodes["Principled BSDF"]

# drive roughness from the object's Z location
roughness_input = node.inputs["Roughness"]
roughness_input.driver_add("default_value")

fc = roughness_input.id_data.animation_data.drivers[-1]
driver = fc.driver
driver.type = 'SCRIPTED'
driver.expression = "max(0.05, 0.5 - obj_z * 0.45)"  # rough at z=0, smooth at z=1

var = driver.variables.new()
var.name = "obj_z"
var.type = 'SINGLE_PROP'
var.targets[0].id = obj
var.targets[0].data_path = "location[2]"
```

---

## Debugging drivers

If a driver turns red in the UI, it has an error:
- Check the expression syntax.
- Check that all variable data paths are valid and the referenced objects exist.
- In Blender 4.x, `bpy.app.driver_namespace` can hold custom Python functions callable from driver expressions.

```python
# test a driver expression in the Python console
import bpy
# print current driver value
obj = bpy.data.objects["LogoMesh"]
for driver_fc in obj.animation_data.drivers:
    print(driver_fc.data_path, driver_fc.driver.expression)
```
