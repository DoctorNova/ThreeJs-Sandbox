import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Vector3 } from "three/src/math/Vector3.js";
import { Agent } from './Agent';
import { BoidMovement } from './BoidMovement/intex';
import { scene } from './Game';

export class Swarm {
  #gltfLoader: GLTFLoader;
  #path: string;
  #swarm: Agent[] = [];
  speed = 10;
  #up: Vector3;
  #initScale: Vector3;
  #spawnPosition: Vector3;
  #steeringSettings: typeof BoidMovement.DefaultBoidSettings;

  constructor(path: string, spawnPosition: Vector3, up: Vector3, scale: Vector3, steeringSettings = BoidMovement.DefaultBoidSettings) {
    this.#gltfLoader = new GLTFLoader();
    this.#path = path;
    this.#initScale = scale;
    this.#up = up;
    this.#spawnPosition = spawnPosition;
    this.#steeringSettings = steeringSettings;
  }

  #Steer(agent: Agent, deltaTime: number) {
    return BoidMovement.Steer(this.#steeringSettings, this.#swarm, agent, deltaTime);
  }

  Despawn() {
    this.#swarm.forEach((agent: Agent) => {
      agent.object.removeFromParent();
    });
    this.#swarm = [];
  }

  Spawn(size: number) {
    for (let i = 0; i < size; i++) {
      // Load a glTF resource
      this.#gltfLoader.load(
        // resource URL
        `/assets/${this.#path}`,
        // called when the resource is loaded
        (gltf) => {
          const randomForward = new Vector3().randomDirection();
          // Meshes must have up-axis: +y and forward-axis: +z
          // In the agents contructor it is then rotated to the given forward and up vector
          const agent = new Agent(gltf, randomForward, this.#up, this.#Steer.bind(this));
          gltf.scene.position.copy(new Vector3().randomDirection().add(this.#spawnPosition));
          gltf.scene.scale.copy(this.#initScale);
          this.#swarm.push(agent);
          scene.add(gltf.scene);

          gltf.animations; // Array<THREE.AnimationClip>
          gltf.scene; // THREE.Group
          gltf.scenes; // Array<THREE.Group>
          gltf.cameras; // Array<THREE.Camera>
          gltf.asset; // Object

        },
        // called while loading is progressing
        function (xhr) {

          console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

          console.log('An error happened', error);

        }
      );
    }
  }

  Update(frameTime: number) {
    this.#swarm.forEach((fish) => {
      fish.Update(frameTime, this.speed);
    });
  }
}
