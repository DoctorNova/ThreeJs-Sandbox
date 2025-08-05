import {
  AnimationMixer,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three';
import { scene } from './Game';
import { ResourceManager, type ResourceName } from './ResourceManager';

export class Jellyfish {
  private animationMixer?: AnimationMixer;

  constructor(resourceName: ResourceName, scale: Vector3, position = new Vector3(0, 0, 0)) {
    ResourceManager.CreateInstance(resourceName).then(({ object, animations }) => {
      const transformation = new Matrix4().compose(position, new Quaternion, scale);
      object.applyMatrix4(transformation);
      scene.add(object);

      this.animationMixer = new AnimationMixer(object);
      const animationClip = animations.values().next().value;
      if (!animationClip) {
        console.error(`Can't find animation clip for ${resourceName}`);
        return;
      }
      const action = this.animationMixer.clipAction(animationClip);
      action.play();
    });
  }

  Update(deltaTime: number) {
    this.animationMixer?.update(deltaTime);
  }

}