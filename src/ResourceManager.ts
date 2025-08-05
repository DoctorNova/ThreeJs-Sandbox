import * as THREE from 'three';
import {
  GLTFLoader,
  type GLTF,
} from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

type AnimationClips = Map<string, THREE.AnimationClip>;

interface AnimatedObjectResource {
  gltf: GLTF;
  animationClips: AnimationClips;
}

class DeferredResource {
  private resolve: ((data: AnimatedObjectResource) => void) | undefined;
  private reject: ((error: Error) => void) | undefined;
  private promise = new Promise<AnimatedObjectResource>((res, rej) => {
    this.resolve = res;
    this.reject = rej;
  });

  url: string;

  constructor(url: string) {
    this.url = url;
  }

  async Get() {
    return await this.promise;
  }

  Set(gltf: GLTF, animationClips: AnimationClips) {
    this.resolve?.({ gltf, animationClips });
  }

  Fail(error: Error) {
    this.reject?.(error);
  }
}

const manager = new THREE.LoadingManager();
manager.onLoad = init;
const models = {
  emperorAnglefish: new DeferredResource('assets/resources/emperor_angelfish.glb'),
  jellyfish: new DeferredResource('assets/resources/simple_jellyfish.glb'),
  low_poly_fish: new DeferredResource('assets/resources/low_poly_fish.glb'),
};

export type ResourceName = keyof typeof models;

export interface AnimatedObject {
  object: THREE.Object3D;
  animations: AnimationClips;
}

function LoadAll() {
  // Load resources
  const gltfLoader = new GLTFLoader(manager);
  for (const model of Object.values(models)) {
    gltfLoader.load(model.url, (gltf: GLTF) => {
      model.Set(gltf, prepModelsAndAnimations(gltf));

      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object
    }, undefined, (error) => {
      model.Fail(error as Error);
    });
  }

  // Draw progress bar
  const progressbarElem = document.getElementById('progressbar');
  const progressInfoElem = document.querySelector('.info > p');
  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    if (progressbarElem) {
      progressbarElem.style.width = `${Math.max(itemsLoaded / itemsTotal * 100 | 0, 5)}%`;
    }
    if (progressInfoElem) {
      progressInfoElem.textContent = `loading: ${url}`;
    }
  };
}

function prepModelsAndAnimations(gltf: GLTF) {
  const animsByName = new Map<string, THREE.AnimationClip>;
  gltf.animations.forEach((clip) => {
    animsByName.set(clip.name, clip);
  });
  return animsByName;
}

function init() {
  // hide the loading bar
  const loadingElem = document.querySelector<HTMLElement>('#loading');
  if (loadingElem) {
    loadingElem.style.display = 'none';
  }
}

async function CreateInstance(resource: ResourceName): Promise<AnimatedObject> {
  const model = models[resource];

  if (!model)
    throw Error(`No resource exists with the name ${resource}`);

  const data = await model.Get();
  const object = SkeletonUtils.clone(data.gltf.scene);

  return {
    object: object,
    animations: data.animationClips
  };
}

export const ResourceManager = {
  LoadAll,
  CreateInstance,
}