import * as Game from './Game';
import { RendererSetup } from './RendererSetup';
import { ResourceManager } from './ResourceManager';

RendererSetup.Create(document.getElementById("display")!);
// Add event listener
RendererSetup.OnResize(Game.OnResize)
RendererSetup.OnEachFrame(Game.OnUpdate);
RendererSetup.OnShutdown(Game.OnShutdown);

ResourceManager.LoadAll();
// Run engine
RendererSetup.Initialize();
Game.Initialize();
RendererSetup.Render(Game.scene, Game.camera);
