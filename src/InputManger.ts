
const keys: Record<string, boolean> = {}

function IsPressed(keyValue: string): boolean {
  return keys[keyValue.toLocaleLowerCase()];
}

function UpdateKeys(value: boolean, event: KeyboardEvent) {
  keys[event.key.toLocaleLowerCase()] = value;
}

function Initialize() {
  window.addEventListener('keydown', UpdateKeys.bind(undefined, true));
  window.addEventListener('keyup', UpdateKeys.bind(undefined, false));
}

export const InputManager = {
  Initialize,
  IsPressed,
}