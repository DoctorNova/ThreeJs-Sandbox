import * as Game from './Game';
import { InputManager } from './InputManger';
import { RendererSetup } from './RendererSetup';
import { ResourceManager } from './ResourceManager';

RendererSetup.Create(document.getElementById("display")!);
// Add event listener
RendererSetup.OnResize(Game.OnResize)
RendererSetup.OnEachFrame(Game.OnUpdate);
RendererSetup.OnShutdown(Game.OnShutdown);

ResourceManager.LoadAll();
// Run engine
InputManager.Initialize();
RendererSetup.Initialize();
Game.Initialize();
RendererSetup.Render(Game.scene, Game.GetCamera());
