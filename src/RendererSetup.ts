import type { Camera } from "three/src/cameras/Camera.js";
import { Clock } from "three/src/core/Clock.js";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer.js";
import type { Scene } from "three/src/scenes/Scene.js";

type EngineCallback = (renderer: WebGLRenderer) => void;
type EngineFrameCallback = undefined | ((frameTime: number) => void);

let renderer: WebGLRenderer;
let onEachFrame: EngineFrameCallback;
let clock: Clock;

let mTime = 0;

const resizeObservers = new Array<EngineCallback>();

function GetTime() {
  return mTime;
}

function Create(canvas: HTMLElement) {
  renderer = new WebGLRenderer({ antialias: true, canvas });
}

function Initialize() {
  renderer.setClearColor(0xff000000);
  clock = new Clock();
  resizeObservers.forEach(observer => observer(renderer));
}

function OnResize(callback?: EngineCallback) {
  if (callback && renderer.domElement) {
    const eventListener = () => callback(renderer);
    const observer = new ResizeObserver(eventListener);
    resizeObservers.push(eventListener);
    observer.observe(renderer.domElement);
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
  window.addEventListener('beforeunload', () => onShutdown?.(renderer));
}

function GetRenderer() {
  return renderer!;
}

export const RendererSetup = {
  Create,
  Initialize,
  Render,
  OnResize,
  OnShutdown,
  OnEachFrame,
  GetRenderer,
  GetTime,
};