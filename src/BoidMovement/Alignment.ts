import { Vector3 } from "three/src/math/Vector3.js";
import type { Agent } from "../Agent";

export class AlignmentCalculator {
  #steering = new Vector3(0, 0);

  Evaluate(other: Agent) {
    this.#steering.add(other.direction);
  }

  CalculateResult(coefficient: number) {
    if (this.#steering.lengthSq() == 0) {
      return this.#steering;
    }

    return this.#steering.normalize().multiplyScalar(coefficient);
  }
}

