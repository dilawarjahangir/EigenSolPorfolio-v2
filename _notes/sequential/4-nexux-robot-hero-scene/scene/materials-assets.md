# Materials, logo, and media

Spline materials are ordered layer stacks. Percentages below are layer
strength/opacity as shown in the inspector.

| Material | Layers, top to bottom |
|---|---|
| `Text` | Lighting 100, Overlay; Color `#FFFFFF` 100, Normal |
| `Head` | Rainbow 50, Overlay; Matcap 60, Screen; Lighting 100, Overlay; Video 100, Normal; Color `#000000` 100, Normal |
| `Parts` | Lighting 50, Normal; Image 0, Normal; Matcap 100, Screen; Rainbow 100, Overlay; Color `#030303` 100, Normal |
| `Body` | Rainbow 20, Screen; Lighting 100, Overlay; Matcap 40, Screen; Image 0, Normal; Color `#4F4F4F` 100, Normal |

Three image assets are present, all named `Untitled Image`. Visual inspection
identifies a 1024×1024 head/reflection image, a 256×256 purple circuit-board
normal map, and a 654×330 monochrome dot mask. Their exact layer mapping was not
exposed by the collapsed material rows. The two explicit Image layers currently
show amount 0, but the assets must still be preserved as source evidence.

See [the image manifest](../assets/spline-images/README.md) for acquisition
status and intended filenames.

## Head video

- File: `Screen Recording 2024-05-08 at 10.55.22.mp4`
- Target: `Head2` through the `Head` material
- Action: play after autoplay/mute
- Volume: 5 in the Spline inspector
- Loop: infinite

For the web implementation, begin muted and inline to satisfy browser autoplay
rules. Dispose the `VideoTexture` and pause the element when the hero unmounts.

## Logo geometry

`logo` is at `[0, 146, -1000]`, scaled uniformly to `0.30`, and uses `Text`.
It contains seven custom paths. Every path has scale 1, rotation 0,
subdivision 12, corner 0, extrusion 2, bevel 1, and bevel sides 1.

| Node | Position | 2D size |
|---|---|---|
| `Shape0` | `[-1919, 250, -0.03]` | `[600, 500]` |
| `Shape1` | `[696, 250, -0.02]` | `[600, 500]` |
| `Shape2` | `[1319, 250, -0.01]` | `[600, 500]` |
| `Shape3` | `[-1165, 250, 0]` | `[500, 100]` |
| `Shape4` | `[-1265, 50, 0.01]` | `[600, 300]` |
| `Shape5` | `[42, 250, 0.02]` | `[600, 500]` |
| `Shape6` | `[-612, 250, 0.03]` | `[600, 500]` |

The tiny Z offsets appear intended to avoid coplanar artifacts. Bake the seven
paths into one optimized logo mesh for production unless independent control is
needed.
