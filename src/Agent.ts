import type { AnimationClip } from "three/src/animation/AnimationClip.js";
import { AnimationMixer } from "three/src/animation/AnimationMixer.js";
import { LoopRepeat } from "three/src/constants.js";
import type { Object3D } from "three/src/core/Object3D.js";
import { ArrowHelper } from "three/src/helpers/ArrowHelper.js";
import { MathUtils } from "three/src/math/MathUtils.js";
import { Matrix4 } from "three/src/math/Matrix4.js";
import { Vector3 } from "three/src/math/Vector3.js";

export type SteeringFunction = (agent: Agent, deltaTime: number) => Vector3;

export class Agent {
  readonly id: number;
  private speed: number;
  private turnSpeed: number;
  private desiredDirection: Vector3;
  private currentDirection: Vector3;
  private desiredDirectionArrow: ArrowHelper;
  private currentDirectionArrow: ArrowHelper;
  private animationMixer: AnimationMixer;
  private position = new Vector3(0, 0, 0);
  private isDestroyed = false;
  steering: SteeringFunction;
  object: Object3D;

  constructor(object: Object3D, swimAnimation: AnimationClip, forward: Vector3, up: Vector3, steering: SteeringFunction, speed: number = 1, turnSpeed = 1) {
    this.id = Math.random() * 100;
    this.object = object;
    this.currentDirection = this.desiredDirection = forward;
    this.speed = speed;
    this.turnSpeed = turnSpeed;

    this.position = new Vector3();
    this.object.getWorldPosition(this.position);

    this.object.up.copy(up);
    this.object.lookAt(this.position.clone().add(forward));
    //this.object.rotateY(-Math.PI / 2);

    const yellow = 0xffff00;
    this.desiredDirectionArrow = new ArrowHelper(this.desiredDirection, this.position, 1, yellow);
    //scene.add(this.desiredDirectionArrow);

    const red = 0xffff0000;
    this.currentDirectionArrow = new ArrowHelper(this.currentDirection, this.position, 1, red);
    //scene.add(this.currentDirectionArrow);

    this.steering = steering;

    this.animationMixer = new AnimationMixer(this.object);
    const action = this.animationMixer.clipAction(swimAnimation);
    action.setLoop(LoopRepeat, Infinity);
    action.startAt(Math.random() * action.getEffectiveTimeScale());
    action.play();
  }

  Update(frameTime: number) {
    this.position = new Vector3();
    this.object.getWorldPosition(this.position);

    this.desiredDirection = this.steering(this, frameTime).normalize();
    // Change current velocity to the new velocity
    this.currentDirection.lerp(this.desiredDirection, MathUtils.clamp(frameTime * this.turnSpeed, 0, 1));

    const velocity = this.currentDirection.clone().multiplyScalar(this.speed);
    const translation = new Matrix4().makeTranslation(velocity.clone().multiplyScalar(frameTime));
    this.object.applyMatrix4(translation);

    // Update the arrow that shows the agents movement direction
    this.desiredDirectionArrow.position.copy(this.position);
    this.desiredDirectionArrow.setDirection(this.desiredDirection);
    this.desiredDirectionArrow.setLength(this.desiredDirection.length())
    // Update the arrow that shows the agents current velocity
    this.currentDirectionArrow.position.copy(this.position);
    this.currentDirectionArrow.setDirection(this.currentDirection);
    this.currentDirectionArrow.setLength(this.currentDirection.length())

    // Rotate agent into the direction he is moving
    if (this.currentDirection.lengthSq() != 0) {
      this.object.lookAt(this.position.clone().add(this.currentDirection));
      //this.object.rotateY(-Math.PI / 2);
    }

    this.animationMixer.update(frameTime);
  }

  get direction() {
    return this.currentDirection;
  }

  get worldPosition() {
    return this.position;
  }

  get IsDestroyed() {
    return this.isDestroyed;
  }

  SetDestroyed() {
    this.isDestroyed = true;
  }
}