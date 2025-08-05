
export class FrameTimer {
  private frames = 0;
  private fps = 0;
  private timer = 0;

  private domElement: HTMLElement | null;

  constructor() {
    this.domElement = document.getElementById("fps-counter");
  }

  OnFrameEnd(deltaTime: number) {
    this.frames++;
    this.timer += deltaTime;
    
    if (this.timer >= 1 ) {
    	this.fps = Math.round( this.frames / this.timer );
      this.frames = 0;
      this.timer = 0;
    }
  }

  Render() {
    if (this.domElement) {
      this.domElement.textContent = `${this.fps} fps`;
    }
  }

  get FPS() {
    return this.fps;
  }
}
