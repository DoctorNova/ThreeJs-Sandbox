import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import * as THREE from 'three/src/Three.Core.js';

type AnimationClips = Map<string, THREE.AnimationClip>;

interface AnimatedObjectResource {
  gltf: GLTF;
  animations: AnimationClips;
}

class DeferredResource<Data> {
  private resolve: ((data: Data) => void) | undefined;
  private reject: ((error: Error) => void) | undefined;
  private promise = new Promise<Data>((res, rej) => {
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

  Set(data: Data) {
    this.resolve?.(data);
  }

  Fail(error: Error) {
    this.reject?.(error);
  }
}

const manager = new THREE.LoadingManager();
manager.onLoad = init;
const models = {
  emperorAnglefish: new DeferredResource<AnimatedObjectResource>('assets/resources/emperor_angelfish_glb.glb'),
  jellyfish: new DeferredResource<AnimatedObjectResource>('assets/resources/simple_jellyfish.glb'),
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
      model.Set({ gltf, animations: prepModelsAndAnimations(gltf) })

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

  return {
    object: SkeletonUtils.clone(data.gltf.scene),
    animations: data.animations
  };
}

export const ResourceManager = {
  LoadAll,
  CreateInstance,
}