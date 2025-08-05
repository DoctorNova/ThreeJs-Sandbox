import { MathUtils, Vector3 } from "three";
import type { Agent } from "../Agent";

export class SeparationCalculator {
  #steering = new Vector3(0, 0);
  #self: Agent;
  #collisionDistanceSq: number;
  #total = 0;

  constructor(self: Agent, collisionDistanceSq: number) {
    this.#self = self;
    this.#collisionDistanceSq = collisionDistanceSq;
  }

  Evaluate(other: Agent) {
    const diff = this.#self.worldPosition.clone().sub(other.worldPosition);
    const distanceSq = diff.lengthSq();

    if (distanceSq > this.#collisionDistanceSq) {
      return;
    }
    
    // If two agents are on top of each other then move into a random direction
    if (distanceSq  == 0) {
      diff.randomDirection();
    }

    const weight = MathUtils.clamp(1 - (distanceSq / this.#collisionDistanceSq), 0, 1);
    diff.normalize();
    diff.multiplyScalar(weight);
    this.#steering.add(diff);
    this.#total++;
  }

  CalculateResult(coefficient: number) {
    if (this.#steering.lengthSq() == 0) {
      return new Vector3(0, 0, 0);
    }

    return this.#steering.multiplyScalar(coefficient / this.#total);
  }
}