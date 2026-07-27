# Local OBJ audit

Source directory: `../../3-nextbot-3d-model/`

## Result

Each of the 23 files contains:

- one object;
- 50,046 positions;
- 50,046 normals;
- no UVs;
- 99,940 triangle faces;
- no groups and no `usemtl` assignments.

Each file references its own absent `.mtl`, for example `model_0.mtl`, but no
MTL files exist in the directory.

The files have different SHA-256 hashes only because lines 1–2 contain their
file-specific `mtllib` and `o` names. Hashing from line 3 onward produces the
same value for all files:

```text
18c71c96c3a09f558b4cac62b2452d00f5342a74674be78537c048e91a808bdc
```

This proves that the exported geometry payload is byte-identical. There is no
morph sequence or per-part geometry across the numbered files.

## Canonical source metrics

Using `model_0.obj`:

```text
bytes:     10,136,453
vertices:  50,046
normals:   50,046
faces:     99,940 triangles
bounds X:  -153.113464 .. 152.743408
bounds Y:  -336.437714 .. 347.386871
bounds Z:  -49.097466  .. 69.160034
gzip:      2,258,657 bytes
```

## Consequences

- Keep a single canonical OBJ during study.
- Do not delete the duplicates in this phase; they are source evidence.
- The flattened OBJ cannot reproduce the Spline node animation by itself.
- Articulation must be reconstructed by separating connected parts in Blender,
  rebuilding from Spline primitives, or obtaining a true hierarchical export.
- Because there are no UVs/material bindings, a GLB conversion without an
  asset-cleanup pass will not reproduce the Spline appearance.
