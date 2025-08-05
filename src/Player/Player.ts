import {
  Matrix4,
  PerspectiveCamera,
  Quaternion,
  Vector3,
  type Scene,
} from 'three';
import { Agent } from '../Agent';
import { AgentManager } from '../AgentsManager';
import { QueryParams } from '../QueryParams';
import { ResourceManager } from '../ResourceManager';
import { PlayerControls } from './PlayerControls';

export class Player {
  private agent?: Agent;
  readonly camera = new PerspectiveCamera(50, 1, 0.1, 1000);
  readonly steerSpeed = 10;
  private controls?: PlayerControls;
  
  constructor(scene: Scene, _domElement: HTMLElement) {
    
    ResourceManager.CreateInstance("emperorAnglefish").then((result) => {
      
      const cameraForward = new Vector3();
      this.camera.getWorldDirection(cameraForward);
      
      this.agent = new Agent(result.object, result.animations.values().next().value!, cameraForward, this.camera.up, () => {
        if (!this.agent) {
          return new Vector3(0, 0, -1);
        }
        
        if (!this.controls) {
          return this.agent.direction;
        }
        
        return this.controls.target.clone().sub(this.agent.worldPosition).normalize();
      }, 0, this.steerSpeed);
      
      const transformation = new Matrix4().compose(new Vector3(0, -0.05, -0.25).add(this.camera.position), new Quaternion(), new Vector3().setScalar(0.1));
      this.agent.object.applyMatrix4(transformation);

      this.controls = new PlayerControls(this.camera, _domElement);
      
      if (QueryParams.GetBoolean("playerControls")) {
        this.controls.canMove = true;
        AgentManager.Add(this.agent);
        this.camera.attach(this.agent.object);
      } else {
        this.controls.canMove = false;
      }

      scene.add(this.camera);
    });

  }

  Update(deltaTime: number) {
    if (!this.agent || !this.controls)
      return;

    this.controls.update(deltaTime);
  }
}