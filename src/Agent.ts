import type { Object3D } from "three/src/core/Object3D.js";
import { ArrowHelper } from "three/src/helpers/ArrowHelper.js";
import { Vector3 } from "three/src/math/Vector3.js";
import { scene } from "./Game";

export type SteeringFunction = (agent: Agent, deltaTime: number) => Vector3;

export class Agent {
  #id: number;
  object: Object3D;
  steering: SteeringFunction;
  #direction: Vector3;
  #currentDirection: Vector3;
  #directionArrow: ArrowHelper;
  #velocity: Vector3;
  #velocityArrow: ArrowHelper;

  constructor(object: Object3D, forward: Vector3, up: Vector3, steering: SteeringFunction) {
    this.#id = Math.random() * 100;
    this.object = object;
    this.#currentDirection = this.#direction = forward;
    this.#velocity = new Vector3(0, 0, 0);

    this.object.up.copy(up);
    this.object.lookAt(this.object.position.clone().add(forward));

    const length = 1;
    const hex = 0xffff00;
    this.#directionArrow = new ArrowHelper(this.#direction, this.object.position, length, hex);
    scene.add(this.#directionArrow);

    this.#velocityArrow = new ArrowHelper(this.#velocity, this.object.position, length, 0xffffffff);
    scene.add(this.#velocityArrow);

    this.steering = steering;
  }

  Update(frameTime: number, speed: number) {
    this.#direction = this.steering(this, frameTime).normalize();
    // Change current velocity to the new velocity
    this.#currentDirection.lerp(this.#direction, frameTime);

    const velocity = this.#currentDirection.clone().multiplyScalar(frameTime * speed);
    this.object.position.add(velocity);

    // Update the arrow that shows the agents movement direction
    this.#directionArrow.position.copy(this.object.position);
    this.#directionArrow.setDirection(this.#direction);

    // Rotate agent into the direction he is moving
    if (this.#currentDirection.lengthSq() != 0) {
      this.object.lookAt(this.object.position.clone().add(this.#currentDirection));

      // Update the arrow that shows the agents current velocity
      this.#velocityArrow.position.copy(this.object.position);
      this.#velocityArrow.setDirection(this.#currentDirection);
    }
  }

  get direction() {
    return this.#currentDirection;
  }

  get id() {
    return this.#id;
  }
}