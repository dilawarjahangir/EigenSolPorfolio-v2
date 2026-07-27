# Scene specs and migration cost

## Spline scene

| Area | Captured spec | Migration impact |
|---|---|---|
| Frame | Responsive; auto zoom on; background `#E3E3E3`; no screen UI | Low |
| Camera | Perspective, FOV 45, near 70, far 100000, zoom 2; 3 s intro | Low |
| Lighting | One white point light, intensity 5, distance 2000, decay 1; large shadows | Low–medium; shadow map is the main GPU cost |
| Robot | Articulated hierarchy with mirrored hand and leg instances | Medium; preserve pivots and negative-X mirroring |
| Animation | 1 camera transition, 2 cursor look-at behaviors, 5 ping-pong rotations | Low–medium |
| Face | Looping local MP4 video in the `Head` material | Medium; video decode and texture upload |
| Logo | 7 custom paths, each extruded by 2 with bevel 1 | Low after baking to one mesh |
| Materials | 4 layered Spline materials using color, lighting, matcap, rainbow, image, and video layers | Medium; requires visual approximation |
| Effects | Fog off, post effects off, ambient shadows off, physics off | Low |

## Local OBJ source

| Metric | Value |
|---|---:|
| Files | 23 |
| Raw total | 233,138,445 bytes / 222.338 MiB |
| Each file | 10,136,453–10,136,455 bytes / about 9.67 MiB |
| Geometry per file | 50,046 vertices; 50,046 normals; 99,940 triangular faces |
| UVs | 0 |
| Objects/groups | 1 object; 0 groups |
| Material assignments | 0 |
| Bounds | X `-153.113..152.743`; Y `-336.438..347.387`; Z `-49.097..69.160` |
| Gzip test, one OBJ | 2,258,657 bytes / about 2.15 MiB |
| Duplicate result | Geometry payload is byte-identical across all 23 files |

The OBJ is one flattened robot, not an articulated source. Shipping all 23
files would repeat the same roughly 100k-triangle mesh 23 times: 1,151,058
vertices and 2,298,620 triangles before GPU-side duplication.

## Structured glTF source

The later export in `../6-nextbot-3d-model-with-texture/` supersedes the OBJ for
implementation:

| Metric | Value |
|---|---:|
| Nodes / maximum depth | 201 / 11 |
| Mesh primitives | 80 |
| Position entries / Blender vertices | 50,046 / 49,966 |
| Rendered triangles | 79,816 |
| Unique primitive geometries | 34 |
| Triangles after geometry reuse | 46,284 |
| UV + tangent primitives | 66 of 80 |
| Materials / images / animations / skins | 0 / 0 / 0 / 0 |
| Embedded binary payload | 2,333,576 bytes |
| Textured-file size | 3,307,698 bytes |

Despite its filename, `_Textured.gltf` does not contain textures or materials.
It is normalized-JSON-identical to the other glTF; the files differ only in
formatting whitespace.

## Practical assessment

- **Reproduction difficulty:** moderate. Camera and motion are straightforward;
  material layering and preserving robot pivots are the substantive work.
- **Current web readiness:** partial. The structured 3.31 MB glTF is far better
  than the 222 MiB OBJ set, but still needs materials, texture binding,
  recentering, geometry reuse, and GLB compression.
- **Recommended asset target:** one optimized GLB, Draco or Meshopt compressed,
  with KTX2 textures; keep separate named nodes only where animation needs them.
- **Recommended geometry budget:** establish visually in the study environment.
  As a first pass, test 25k–50k triangles for the robot and a baked logo mesh.
- **Runtime budget to measure:** compressed transfer size, decoded geometry
  memory, texture/video memory, first render time, and mobile shadow cost.

No Spline export bundle was downloaded during this study, so the editor page's
own network resources are not used as a payload estimate.
