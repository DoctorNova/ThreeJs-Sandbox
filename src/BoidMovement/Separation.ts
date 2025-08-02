import { Vector3 } from "three/src/math/Vector3.js";
import type { Agent } from "../Agent";

export class SeparationCalculator {
  #steering = new Vector3(0, 0);
  #self: Agent;
  #visualDistanceSq: number;

  constructor(self: Agent, visualDistanceSq: number) {
    this.#self = self;
    this.#visualDistanceSq = visualDistanceSq;
  }

  Evaluate(other: Agent) {
    const diff = this.#self.object.position.clone().sub(other.object.position);
    const distanceSq = diff.lengthSq();
    
    // If two agents are on top of each other then move into a random direction
    if (distanceSq  == 0) {
      diff.randomDirection();
    }

    const weight = Math.min(Math.max(1 - (distanceSq / this.#visualDistanceSq), 0), 1);
    diff.normalize();
    diff.multiplyScalar(weight);
    this.#steering.add(diff);
  }

  CalculateResult(coefficient: number) {
    if (this.#steering.lengthSq() == 0) {
      return new Vector3(0, 0, 0);
    }

    return this.#steering.normalize().multiplyScalar(coefficient);
  }
}