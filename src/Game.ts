import { MapControls } from 'three/addons/controls/MapControls.js';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';
import { AxesHelper } from 'three/src/helpers/AxesHelper.js';
import { AmbientLight } from 'three/src/lights/AmbientLight.js';
import { Vector3 } from 'three/src/math/Vector3.js';
import { Scene } from 'three/src/scenes/Scene.js';
import { OceanSkybox } from './OceanSkybox';
import { RendererSetup } from './RendererSetup';
import { Swarm } from './Swarm';

const scale = 0.05;
const rainbowFish = new Swarm("boesemani_rainbow/Boesemani_Rainbow", new Vector3(0, 0, 0), new Vector3().randomDirection(), new Vector3(0, 1, 0), new Vector3(scale, scale, scale));
rainbowFish.speed = 1;

export const scene = new Scene();
export const camera = new PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const skybox = new OceanSkybox();
let cameraControls: MapControls; 
export function Initialize() {
  camera.position.copy(new Vector3(0, 0, 5));
  cameraControls = new MapControls(camera, RendererSetup.GetRenderer().domElement);
  
  const ambientLight = new AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  scene.add(skybox);
  
  const axesHelper = new AxesHelper(1);
  //x = red, y = blue, z = green
  axesHelper.setColors(0xffff0000, 0xff0000ff, 0xff00ff00);
  scene.add(axesHelper);

  rainbowFish.Spawn(10);
}

export function OnResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

export function OnUpdate(frameTime: number) {
  rainbowFish.Update(frameTime);
  cameraControls.update(frameTime);
}

export function OnShutdown() {
  console.log("shutdown")
}