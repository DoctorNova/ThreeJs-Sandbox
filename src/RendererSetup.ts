import type { Camera } from "three/src/cameras/Camera.js";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer.js";
import type { Scene } from "three/src/scenes/Scene.js";
import { AgentManager } from "./AgentsManager";
import { FrameTimer } from "./FrameTime";

type EngineCallback = (renderer: WebGLRenderer) => void;
type EngineFrameCallback = undefined | ((frameTime: number) => void);

let renderer: WebGLRenderer;
let onEachFrame: EngineFrameCallback;
let frameTime: FrameTimer

const resizeObservers = new Array<EngineCallback>();

function Create(canvas: HTMLElement) {
  renderer = new WebGLRenderer({ antialias: true, canvas });
}

function Initialize() {
  renderer.setClearColor(0xff000000);
  resizeObservers.forEach(observer => observer(renderer));

  frameTime = new FrameTimer();
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

let then = 0;
function Render(scene: Scene, camera: Camera) {
  renderer.setAnimationLoop((now) => {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    AgentManager.Update(deltaTime)
    onEachFrame?.(deltaTime);
    renderer.render(scene, camera);

    frameTime?.OnFrameEnd(deltaTime);
    frameTime?.Render();
  });
}

function OnShutdown(onShutdown: EngineCallback) {
  window.addEventListener('beforeunload', () => onShutdown?.(renderer));
}

function GetRenderer() {
  return renderer!;
}

function GetTime() {
  return then;
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