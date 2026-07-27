# Captured geometry primitives

These are the construction values exposed while traversing the robot. They are
most useful if the flattened OBJ is replaced with native Three.js geometry or
reconstructed in Blender. Vectors use `[x, y, z]`; rotations are degrees.

## Shoulder/body groups

- Left shoulder group: position `[-67.84, 234.76, -10.06]`, scale
  `[-1, 1, 1]`, with `Ellipse` and `Rectangle` children.
- Right shoulder group: position `[67.82, 234.79, -10.06]`, scale
  `[1, 1, 1]`, with `Ellipse` and `Rectangle` children.
- Both groups have zero rotation.

## Forearm and hand

| Node | Position | Rotation | Geometry |
|---|---|---|---|
| `Ellipse5` | `[-7.61, 49.66, -19.14]` | `[-43, 88, 23]` | 19×19; ring 0; angle 360; sides 16; extrusion 25; bevel 1 |
| `Rectangle4` | `[-4.10, 42.34, -16.59]` | `[-42.92, 88.25, 23.17]` | 29×41.94; corner 100; extrusion 9; bevel 1 |
| `Ellipse4` | `[3.99, 36.05, -13.97]` | `[69.28, -0.08, 3.64]` | 29.14×29.14; ring 0; angle 360; sides 16; extrusion 26; bevel 1 |
| `Cube3` | `[-0.41, -12.09, 5.11]` | `[79.70, 60.68, -106.22]` | size `[49.77, 114.94, 59.07]`; subdivision 2 |
| `Ellipse6` | `[-22.51, 74.89, -26.10]` | `[-90, 84, -90]` | 47.93×47.93; ring 81; sides 16; extrusion 17.83; bevel 2 |
| `Rectangle2` | `[-34.28, 73.07, -30.77]` | `[0, 0, -173.55]` | 51.54×36.37; corners `[0,25,25,0]`; extrusion 10; bevel 2 |

`Rectangle2` uses Arc roundness. The roundness selector for `Rectangle4` was
not captured confidently and should be checked visually. These primitives use
`Parts`, except `Cube3`, which uses `Body`.

The terminal hand mesh is size `[28.40, 54.07, 17.81]`, subdivision 2, and uses
`Parts`. Its animated transform is recorded in
[interactions.md](./interactions.md).

## Neck

- `Group3`: position `[0, -9.41, -0.65]`, rotation `[24.59, 0, 0]`.
- `Cube`: position `[0, -13.24, -0.35]`, scale `[1.25, 1.25, 1.25]`,
  rotation `[7, 0, 0]`; size `[5,16,8]`; one subdivision; corner 1; material
  `Parts`.
- Cube radial cloner: 12 copies, radius 11, start/end 0/360°, X axis,
  alignment on, per-copy rotation `[0,0,8]`, randomness off.
- `Cylinder3`: position `[0,-34.32,-3.15]`, rotation `[11.78,0,0]`; size
  `[63.39,45.04,63.39]`; top 80; bottom 23; 12 radial sides; one height
  segment; angle 360; caps on; hollow 0.83; corner 3; corner sides 8; `Body`.

## Inspector caveat

Several mesh inspectors displayed a `Hide` control. The scene itself remained
visible, so this note preserves that label rather than converting it directly
to Three.js `visible = false`. Verify the exported visibility flags or compare
against a playback screenshot during implementation.

