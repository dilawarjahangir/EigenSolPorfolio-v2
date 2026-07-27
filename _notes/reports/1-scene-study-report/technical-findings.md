# Technical findings

## Scene baseline

| Item | Spline value |
|---|---|
| Background | `#E3E3E3` |
| Camera | Perspective; FOV 45; near 70; far 100000; zoom 2 |
| Camera intro | Base `[0,248.98,360]` → State `[0,146.98,1000]`; 3 s custom Bézier |
| Light | White point light at `[-595,579,-393]`; intensity 5; distance 2000; decay 1 |
| Shadows | Enabled, Large light resolution; scene quality Low |
| Look-at | Top part and Head track cursor on camera-aligned planes |
| Looping motion | Hand LEFT, arm, elbow, forearm, terminal hand |
| Logo | Seven custom paths; extrusion 2; bevel 1; white layered material |
| Face | Looping MP4 video layer on Head2 |

No physics, fog, post effects, ambient light, or ambient shadows are needed.

## Structured glTF

| Metric | Value |
|---|---:|
| File size | 3,307,698 bytes |
| Nodes / depth | 201 / 11 |
| Mesh primitives | 80 |
| Rendered triangles | 79,816 |
| Unique geometries | 34 |
| Unique-geometry triangles | 46,284 |
| UV/tangent primitives | 66 |
| Materials / images | 0 / 0 |
| Animations / skins | 0 / 0 |
| Cameras / lights | 0 / 0 |

The 80 primitives contain 46 duplicated instances. Geometry reuse is therefore
a high-value lossless optimization before any decimation.

Largest mesh costs:

- Body: 7,712 triangles
- Head2: 5,600
- Each terminal hand: 4,544
- Each upper-leg Cube3: 2,048
- Several leg/pelvis rectangles: about 1,956 each

## Hierarchy compatibility

The glTF keeps Spline names such as `Top part`, `Head`, `Neck`, `Hand LEFT`,
`arm`, `elbow`, `forearm`, `Bottom`, `Leg Left`, `femur`, `shin`, `Foot`, and
`Pelvic`. Meshes usually live one level below those nodes in `_gltfNode_*`
children. This is exactly what the procedural Three.js animation needs:
transforms should target the named parents.

The export has no bones or animation clips. That is acceptable because the
Spline scene animates rigid parent rotations rather than deforming skin.

## Materials and media

Spline has `Text`, `Head`, `Parts`, and `Body` layered materials. Their rainbow,
matcap, lighting, image, and video blends are not present in glTF and do not map
one-to-one to standard PBR.

The three image assets are:

1. 1024×1024 black head/reflection image with white side arcs
2. 256×256 purple circuit-board normal map
3. 654×330 monochrome dot mask

Fourteen primitives lack UVs, including Head2, Body, terminal hands, and some
cube forms. Head2 needs UV generation before a conventional `VideoTexture` can
match the Spline face.

## Transform risks

- A root `_0` applies scale 0.01.
- The model is offset about 16 units along world Z.
- Mirrored hand and leg transforms decompose to negative XYZ scale plus
  quaternion rotation.
- Recenter with an added parent group; do not zero internal pivots.
- Validate normals, winding, shadows, and tangent handedness after mirror
  cleanup.

