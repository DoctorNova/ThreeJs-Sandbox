import { Vector3 } from "three/src/math/Vector3.js";

function GetBiggestDimension(scale: Vector3): number {
  return Math.max(scale.x, Math.max(scale.y, scale.z));
}

export class CollisionDetection {

  
  static SphereVsSphere(sphere1: Vector3, scale1: number | Vector3, sphere2: Vector3, scale2: number | Vector3) {
    const distanceSq = sphere1.distanceToSquared(sphere2);
    const radius1 = scale1 instanceof Vector3 ? GetBiggestDimension(scale1) : scale1;
    const radius2 = scale2 instanceof Vector3 ? GetBiggestDimension(scale2) : scale2;
    const collisionDistance = radius1 + radius2;
  
    return distanceSq < (collisionDistance * collisionDistance);
  }
}

