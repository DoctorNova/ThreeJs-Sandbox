import {
  Matrix4,
  Quaternion,
  Vector3,
} from 'three';
import { Agent } from './Agent';
import { AgentGroupId, AgentManager } from "./AgentsManager";
import { BoidMovement } from './BoidMovement/intex';
import { scene } from './Game';
import { ResourceManager, type ResourceName } from './ResourceManager';

export class Swarm {
  private resourceName: ResourceName;
  speed = 10;
  #up: Vector3;
  #initScale: Vector3;
  #spawnPosition: Vector3;
  #steeringSettings: typeof BoidMovement.DefaultBoidSettings;
  #toSpawn = 0;
  #goupId: AgentGroupId;
  private spawningTimeout = 0;

  constructor(groupId: AgentGroupId, resourceName: ResourceName, spawnPosition: Vector3, up: Vector3, scale: Vector3, steeringSettings = BoidMovement.DefaultBoidSettings) {
    this.resourceName = resourceName;
    this.#initScale = scale;
    this.#up = up;
    this.#spawnPosition = spawnPosition;
    this.#steeringSettings = steeringSettings;
    this.#goupId = groupId;
  }

  private Steer(agent: Agent, deltaTime: number) {
    return BoidMovement.Steer(this.#steeringSettings, agent, deltaTime);
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
    const agent = new Agent(this.#goupId, object, animations.values().next().value!, randomForward, this.#up, this.Steer.bind(this), this.speed);
    const translation = new Vector3().randomDirection().add(this.#spawnPosition);
    const transformation = new Matrix4().compose(translation, new Quaternion(), this.#initScale);
    object.applyMatrix4(transformation);
    AgentManager.Add(agent);
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

  Update(_frameTime: number) {
    if (this.#toSpawn > 0) {
      let lastBatch = new Promise<any>((resolve) => resolve(undefined));
      while(this.#toSpawn > 0) {
        const spawnThisFrame = Math.min(this.#toSpawn, 5);
        lastBatch = lastBatch.then(((batchSize: number) => {
          return this.SpawnBatch(batchSize)
        }).bind(this, spawnThisFrame));
        this.#toSpawn -= spawnThisFrame;
      }
    }
  }
}
