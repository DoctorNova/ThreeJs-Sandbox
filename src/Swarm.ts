import { Vector3 } from "three/src/math/Vector3.js";
import { Agent } from './Agent';
import { BoidMovement } from './BoidMovement/intex';
import { scene } from './Game';
import { ResourceManager, type ResourceName } from './ResourceManager';

export class Swarm {
  private resourceName: ResourceName;
  #swarm: Agent[] = [];
  speed = 10;
  #up: Vector3;
  #initScale: Vector3;
  #spawnPosition: Vector3;
  #steeringSettings: typeof BoidMovement.DefaultBoidSettings;
  #toSpawn = 0;
  private spawningTimeout = 0;

  constructor(resourceName: ResourceName, spawnPosition: Vector3, up: Vector3, scale: Vector3, steeringSettings = BoidMovement.DefaultBoidSettings) {
    this.resourceName = resourceName;
    this.#initScale = scale;
    this.#up = up;
    this.#spawnPosition = spawnPosition;
    this.#steeringSettings = steeringSettings;
  }

  private Steer(agent: Agent, deltaTime: number) {
    return BoidMovement.Steer(this.#steeringSettings, this.#swarm, agent, deltaTime);
  }

  Despawn() {
    this.#swarm.forEach((agent: Agent) => {
      agent.object.removeFromParent();
    });
    this.#swarm = [];
  }

  Spawn(size: number, timeout = 0) {
    this.#toSpawn += size;
    this.spawningTimeout = timeout;
  }

  private async SpawnFish() {
    const { object, animations } = await ResourceManager.CreateInstance(this.resourceName);
    const randomForward = new Vector3().randomDirection();
    // Meshes must have up-axis: +y and forward-axis: +z
    // In the agents contructor it is then rotated to the given forward and up vector
    const agent = new Agent(object, animations.values().next().value!, randomForward, this.#up, this.Steer.bind(this));
    object.position.copy(new Vector3().randomDirection().add(this.#spawnPosition));
    object.scale.copy(this.#initScale);
    this.#swarm.push(agent);
    scene.add(object);

    await new Promise((resolve) => {
      setTimeout(resolve, this.spawningTimeout);
    })
  }

  private SpawnBatch(size: number) {
    const spawns = new Array<ReturnType<Swarm["SpawnFish"]>>();

    for(let i = 0; i < size; i++) {
      spawns.push(this.SpawnFish());
    }

    return Promise.allSettled(spawns);
  }

  Update(frameTime: number) {
    let lastBatch = new Promise<any>((resolve) => resolve(undefined));
    while(this.#toSpawn > 0) {
      const spawnThisFrame = Math.min(this.#toSpawn, 5);
      lastBatch = lastBatch.then(((batchSize: number) => {
        return this.SpawnBatch(batchSize)
      }).bind(this, spawnThisFrame));
      this.#toSpawn -= spawnThisFrame;
    }

    this.#swarm.forEach((fish) => {
      fish.Update(frameTime, this.speed);
    });
  }

  get Size() {
    return this.#swarm.length;
  }
}
