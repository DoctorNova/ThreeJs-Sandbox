import { Agent } from "./Agent";

let agents = new Array<Agent>();
let containsDestroyed = false;

function Add(agent: Agent) {
  agents.push(agent);
}

export type ForeachCallback = (agent: Agent) => (boolean | undefined | void);

// If the given callback returns true the foreach loop stops
function ForEach(callback: ForeachCallback) {
  for (const agent of agents) {
    if (!agent.IsDestroyed && callback(agent)) {
      break;
    }
  }
}

/**
 * TODO: UNTESTED!!!!!!!!!
 * @param agent 
 */
function Remove(agent: Agent) {
  containsDestroyed = true;
  agent.SetDestroyed();
}

function UpdateDestroyedAgents() {
  if (!containsDestroyed) {
    return;
  }

  agents = agents.filter((agent) => !agent.IsDestroyed);
  containsDestroyed = false;
}

function Update(deltaTime: number) {
  UpdateDestroyedAgents();

  agents.forEach((agent) => {
    agent.Update(deltaTime);
  })
}

export const AgentManager = {
  Add,
  Remove,
  ForEach,
  Update,
} 