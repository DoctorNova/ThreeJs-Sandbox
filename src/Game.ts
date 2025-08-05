import {
  AmbientLight,
  DirectionalLight,
  MathUtils,
  Scene,
  Vector3,
  type WebGLRenderer,
} from 'three';
import { Jellyfish } from './Jellyfish';
import { OceanSkybox } from './OceanSkybox';
import { Player } from './Player/Player';
import { RendererSetup } from './RendererSetup';
import { Swarm } from './Swarm';

export const scene = new Scene();

let player: Player;

function resizeCanvasToDisplaySize(renderer: WebGLRenderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width ||canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    if (player) {
      player.camera.aspect = width / height;
      player.camera.updateProjectionMatrix();
    }

    // set render target sizes here
  }
}

const emperorAnglefishScale = 1;
const emperorAnglefishSwarm = new Swarm("fusilier", new Vector3(0, 0, 0), new Vector3(0, 1, 0), new Vector3(emperorAnglefishScale, emperorAnglefishScale, emperorAnglefishScale));
emperorAnglefishSwarm.speed = 0.5;
emperorAnglefishSwarm.Spawn(100, 100);

const jellyfishScale = 0.001;
const jellyfish = new Jellyfish("jellyfish", new Vector3(jellyfishScale, jellyfishScale, jellyfishScale));

const skybox = new OceanSkybox();

export const deepSeeDepth = 10;

export let directionalLight: DirectionalLight;
let ambientLight: AmbientLight;

export function Initialize() {
  player = new Player(scene, RendererSetup.GetRenderer().domElement);
  player.camera.translateZ(5);

  ambientLight = new AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  scene.add(skybox);

  directionalLight = new DirectionalLight()
  scene.add(directionalLight);
}

export function OnResize(renderer: WebGLRenderer) {
  resizeCanvasToDisplaySize(renderer);
}

export function OnUpdate(frameTime: number) {
  emperorAnglefishSwarm.Update(frameTime);
  player.Update(frameTime);
  jellyfish.Update(frameTime);

  const cameraPosition = new Vector3();
  player.camera.getWorldPosition(cameraPosition);

  ambientLight.intensity = cameraPosition.y < 0 ? MathUtils.clamp(1 + cameraPosition.y / deepSeeDepth, 0.01, 0.9) : 0.9;
}

export function OnShutdown() {
  console.log("shutdown")
}

export function GetCamera() {
  return player.camera!;
}