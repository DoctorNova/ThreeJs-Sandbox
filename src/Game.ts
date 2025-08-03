import { MapControls } from 'three/addons/controls/MapControls.js';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';
import { AmbientLight } from 'three/src/lights/AmbientLight.js';
import { Vector3 } from 'three/src/math/Vector3.js';
import type { WebGLRenderer } from 'three/src/renderers/WebGLRenderer.js';
import { Scene } from 'three/src/scenes/Scene.js';
import { Jellyfish } from './Jellyfish';
import { OceanSkybox } from './OceanSkybox';
import { RendererSetup } from './RendererSetup';
import { Swarm } from './Swarm';

export const scene = new Scene();
export const camera = new PerspectiveCamera(75, 1, 0.1, 1000);

function resizeCanvasToDisplaySize(renderer: WebGLRenderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width ||canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // set render target sizes here
  }
}

const emperorAnglefishScale = 0.5;
const emperorAnglefishSwarm = new Swarm("emperorAnglefish", new Vector3(0, 0, 0), new Vector3(0, 1, 0), new Vector3(emperorAnglefishScale, emperorAnglefishScale, emperorAnglefishScale));
emperorAnglefishSwarm.speed = 1;
emperorAnglefishSwarm.Spawn(100, 100);

const jellyfishScale = 0.01;
const jellyfish = new Jellyfish("jellyfish", new Vector3(jellyfishScale, jellyfishScale, jellyfishScale));

const skybox = new OceanSkybox();
let cameraControls: MapControls;
export function Initialize() {
  camera.position.copy(new Vector3(0, 0, 5));
  cameraControls = new MapControls(camera, RendererSetup.GetRenderer().domElement);

  const ambientLight = new AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  scene.add(skybox);
}

export function OnResize(renderer: WebGLRenderer) {
  resizeCanvasToDisplaySize(renderer);
}

export function OnUpdate(frameTime: number) {
  emperorAnglefishSwarm.Update(frameTime);
  cameraControls.update(frameTime);
  jellyfish.Update(frameTime);
}

export function OnShutdown() {
  console.log("shutdown")
}