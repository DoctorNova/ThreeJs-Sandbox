import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Vector3 } from "three/src/math/Vector3.js";
import { Agent } from './Agent';
import { BoidMovement } from './BoidMovement/intex';
import { scene } from './Game';

export class Swarm {
  #objLoader: OBJLoader;
  #mtlLoader: MTLLoader;
  #path: string;
  #swarm: Agent[] = [];
  speed = 10;
  #up: Vector3;
  #forward: Vector3;
  #initScale: Vector3;
  #spawnPosition: Vector3;

  constructor(path: string, spawnPosition: Vector3, forward: Vector3, up: Vector3, scale: Vector3) {
    this.#objLoader = new OBJLoader();
    this.#mtlLoader = new MTLLoader();
    this.#path = path;
    this.#initScale = scale;
    this.#up = up;
    this.#forward = forward;
    this.#spawnPosition = spawnPosition;
  }

  #Steer(agent: Agent, deltaTime: number) {
    return BoidMovement.Steer(BoidMovement.DefaultBoidSettings, this.#swarm, agent, deltaTime);
  }

  Despawn() {
    this.#swarm.forEach((agent: Agent) => {
      agent.object.removeFromParent();
    });
    this.#swarm = [];
  }

  Spawn(size: number) {
    this.#mtlLoader.load(`/assets/${this.#path}.mtl`, (mtl) => {
      mtl.preload();
      this.#objLoader.setMaterials(mtl);

      for (let i = 0; i < size; i++) {
        this.#objLoader.load(`/assets/${this.#path}.obj`, (root) => {
          const randomForward = new Vector3().randomDirection();
          // Meshes must have up-axis: +y and forward-axis: +z
          // In the agents contructor it is then rotated to the given forward and up vector
          const agent = new Agent(root, randomForward, this.#up, this.#Steer.bind(this));
          root.position.copy(new Vector3().randomDirection().add(this.#spawnPosition));
          root.scale.copy(this.#initScale);
          this.#swarm.push(agent);
          scene.add(root);
        });
      }
    });
  }

  Update(frameTime: number) {
    this.#swarm.forEach((fish) => {
      fish.Update(frameTime, this.speed);
    });
  }
}
