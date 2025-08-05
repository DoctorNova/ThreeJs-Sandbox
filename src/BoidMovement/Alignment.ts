import * as THREE from "three";
import type { Agent } from "../Agent";

export class AlignmentCalculator {
  #steering = new THREE.Vector3(0, 0);
  #self: Agent;
  #visualDistanceSq = 0;
  #total = 0;

  constructor(self: Agent, visualDistanceSq: number) {
    this.#visualDistanceSq = visualDistanceSq;
    this.#self = self;
  }

  Evaluate(other: Agent) {
    const distanceSq = this.#self.worldPosition.distanceToSquared(other.worldPosition);
    const weight = THREE.MathUtils.clamp(1 - (distanceSq / this.#visualDistanceSq), 0, 1);
    this.#steering.add(other.direction.clone().multiplyScalar(weight));
    if (weight > 0) {
      this.#total++;
    }
  }

  CalculateResult(coefficient: number) {
    if (this.#steering.lengthSq() == 0) {
      return this.#steering;
    }

    return this.#steering.multiplyScalar(coefficient / this.#total);
  }
}

