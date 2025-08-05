import { Vector3 } from "three/src/math/Vector3.js";
import type { Agent } from "../Agent";
import { AgentManager } from "../AgentsManager";
import { AlignmentCalculator } from "./Alignment";
import { KeepAgentCloseToAnchoringPoint } from "./Anchoring";
import { CohesionCalculator } from "./Cohesion";
import { SeparationCalculator } from "./Separation";
import { Wander } from "./Wandering";

const DefaultBoidSettings = {
  coefficient: {
    alignment: 1,
    cohersion: 1,
    separation: 1.5,
    wandering: 1,
    anchor: 1,
  },
  anchorPoint: new Vector3(0, 0, 0),
  collisionRange: 1,
  visualRange: 10,
}

function IsInVisualRange(visualRangeSq: number, self: Agent, other: Agent) {
  const distanceSq = self.worldPosition.distanceToSquared(other.worldPosition);
  return distanceSq < visualRangeSq;
}

function Steer(settings: typeof DefaultBoidSettings, agent: Agent, deltaTime: number) {
  const visualRangeSq = settings.visualRange * settings.visualRange;
  const alignment = new AlignmentCalculator(agent, visualRangeSq);
  const cohersion = new CohesionCalculator(agent);
  const separation = new SeparationCalculator(agent, settings.collisionRange * settings.collisionRange);

  AgentManager.ForEach(other => {
    if (other != agent && IsInVisualRange(visualRangeSq, agent, other)) {
      alignment.Evaluate(other);
      cohersion.Evaluate(other);
      separation.Evaluate(other);
    }
  });

  const wanderingComponent = Wander(agent, deltaTime, settings.coefficient.wandering);
  const anchoringComponent = KeepAgentCloseToAnchoringPoint(settings.anchorPoint, agent, visualRangeSq, settings.coefficient.anchor);
  const alignmentComponent = alignment.CalculateResult(settings.coefficient.alignment)
  const cohersionComponent = cohersion.CalculateResult(settings.coefficient.cohersion)
  const separationComponent = separation.CalculateResult(settings.coefficient.separation);

  const newDirection = new Vector3(0, 0, 0)
    .add(wanderingComponent)
    .add(anchoringComponent)
    .add(alignmentComponent)
    .add(cohersionComponent)
    .add(separationComponent);

  return newDirection;
}

export const BoidMovement = {
  DefaultBoidSettings,
  Steer,
}