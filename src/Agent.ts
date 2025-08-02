import type { Object3D } from "three/src/core/Object3D.js";
import { ArrowHelper } from "three/src/helpers/ArrowHelper.js";
import { Vector3 } from "three/src/math/Vector3.js";
import { scene } from "./Game";

export type SteeringFunction = (agent: Agent, deltaTime: number) => Vector3;

export class Agent {
  #id: number;
  object: Object3D;
  steering: SteeringFunction;
  #desiredDirection: Vector3;
  #currentDirection: Vector3;
  #desiredDirectionArrow: ArrowHelper;
  #velocity: Vector3;
  #currentDirectionArrow: ArrowHelper;

  constructor(object: Object3D, forward: Vector3, up: Vector3, steering: SteeringFunction) {
    this.#id = Math.random() * 100;
    this.object = object;
    this.#currentDirection = this.#desiredDirection = forward;
    this.#velocity = new Vector3(0, 0, 0);

    this.object.up.copy(up);
    this.object.lookAt(this.object.position.clone().add(forward));

    const yellow = 0xffff00;
    this.#desiredDirectionArrow = new ArrowHelper(this.#desiredDirection, this.object.position, 1, yellow);
    scene.add(this.#desiredDirectionArrow);

    const red = 0xffff0000;
    this.#currentDirectionArrow = new ArrowHelper(this.#currentDirection, this.object.position, 1, red);
    scene.add(this.#currentDirectionArrow);

    this.steering = steering;
  }

  Update(frameTime: number, speed: number) {
    this.#desiredDirection = this.steering(this, frameTime).normalize();
    // Change current velocity to the new velocity
    this.#currentDirection.lerp(this.#desiredDirection, frameTime * 2);

    this.#velocity = this.#currentDirection.clone().multiplyScalar(speed);
    this.object.position.add(this.#velocity.clone().multiplyScalar(frameTime));

    // Update the arrow that shows the agents movement direction
    this.#desiredDirectionArrow.position.copy(this.object.position);
    this.#desiredDirectionArrow.setDirection(this.#desiredDirection);
    this.#desiredDirectionArrow.setLength(this.#desiredDirection.length())
    // Update the arrow that shows the agents current velocity
    this.#currentDirectionArrow.position.copy(this.object.position);
    this.#currentDirectionArrow.setDirection(this.#currentDirection);
    this.#currentDirectionArrow.setLength(this.#currentDirection.length())

    // Rotate agent into the direction he is moving
    if (this.#currentDirection.lengthSq() != 0) {
      this.object.lookAt(this.object.position.clone().add(this.#currentDirection));
    }
  }

  get direction() {
    return this.#currentDirection;
  }

  get id() {
    return this.#id;
  }

  get velocity() {
    return this.#velocity;
  }
}