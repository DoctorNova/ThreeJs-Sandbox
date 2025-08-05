import { Vector3 } from "three/src/math/Vector3.js";
import type { Agent } from "../Agent";

export class CohesionCalculator {
  #center = new Vector3(0, 0);
  #total = 0;
  #self: Agent;

  constructor(self: Agent) {
    this.#self = self;
  }

  Evaluate(other: Agent) {
    this.#center.add(other.worldPosition);
    this.#total++;
  }

  CalculateResult(coefficient: number) {
    if (this.#total == 0) {
      return new Vector3(0, 0, 0);
    }

    const steering = this.#center
      .divideScalar(this.#total)
      .sub(this.#self.worldPosition);

    if (steering.lengthSq() == 0) {
      return new Vector3(0, 0, 0);
    }

    return steering.normalize().multiplyScalar(coefficient);
  }
}