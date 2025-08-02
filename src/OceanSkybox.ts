import { Vector3 } from "three";
import type { Camera } from "three/src/cameras/Camera.js";
import { DoubleSide } from "three/src/constants.js";
import { BoxGeometry } from "three/src/geometries/BoxGeometry.js";
import { CubeTextureLoader } from "three/src/loaders/CubeTextureLoader.js";
import { ShaderMaterial } from "three/src/materials/ShaderMaterial.js";
import { Vector2 } from "three/src/math/Vector2.js";
import { Mesh } from "three/src/objects/Mesh.js";
import { UniformsUtils } from "three/src/renderers/shaders/UniformsUtils.js";
import { scene } from "./Game";
import { RendererSetup } from "./RendererSetup";
import fragmentShader from './shaders/ocean_skybox.frag?raw';
import vertexShader from './shaders/ocean_skybox.vert?raw';

export function LoadSkybox() {
  const loader = new CubeTextureLoader();
  const texture = loader.load([
    'assets/skybox/CubeMap_Right.png',
    'assets/skybox/CubeMap_Left.png',
    'assets/skybox/CubeMap_Top.png',
    'assets/skybox/CubeMap_Bottom.png',
    'assets/skybox/CubeMap_Front.png',
    'assets/skybox/CubeMap_Back.png',
  ]);
  scene.background = texture;
}

class OceanSkybox extends Mesh {

	/**
	 * Constructs a new oceandome.
	 */
	constructor() {

		const shader = OceanSkybox.#Shader;

		const material = new ShaderMaterial( {
			name: shader.name,
			uniforms: UniformsUtils.clone( shader.uniforms ),
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			side: DoubleSide,
			depthWrite: false
		} );

		super( new BoxGeometry( 1, 1 ), material );

    this.frustumCulled = false;
    this.onBeforeRender = (
            _renderer,
            _scene,
            camera: Camera,
            //geometry: BufferGeometry,
            //material: Material,
            //group: Group
            ) => {
      material.uniforms.iResolution.value = camera.viewport;
      material.uniforms.iTime.value = RendererSetup.GetTime();
      camera.getWorldDirection(material.uniforms.iCameraForward.value);
    }
	}

  static #Shader = {
    name: "OceanSkyboxShader",
    uniforms: {
      iCameraForward: { value: new Vector3(0, 0, -1)},
      iResolution: { value: new Vector2(1920, 1080) },
      iTime: { value: 0}
    },
    vertexShader,
    fragmentShader,
  };

}

export { OceanSkybox };
