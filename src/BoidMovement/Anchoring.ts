import { Vector3 } from "three/src/math/Vector3.js";
import type { Agent } from "../Agent";

export function KeepAgentCloseToAnchoringPoint(anchorPoint: Vector3, agent: Agent, visualRangeSq: number, coefficient: number) {
  if (coefficient == 0)
    return new Vector3(0, 0, 0);

  const anchorDirection = anchorPoint.clone().sub(agent.object.position);
  const anchorDistance = anchorDirection.lengthSq();
  if (anchorDistance != 0) {
    const weight = anchorDistance / visualRangeSq;
    anchorDirection.normalize().multiplyScalar(coefficient).multiplyScalar(weight);
  }
  
  return anchorDirection;
}