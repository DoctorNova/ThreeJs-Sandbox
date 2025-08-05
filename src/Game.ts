import {
  AmbientLight,
  DirectionalLight,
  MathUtils,
  Scene,
  Vector3,
  type WebGLRenderer,
} from 'three';
import { AgentGroupId } from './AgentsManager';
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

const emperorAnglefishScale = 0.5;
const emperorAnglefishSwarm = new Swarm(AgentGroupId.angelfish, "emperorAnglefish", new Vector3(0, 0, -10), new Vector3(0, 1, 0), new Vector3(emperorAnglefishScale, emperorAnglefishScale, emperorAnglefishScale), {
  coefficient: {
    alignment: 1,
    cohersion: 1,
    separation: 3,
    wandering: 1,
    anchor: 1,
  },
  anchorPoint: new Vector3(0, 0, 0),
  collisionRange: 1,
  visualRange: 10,
});
emperorAnglefishSwarm.speed = 1;
emperorAnglefishSwarm.Spawn(100, 10);

const fusilierScale = 3;
const fusilierSwarm = new Swarm(AgentGroupId.angelfish, "fusilier", new Vector3(5, 0, 0), new Vector3(0, 1, 0), new Vector3(fusilierScale, fusilierScale, fusilierScale), {
  coefficient: {
    alignment: 1,
    cohersion: 1,
    separation: 3,
    wandering: 1,
    anchor: 1,
  },
  anchorPoint: new Vector3(0, 0, 0),
  collisionRange: 0.5,
  visualRange: 10,
});
fusilierSwarm.speed = 1;
fusilierSwarm.Spawn(100, 10);

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
  player.Update(frameTime);
  emperorAnglefishSwarm.Update(frameTime);
  fusilierSwarm.Update(frameTime);

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