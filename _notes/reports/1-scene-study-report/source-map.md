# Source map and chronology

## Sequential #3: first model export

Directory: `../../sequential/3-nextbot-3d-model/`

- Contains `model_0.obj` through `model_22.obj`.
- Every file has the same geometry payload after its two naming lines.
- Each file has 50,046 vertices, 50,046 normals, no UVs, and 99,940 triangle
  faces.
- No MTL files or material assignments are present.
- This source is useful only as historical/reference evidence.

## Sequential #4: Spline scene study

Directory: `../../sequential/4-nexux-robot-hero-scene/`

This is the authority for:

- scene graph and Spline node names;
- transforms and primitive construction;
- camera and point-light settings;
- four layered material definitions;
- seven-part logo;
- head video behavior;
- camera intro;
- cursor look-at behavior;
- looping hand/arm animation states;
- the three Spline image assets.

The machine-oriented scene spec is
`../../sequential/4-nexux-robot-hero-scene/threejs/scene-spec.json`.

## Sequential #5: study tooling

Directory: `../../sequential/5-3d-study-env/`

`inspect-gltf.mjs` decodes embedded glTF accessors, counts non-degenerate
triangle-strip faces, computes world bounds, identifies identical geometry, and
reports the largest primitives.

## Sequential #6: structured model export

Directory: `../../sequential/6-nextbot-3d-model-with-texture/`

This is the authority for geometry, local transforms, and pivots. Both glTF
files contain the same model. Use `_Textured.gltf` only as the stable preferred
filename; do not infer that it contains texture resources.

## Facts versus reconstruction choices

Facts are inspector values, file metrics, hashes, and Blender import results.
Choices such as triangle budgets, shadow-map size, material shader strategy,
and exact easing implementation are migration recommendations and must be
validated visually.

