// Design reminder: The Babylon scene is an unobtrusive 2D frame for Mộc Bản Giang Hồ, keeping the map crisp and centered.

import { Camera } from "@babylonjs/core/Cameras/camera";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import type { Engine } from "@babylonjs/core/Engines/engine";
import { GameWorld } from "./GameWorld";

export type GameHandle = { scene: Scene; dispose: () => void };

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.04, 0.11, 0.08, 1);

  const camera = new FreeCamera("wuxia-camera", new Vector3(0, 0, -10), scene);
  camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
  camera.setTarget(Vector3.Zero());
  camera.orthoLeft = -800;
  camera.orthoRight = 800;
  camera.orthoTop = 450;
  camera.orthoBottom = -450;

  const texture = new DynamicTexture("wuxia-map-texture", { width: 1600, height: 900 }, scene, false, Texture.NEAREST_SAMPLINGMODE);
  texture.hasAlpha = false;
  texture.wrapU = Texture.CLAMP_ADDRESSMODE;
  texture.wrapV = Texture.CLAMP_ADDRESSMODE;

  const material = new StandardMaterial("wuxia-map-material", scene);
  material.disableLighting = true;
  material.diffuseTexture = texture;
  material.emissiveTexture = texture;
  material.backFaceCulling = false;

  const plane = MeshBuilder.CreatePlane("wuxia-map-plane", { width: 1600, height: 900 }, scene);
  plane.material = material;

  const world = new GameWorld(canvas, texture);
  await world.load();

  let lastWidth = 0;
  let lastHeight = 0;
  scene.onBeforeRenderObservable.add(() => {
    const delta = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.05);
    const width = engine.getRenderWidth();
    const height = engine.getRenderHeight();
    if (width !== lastWidth || height !== lastHeight) {
      lastWidth = width;
      lastHeight = height;
      const aspect = width / Math.max(1, height);
      camera.orthoTop = 450;
      camera.orthoBottom = -450;
      camera.orthoLeft = -450 * aspect;
      camera.orthoRight = 450 * aspect;
    }
    world.update(delta);
    world.render();
  });

  return {
    scene,
    dispose() {
      world.dispose();
      plane.dispose();
      material.dispose();
      texture.dispose();
      scene.dispose();
    },
  };
}
