import type { Camera } from "three/src/cameras/Camera.js";
import { DoubleSide } from "three/src/constants.js";
import { PlaneGeometry } from "three/src/geometries/Geometries.js";
import { ShaderMaterial } from "three/src/materials/ShaderMaterial.js";
import { Vector3 } from "three/src/math/Vector3.js";
import { Mesh } from "three/src/objects/Mesh.js";
import { UniformsUtils } from "three/src/renderers/shaders/UniformsUtils.js";
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
      const cameraForward = new Vector3();
      camera.getWorldDirection(cameraForward);
      material.uniforms.iCameraForward.value = cameraForward;
    }
  }

  static #Shader = {
    name: "OceanSkyboxShader",
    uniforms: {
      iCameraForward: { value: new Vector3(0, 0, -1) },
    },
    vertexShader,
    fragmentShader,
  };

}

export { OceanSkybox };
