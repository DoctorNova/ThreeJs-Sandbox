import { MathUtils } from "three/src/math/MathUtils.js";
import { Vector3 } from "three/src/math/Vector3.js";
import type { Agent } from "../Agent";

export class AlignmentCalculator {
  #steering = new Vector3(0, 0);
  #self: Agent;
  #visualDistanceSq = 0;
  #total = 0;

  constructor(self: Agent, visualDistanceSq: number) {
    this.#visualDistanceSq = visualDistanceSq;
    this.#self = self;
  }

  Evaluate(other: Agent) {
    const distanceSq = this.#self.object.position.distanceToSquared(other.object.position);
    const weight = MathUtils.clamp(1 - (distanceSq / this.#visualDistanceSq), 0, 1);
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

