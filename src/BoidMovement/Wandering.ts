import { Vector3 } from "three";
import type { Agent } from "../Agent";
import { noise2D } from "../Noise";

export function Wander(agent: Agent, time: number, coefficient: number) {
  const wanderFrequency = 0.5;

  const wanderX = noise2D(agent.id, time * wanderFrequency);
  const wanderY = noise2D(agent.id + 100, time * wanderFrequency);
  const wanderZ = noise2D(agent.id + 200, time * wanderFrequency);

  const wander = new Vector3(wanderX, wanderY, wanderZ)
    .normalize()
    .multiplyScalar(coefficient);
  
  return wander;
}