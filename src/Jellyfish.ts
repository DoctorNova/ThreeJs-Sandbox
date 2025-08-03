import { AnimationMixer } from 'three/src/animation/AnimationMixer.js';
import { Vector3 } from 'three/src/math/Vector3.js';
import { scene } from './Game';
import { ResourceManager, type ResourceName } from './ResourceManager';

export class Jellyfish {
  private animationMixer?: AnimationMixer;

  constructor(resourceName: ResourceName, scale: Vector3, position = new Vector3(0, 0, 0)) {
    ResourceManager.CreateInstance(resourceName).then(({ object, animations }) => {
        object.scale.copy(scale);
        object.position.copy(position);
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