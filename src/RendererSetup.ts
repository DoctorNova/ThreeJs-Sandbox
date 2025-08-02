import type { Camera } from "three/src/cameras/Camera.js";
import { Clock } from "three/src/core/Clock.js";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer.js";
import type { Scene } from "three/src/scenes/Scene.js";

type EngineCallback = () => void;
type EngineFrameCallback = undefined | ((frameTime: number) => void);

let renderer: WebGLRenderer;
let onEachFrame: EngineFrameCallback;
let clock: Clock;

let mTime = 0;

function GetTime() {
  return mTime;
}

function Initialize(canvas: HTMLElement) {
  renderer = new WebGLRenderer({ antialias: true, canvas });
  renderer.setClearColor(0xff000000);
  renderer.setSize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  clock = new Clock()
}

function OnResize(callback?: EngineCallback) {
  if (callback) {
    window.addEventListener('resize', callback);
  }
}

function OnEachFrame(callback?: EngineFrameCallback) {
  onEachFrame = callback;
}

function Render(scene: Scene, camera: Camera) {
  renderer.setAnimationLoop((time) => {
    mTime = time / 1000;
    onEachFrame?.(clock.getDelta());
    renderer.render(scene, camera);
  });
}

function OnShutdown(onShutdown: EngineCallback) {
  window.addEventListener('beforeunload', () => onShutdown?.());
}

function GetRenderer() {
  return renderer!;
}

export const RendererSetup = {
  Initialize,
  Render,
  OnResize,
  OnShutdown,
  OnEachFrame,
  GetRenderer,
  GetTime,
};