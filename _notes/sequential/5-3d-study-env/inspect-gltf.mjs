#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node inspect-gltf.mjs <model.gltf>");
  process.exitCode = 1;
} else {
  const gltf = JSON.parse(await readFile(input, "utf8"));
  const buffers = gltf.buffers.map((buffer) => {
    const comma = buffer.uri.indexOf(",");
    if (!buffer.uri.startsWith("data:") || comma < 0) {
      throw new Error("Only embedded data-URI buffers are supported");
    }
    return Buffer.from(buffer.uri.slice(comma + 1), "base64");
  });

  const component = {
    5120: { bytes: 1, getter: "getInt8" },
    5121: { bytes: 1, getter: "getUint8" },
    5122: { bytes: 2, getter: "getInt16" },
    5123: { bytes: 2, getter: "getUint16" },
    5125: { bytes: 4, getter: "getUint32" },
    5126: { bytes: 4, getter: "getFloat32" }
  };
  const width = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };

  function accessorValues(index) {
    const accessor = gltf.accessors[index];
    const view = gltf.bufferViews[accessor.bufferView];
    const format = component[accessor.componentType];
    const components = width[accessor.type];
    const stride = view.byteStride ?? format.bytes * components;
    const start = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    const bytes = buffers[view.buffer];
    const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const values = [];
    for (let element = 0; element < accessor.count; element += 1) {
      for (let part = 0; part < components; part += 1) {
        values.push(
          data[format.getter](
            start + element * stride + part * format.bytes,
            true
          )
        );
      }
    }
    return values;
  }

  function primitiveTriangles(primitive) {
    const indices = accessorValues(primitive.indices);
    const mode = primitive.mode ?? 4;
    if (mode === 4) return Math.floor(indices.length / 3);
    if (mode !== 5) return null;
    let triangles = 0;
    for (let index = 2; index < indices.length; index += 1) {
      const a = indices[index - 2];
      const b = indices[index - 1];
      const c = indices[index];
      if (a !== b && b !== c && a !== c) triangles += 1;
    }
    return triangles;
  }

  function accessorBytes(index) {
    const accessor = gltf.accessors[index];
    const view = gltf.bufferViews[accessor.bufferView];
    const format = component[accessor.componentType];
    const components = width[accessor.type];
    const packed = format.bytes * components;
    const stride = view.byteStride ?? packed;
    const start = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    const source = buffers[view.buffer];
    if (stride === packed) {
      return source.subarray(start, start + accessor.count * packed);
    }
    const result = Buffer.alloc(accessor.count * packed);
    for (let index = 0; index < accessor.count; index += 1) {
      source.copy(result, index * packed, start + index * stride, start + index * stride + packed);
    }
    return result;
  }

  function primitiveHash(primitive) {
    const hash = createHash("sha256");
    for (const semantic of Object.keys(primitive.attributes).sort()) {
      hash.update(semantic);
      hash.update(accessorBytes(primitive.attributes[semantic]));
    }
    hash.update("indices");
    hash.update(accessorBytes(primitive.indices));
    return hash.digest("hex");
  }

  function multiply(a, b) {
    const out = Array(16).fill(0);
    for (let column = 0; column < 4; column += 1) {
      for (let row = 0; row < 4; row += 1) {
        for (let part = 0; part < 4; part += 1) {
          out[column * 4 + row] += a[part * 4 + row] * b[column * 4 + part];
        }
      }
    }
    return out;
  }

  function trs(node) {
    if (node.matrix) return node.matrix;
    const [x, y, z, w] = node.rotation ?? [0, 0, 0, 1];
    const [sx, sy, sz] = node.scale ?? [1, 1, 1];
    const [tx, ty, tz] = node.translation ?? [0, 0, 0];
    const xx = x * x, yy = y * y, zz = z * z;
    const xy = x * y, xz = x * z, yz = y * z;
    const wx = w * x, wy = w * y, wz = w * z;
    return [
      (1 - 2 * (yy + zz)) * sx, (2 * (xy + wz)) * sx, (2 * (xz - wy)) * sx, 0,
      (2 * (xy - wz)) * sy, (1 - 2 * (xx + zz)) * sy, (2 * (yz + wx)) * sy, 0,
      (2 * (xz + wy)) * sz, (2 * (yz - wx)) * sz, (1 - 2 * (xx + yy)) * sz, 0,
      tx, ty, tz, 1
    ];
  }

  function transformPoint(matrix, point) {
    const [x, y, z] = point;
    return [
      matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
      matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
      matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
    ];
  }

  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const worldBounds = {
    min: [Infinity, Infinity, Infinity],
    max: [-Infinity, -Infinity, -Infinity]
  };
  const depths = [];

  function visit(nodeIndex, parentMatrix, depth) {
    const node = gltf.nodes[nodeIndex];
    const world = multiply(parentMatrix, trs(node));
    depths[nodeIndex] = depth;
    if (node.mesh !== undefined) {
      for (const primitive of gltf.meshes[node.mesh].primitives) {
        const accessor = gltf.accessors[primitive.attributes.POSITION];
        const min = accessor.min;
        const max = accessor.max;
        for (const x of [min[0], max[0]]) {
          for (const y of [min[1], max[1]]) {
            for (const z of [min[2], max[2]]) {
              const point = transformPoint(world, [x, y, z]);
              for (let axis = 0; axis < 3; axis += 1) {
                worldBounds.min[axis] = Math.min(worldBounds.min[axis], point[axis]);
                worldBounds.max[axis] = Math.max(worldBounds.max[axis], point[axis]);
              }
            }
          }
        }
      }
    }
    for (const child of node.children ?? []) visit(child, world, depth + 1);
  }

  for (const root of gltf.scenes[gltf.scene ?? 0].nodes) visit(root, identity, 0);

  const parentByNode = [];
  gltf.nodes.forEach((node, nodeIndex) => {
    for (const child of node.children ?? []) parentByNode[child] = nodeIndex;
  });
  const meshOwner = new Map();
  gltf.nodes.forEach((node, nodeIndex) => {
    if (node.mesh !== undefined) {
      const parentIndex = parentByNode[nodeIndex];
      meshOwner.set(node.mesh, {
        nodeIndex,
        nodeName: node.name ?? null,
        parentIndex: parentIndex ?? null,
        parentName: parentIndex === undefined ? null : gltf.nodes[parentIndex].name ?? null
      });
    }
  });
  const primitiveRecords = gltf.meshes.flatMap((mesh, meshIndex) =>
    mesh.primitives.map((primitive, primitiveIndex) => ({
      meshIndex,
      primitiveIndex,
      ...meshOwner.get(meshIndex),
      vertices: gltf.accessors[primitive.attributes.POSITION].count,
      indices: gltf.accessors[primitive.indices].count,
      triangles: primitiveTriangles(primitive),
      attributes: Object.keys(primitive.attributes).sort(),
      mode: primitive.mode ?? 4,
      hash: primitiveHash(primitive)
    }))
  );
  const groups = new Map();
  for (const record of primitiveRecords) {
    const group = groups.get(record.hash) ?? [];
    group.push(record.meshIndex);
    groups.set(record.hash, group);
  }
  const duplicateGeometryGroups = [...groups.entries()]
    .filter(([, meshes]) => meshes.length > 1)
    .map(([hash, meshes]) => ({ hash, meshes }));
  const representativeByHash = new Map();
  for (const record of primitiveRecords) {
    if (!representativeByHash.has(record.hash)) {
      representativeByHash.set(record.hash, record);
    }
  }

  const report = {
    file: basename(input),
    bytes: (await readFile(input)).byteLength,
    asset: gltf.asset,
    counts: {
      scenes: gltf.scenes.length,
      nodes: gltf.nodes.length,
      meshes: gltf.meshes.length,
      primitives: primitiveRecords.length,
      materials: gltf.materials?.length ?? 0,
      textures: gltf.textures?.length ?? 0,
      images: gltf.images?.length ?? 0,
      samplers: gltf.samplers?.length ?? 0,
      animations: gltf.animations?.length ?? 0,
      skins: gltf.skins?.length ?? 0,
      cameras: gltf.cameras?.length ?? 0,
      embeddedBuffers: gltf.buffers.length,
      embeddedBufferBytes: gltf.buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0),
      vertices: primitiveRecords.reduce((sum, item) => sum + item.vertices, 0),
      indices: primitiveRecords.reduce((sum, item) => sum + item.indices, 0),
      triangles: primitiveRecords.reduce((sum, item) => sum + item.triangles, 0),
      uniquePrimitiveGeometries: representativeByHash.size,
      duplicatePrimitiveInstances: primitiveRecords.length - representativeByHash.size,
      uniqueGeometryVertices: [...representativeByHash.values()].reduce(
        (sum, item) => sum + item.vertices,
        0
      ),
      uniqueGeometryTriangles: [...representativeByHash.values()].reduce(
        (sum, item) => sum + item.triangles,
        0
      )
    },
    primitiveModes: [...new Set(primitiveRecords.map((record) => record.mode))],
    uvMappedPrimitives: primitiveRecords.filter((record) => record.attributes.includes("TEXCOORD_0")).length,
    tangentPrimitives: primitiveRecords.filter((record) => record.attributes.includes("TANGENT")).length,
    largestPrimitives: [...primitiveRecords]
      .sort((a, b) => b.triangles - a.triangles)
      .slice(0, 15),
    maximumNodeDepth: Math.max(...depths),
    worldBounds,
    worldSize: worldBounds.max.map((value, axis) => value - worldBounds.min[axis]),
    duplicateGeometryGroups,
    extensionsUsed: gltf.extensionsUsed ?? [],
    extensionsRequired: gltf.extensionsRequired ?? []
  };

  console.log(JSON.stringify(report, null, 2));
}
