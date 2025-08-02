import * as Game from './Game';
import { RendererSetup } from './RendererSetup';

// Add event listener
RendererSetup.OnResize(Game.OnResize)
RendererSetup.OnEachFrame(Game.OnUpdate);
RendererSetup.OnShutdown(Game.OnShutdown);

// Run engine
RendererSetup.Initialize(document.getElementById("display")!);
Game.Initialize();
RendererSetup.Render(Game.scene, Game.camera);
