# Structured Nextbot glTF study

This export is the preferred geometry source for the robot hero. It preserves
the Spline object hierarchy and animation pivots, unlike the earlier flattened
OBJ set.

## Files

| File | Bytes | Finding |
|---|---:|---|
| `3f0bc064969c41b4af3e9151468a50b7.gltf` | 3,318,238 | Embedded-buffer glTF |
| `3f0bc064969c41b4af3e9151468a50b7_Textured.gltf` | 3,307,698 | Same content, different whitespace |
| `Thumbnail.jpg` | 13,694 | Rendered reference thumbnail |

The two glTF files become byte-identical after normalized JSON serialization.
Their 372 embedded buffer URIs also hash identically. `_Textured.gltf` is
therefore not a distinct textured deliverable.

## Exact capability

| Feature | Result |
|---|---:|
| Scenes / nodes / maximum depth | 1 / 201 / 11 |
| Meshes / primitives | 80 / 80 |
| Position entries | 50,046 |
| Indices / rendered triangles | 99,746 / 79,816 |
| Unique primitive geometries | 34 |
| Duplicate primitive instances | 46 |
| Unique-geometry triangles | 46,284 |
| UV + tangent primitives | 66 |
| Embedded binary payload | 2,333,576 bytes |
| Materials / textures / images | 0 / 0 / 0 |
| Animations / skins | 0 / 0 |
| Cameras / lights | 0 / 0 |

A clean Blender 5.2 import confirms 201 objects, 80 mesh objects, 121 empties,
49,966 imported vertices, and 79,816 polygons. It creates no model materials,
images, animations, or armature.

## Hierarchy

The hierarchy mirrors the Spline study:

```text
GLTF_SceneRootNode
└─ _0 [scale 0.01]
   └─ Scene 1
      └─ Bot
         ├─ Top part
         │  ├─ Head → Head 2 → mesh
         │  ├─ Neck → Cube/cloner parts, cylinders, groups
         │  ├─ Hand Instance → Hand LEFT → arm → elbow → forearm → Hand
         │  ├─ Hand → Hand LEFT → arm → elbow → forearm → Hand
         │  └─ Body → body mesh and shoulder groups
         └─ Bottom
            ├─ Group 4
            ├─ Leg Left Instance → femur → shin → Foot
            ├─ Leg Left → femur → shin → Foot
            └─ Pelvic
```

Named transform nodes are empties and the actual mesh commonly sits in an
unnamed `_gltfNode_*` child. Animate the named parent, not the mesh child.

## Transform observations

- `_0` applies the Spline-to-glTF scale of `0.01`.
- `Bot` is translated to approximately `[-11.755, -2.323, 1631.73]` before the
  0.01 wrapper. Its world bounds are approximately
  `[-1.429,-2.721,15.877]` to `[1.191,2.756,16.871]`.
- Recenter a wrapper around the loaded model instead of destroying internal
  local transforms.
- Mirrored Spline nodes are decomposed into negative XYZ scale plus a
  quaternion rotation. Bake or normalize these carefully to avoid inverted
  normals and winding.

## Geometry observations

- All 80 primitives use glTF triangle strips.
- The model renders 79,816 non-degenerate triangles.
- Only 34 primitive geometries are unique. Reusing identical geometry can
  reduce the unique triangle payload to 46,284 without changing appearance.
- The largest parts are Body (7,712 triangles), Head2 (5,600), and each terminal
  hand mesh (4,544).
- Sixty-six primitives carry UVs and tangents. Fourteen—including Body, Head2,
  hands, and several cube forms—have only positions and normals.

Head2 needs a Blender UV pass if the Spline face video is to become a standard
Three.js `VideoTexture`.

## What this export does not replace

This file supplies geometry, node names, local transforms, and pivots. It does
not supply the Spline camera, point light, layered materials, images, head
video, cursor look-at behavior, or animation events. Those remain sourced from
`../4-nexux-robot-hero-scene/`.

## Recommended use

1. Load this hierarchy in Blender.
2. Link duplicate mesh data while retaining the named transform parents.
3. Recenter through a new parent object; keep internal pivots.
4. Add missing UVs and reconstruct four material slots from study #4.
5. Add the three Spline images and the head video.
6. Export a compact named-node GLB with Meshopt/Draco and KTX2 textures.
7. Recreate camera, light, look-at, and looping rotations in Three.js.

Machine-readable metrics are in [model-audit.json](./model-audit.json). Re-run
the audit with:

```sh
node ../5-3d-study-env/inspect-gltf.mjs \
  ./3f0bc064969c41b4af3e9151468a50b7_Textured.gltf
```

