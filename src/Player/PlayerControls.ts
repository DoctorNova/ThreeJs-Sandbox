import type { Object3D } from "three/src/core/Object3D.js";
import { Controls } from "three/src/extras/Controls.js";
import { MathUtils } from "three/src/math/MathUtils.js";
import { Spherical } from "three/src/math/Spherical.js";
import { Vector3 } from "three/src/math/Vector3.js";

const _lookDirection = new Vector3();
const _spherical = new Spherical();
const _target = new Vector3();
const _targetPosition = new Vector3();

/**
 * This class is an alternative implementation of {@link FlyControls}.
 *
 * @augments Controls
 * @three_import import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
 */
class PlayerControls extends Controls<Event> {
  private movementSpeed = 0;

  /**
   * The movement speed.
   *
   * @type {number}
   * @default 1
   */
  defaultMovementSpeed: number = .5;

  /**
   * The look around speed.
   *
   * @type {number}
   * @default 0.005
   */
  lookSpeed = 0.1;

  /**
   * Whether it's possible to vertically look around or not.
   *
   * @type {boolean}
   * @default true
   */
  lookVertical = true;

  /**
   * Whether it's possible to look around or not.
   *
   * @type {boolean}
   * @default true
   */
  activeLook = true;

  /**
   * Whether or not looking around is vertically constrained by `verticalMin` and `verticalMax`.
   *
   * @type {boolean}
   * @default false
   */
  constrainVertical = false;

  /**
   * How far you can vertically look around, lower limit. Range is `0` to `Math.PI` in radians.
   *
   * @type {number}
   * @default 0
   */
  verticalMin = 0;

  /**
   * How far you can vertically look around, upper limit. Range is `0` to `Math.PI` in radians.
   *
   * @type {number}
   * @default 0
   */
  verticalMax = Math.PI;

  canMove = true;

  /**
   * Whether the mouse is pressed down or not.
   *
   * @type {boolean}
   * @readonly
   * @default false
   */
  mouseDragOn = false;

  // internals

  private _pointerX = 0;
  private _pointerY = 0;

  private _moveForward = false;
  private _moveStop = false;
  private _moveLeft = false;
  private _moveRight = false;
  private _moveUp = false;
  private _moveDown = false;

  private _viewHalfX = 0;
  private _viewHalfY = 0;

  private _lat = 0;
  private _lon = 0;

  // event listeners
  private _onPointerMove = this.onPointerMove.bind(this);
  private _onPointerDown = this.onPointerDown.bind(this);
  private _onPointerUp = this.onPointerUp.bind(this);
  private _onContextMenu = this.onContextMenu.bind(this);
  private _onKeyDown = this.onKeyDown.bind(this);
  private _onKeyUp = this.onKeyUp.bind(this);

  /**
   * Constructs a new controls instance.
   *
   * @param {Object3D} object - The object that is managed by the controls.
   * @param {?HTMLDOMElement} domElement - The HTML element used for event listeners.
   */
  constructor(object: Object3D, domElement: HTMLElement) {

    super(object, domElement);

    if (domElement !== null) {
      this.connect(domElement);
      this.handleResize();
    }

    this._setOrientation();
  }

  connect(element: HTMLElement) {

    super.connect(element);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    if (this.domElement) {
      this.domElement.addEventListener('pointermove', this._onPointerMove);
      this.domElement.addEventListener('pointerdown', this._onPointerDown);
      this.domElement.addEventListener('pointerup', this._onPointerUp);
      this.domElement.addEventListener('contextmenu', this._onContextMenu);
    }
  }

  disconnect() {

    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);

    if (this.domElement) {
      this.domElement.removeEventListener('pointerdown', this._onPointerMove);
      this.domElement.removeEventListener('pointermove', this._onPointerDown);
      this.domElement.removeEventListener('pointerup', this._onPointerUp);
      this.domElement.removeEventListener('contextmenu', this._onContextMenu);
    }

  }

  dispose() {

    this.disconnect();

  }

  /**
   * Must be called if the application window is resized.
   */
  handleResize() {
    if (this.domElement) {
      this._viewHalfX = this.domElement.offsetWidth / 2;
      this._viewHalfY = this.domElement.offsetHeight / 2;
    }
  }

  /**
   * Rotates the camera towards the defined target position.
   *
   * @param {number|Vector3} x - A vector representing the target position.
   * @return {PlayerControls} A reference to this controls.
   */
  lookAt(coordinates: Vector3) {
    _target.copy(coordinates);
    this.object.lookAt(_target);
    this._setOrientation();
    return this;
  }

  update(delta: number) {

    if (this.enabled === false) return;

    if (this.canMove) {
      if (this._moveStop) {
        this.movementSpeed -= delta * 2;
      }
      else if (this._moveForward) {
        this.movementSpeed += delta * 2;
      }

      const actualMoveSpeed = delta * Math.max(this.movementSpeed, 0.5);

      this.object.translateZ(-actualMoveSpeed);

      if (this._moveLeft) this.object.translateX(- actualMoveSpeed);
      if (this._moveRight) this.object.translateX(actualMoveSpeed);

      if (this._moveUp) this.object.translateY(actualMoveSpeed);
      if (this._moveDown) this.object.translateY(- actualMoveSpeed);
    }

    let actualLookSpeed = delta * this.lookSpeed;

    if (!this.activeLook) {

      actualLookSpeed = 0;

    }

    let verticalLookRatio = 1;

    if (this.constrainVertical) {

      verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);

    }

    this._lon -= this._pointerX * actualLookSpeed;
    if (this.lookVertical) this._lat -= this._pointerY * actualLookSpeed * verticalLookRatio;

    this._lat = Math.max(- 85, Math.min(85, this._lat));

    let phi = MathUtils.degToRad(90 - this._lat);
    const theta = MathUtils.degToRad(this._lon);

    if (this.constrainVertical) {

      phi = MathUtils.mapLinear(phi, 0, Math.PI, this.verticalMin, this.verticalMax);

    }

    const position = this.object.position;

    _targetPosition.setFromSphericalCoords(1, phi, theta).add(position);

    this.object.lookAt(_targetPosition);

  }

  _setOrientation() {

    const quaternion = this.object.quaternion;

    _lookDirection.set(0, 0, - 1).applyQuaternion(quaternion);
    _spherical.setFromVector3(_lookDirection);

    this._lat = 90 - MathUtils.radToDeg(_spherical.phi);
    this._lon = MathUtils.radToDeg(_spherical.theta);

  }


  private onPointerDown(event: PointerEvent) {

    if (this.domElement) {

      this.domElement.focus();

    }

    if (this.activeLook) {

      //switch (event.button) {
      //  case 0: this._moveForward = true; break;
      //  case 2: this._moveBackward = true; break;
      //}

    }

    this.mouseDragOn = true;

  }

  private onPointerUp(event: PointerEvent) {

    if (this.activeLook) {

      //switch (event.button) {
      //
      //  case 0: this._moveForward = false; break;
      //  case 2: this._moveBackward = false; break;
      //
      //}

    }

    this.mouseDragOn = false;

  }

  private onPointerMove(event: PointerEvent) {

    if (this.domElement) {

      this._pointerX = event.pageX - this.domElement.offsetLeft - this._viewHalfX;
      this._pointerY = event.pageY - this.domElement.offsetTop - this._viewHalfY;

    }

  }

  private onKeyDown(event: KeyboardEvent) {

    switch (event.code) {

      case 'ArrowUp':
      case 'KeyW': this._moveForward = true; break;

      case 'ArrowLeft':
      case 'KeyA': this._moveLeft = true; break;

      case 'ArrowDown':
      case 'KeyS': this._moveStop = true; break;

      case 'ArrowRight':
      case 'KeyD': this._moveRight = true; break;

      case 'KeyR': this._moveUp = true; break;
      case 'KeyF': this._moveDown = true; break;

    }

  }

  private onKeyUp(event: KeyboardEvent) {

    switch (event.code) {

      case 'ArrowUp':
      case 'KeyW': this._moveForward = false; break;

      case 'ArrowLeft':
      case 'KeyA': this._moveLeft = false; break;

      case 'ArrowDown':
      case 'KeyS': this._moveStop = false; break;

      case 'ArrowRight':
      case 'KeyD': this._moveRight = false; break;

      case 'KeyR': this._moveUp = false; break;
      case 'KeyF': this._moveDown = false; break;

    }

  }

  private onContextMenu(event: MouseEvent) {

    if (this.enabled === false) return;

    event.preventDefault();

  }

  get target() {
    return _targetPosition;
  }

}


export { PlayerControls };
