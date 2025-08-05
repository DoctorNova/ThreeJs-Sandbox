import {
  type Camera,
  DoubleSide,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  UniformsUtils,
  Vector2,
  Vector3,
} from 'three';
import { deepSeeDepth, directionalLight } from "./Game";
import { RendererSetup } from "./RendererSetup";
import fragmentShader from './shaders/ocean_skybox.frag?raw';
import vertexShader from './shaders/ocean_skybox.vert?raw';

class OceanSkybox extends Mesh {

  /**
   * Constructs a new oceandome.
   */
  constructor() {

    const shader = OceanSkybox.#Shader;

    const material = new ShaderMaterial({
      name: shader.name,
      uniforms: UniformsUtils.clone(shader.uniforms),
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: DoubleSide,
      depthWrite: true,
    });

    super(new PlaneGeometry(), material);

    this.frustumCulled = false;

    this.onBeforeRender = (
      _renderer,
      _scene,
      camera: Camera,
      //geometry: BufferGeometry,
      //material: Material,
      //group: Group
    ) => {
      material.uniforms.iDeepSeeDepth.value = deepSeeDepth;
      material.uniforms.iTime.value = RendererSetup.GetTime();
      material.uniforms.iResolution.value = new Vector2(_renderer.domElement.width, _renderer.domElement.height);
      
      directionalLight.getWorldPosition(material.uniforms.iLightPosition.value);
      camera.getWorldPosition(material.uniforms.iCameraPosition.value);
      camera.getWorldDirection(material.uniforms.iCameraForward.value);
      material.uniforms.iCameraUp.value = camera.up;
    }
  }

  static #Shader = {
    name: "OceanSkyboxShader",
    uniforms: {
      iDeepSeeDepth: { value: 100 },
      iTime: { value: 0 },
      iResolution: { value: new Vector2(1920, 1080) },
      iLightPosition: { value: new Vector3(0, 1, 0) },
      iCameraPosition: { value: new Vector3(0, 0, 0) },
      iCameraForward: { value: new Vector3(0, 0, -1) },
      iCameraUp: { value: new Vector3(0, 1, 0) }
    },
    vertexShader,
    fragmentShader,
  };

}

export { OceanSkybox };
