# Scene hierarchy

```text
Scene 1
├─ Camera 2 [event]
├─ Point Light
├─ logo
│  ├─ Shape 0 … Shape 6
└─ Bot
   ├─ Top part [event]
   │  ├─ Head [event]
   │  │  └─ Head2 [event/video]
   │  ├─ Neck
   │  │  ├─ Cube [radial cloner]
   │  │  ├─ Cylinder3
   │  │  ├─ Group3
   │  │  │  ├─ Group2
   │  │  │  └─ Group
   │  │  └─ Cylinder
   │  ├─ Hand Instance [mirrored]
   │  ├─ Hand [component]
   │  │  └─ Hand LEFT [event]
   │  │     ├─ arm [event]
   │  │     │  ├─ elbow [event]
   │  │     │  │  ├─ Group
   │  │     │  │  └─ forearm [event]
   │  │     │  │     ├─ Hand [event/mesh]
   │  │     │  │     ├─ Ellipse5
   │  │     │  │     ├─ Rectangle4
   │  │     │  │     ├─ Ellipse4
   │  │     │  │     └─ Cube3
   │  │     │  └─ Cube2
   │  │     ├─ Ellipse6
   │  │     ├─ Ellipse2
   │  │     └─ Rectangle2
   │  └─ Body
   │     ├─ Group → Ellipse, Rectangle
   │     └─ Group → Ellipse, Rectangle
   └─ Bottom
      ├─ Group4 → Group2, Group
      ├─ Leg Left Instance [mirrored]
      ├─ Leg Left [component]
      │  ├─ femur
      │  │  ├─ Cube3
      │  │  ├─ Rectangle9
      │  │  ├─ Rectangle10
      │  │  └─ shin
      │  │     ├─ Foot → Cube5
      │  │     ├─ Ellipse5
      │  │     ├─ Cube4
      │  │     ├─ Ellipse4
      │  │     ├─ Rectangle12
      │  │     └─ Rectangle11
      │  ├─ Ellipse3
      │  ├─ Ellipse2
      │  ├─ Rectangle8
      │  └─ Rectangle7
      └─ Pelvic → Group2, Group, Rectangle4, Group3, Rectangle
```

## Major transforms

All vectors are `[x, y, z]`; rotations are degrees.

| Node | Position | Scale | Rotation |
|---|---|---|---|
| `logo` | `[0, 146, -1000]` | `[0.30, 0.30, 0.30]` | `[0, 0, 0]` |
| `Bot` | `[-2.75, 25.68, 0]` | `[0.8, 0.8, 0.8]` | `[0, 0, 0]` |
| `Top part` | `[-0.18, 58.95, 2.04]` | `[1, 1, 1]` | `[0, 0, 0]` |
| `Bottom` | `[1.37, 24.24, 4.71]` | `[1, 1, 1]` | `[0, 0, 0]` |
| `Head` | `[0.94, 100.62, 2.67]` | `[1, 1, 1]` | `[0, 0, 0]` |
| `Neck` | `[0.94, 106.84, -10.70]` | `[1, 1, 1]` | `[0, 0, 0]` |
| `Hand` | `[112.74, 26.23, 1.71]` | `[1, 1, 1]` | `[0, 0, 0]` |
| `Hand Instance` | `[-112.74, 26.23, 1.71]` | `[-1, 1, 1]` | `[0, 0, 0]` |
| `Body` | `[0.94, -194.79, -5.25]` | `[1, 1, 1]` | `[0, 0, 0]` |
| `Leg Left` | `[49.10, 152.35, 6.96]` | `[1, 1, 1]` | `[7.31, 17.50, 0]` |
| `Leg Left Instance` | `[-49.10, 152.35, 6.96]` | `[-1, 1, 1]` | `[7.31, -18.98, 0]` |
| `Pelvic` | `[-1.37, 163.07, -17.60]` | `[1, 1, 1]` | `[0, 0, 0]` |
| `femur` | `[2.57, -66.67, 0.63]` | `[1, 1, 1]` | `[0, 0, 0]` |
| `shin` | `[-2.57, -64.53, -2.91]` | `[1, 1, 1]` | `[-8.13, 0, 0]` |
| `Foot` | `[0, -160.39, -18.69]` | `[1, 1, 1]` | `[0, 0, 0]` |

## Useful geometry details

- `Body`: size `[151.37, 191.97, 118.96]`, subdivision 2, `Body` + `Parts`.
- `Head2`: position `[0, -10.96, 4]`, size `[82.77, 106.99, 95.16]`,
  subdivision 2, `Head`.
- Neck `Cube`: position `[0, -13.24, -0.35]`, scale `1.25`, rotation
  `[7, 0, 0]`, size `[5, 16, 8]`, corner 1. Its radial cloner has count 12,
  radius 11, 0–360°, X axis, alignment on, and per-copy Z rotation 8°.
- `Cylinder3`: position `[0, -34.32, -3.15]`, rotation `[11.78, 0, 0]`,
  size `[63.39, 45.04, 63.39]`, top 80, bottom 23, 12 radial sides,
  one height segment, caps on, hollow 0.83, corner 3.

