// = object.matrixWorld
// uniform mat4 modelMatrix;

// = camera.matrixWorldInverse * object.matrixWorld
// uniform mat4 modelViewMatrix;

// = camera.projectionMatrix
// uniform mat4 projectionMatrix;

// = camera.matrixWorldInverse
// uniform mat4 viewMatrix;

// = inverse transpose of modelViewMatrix
// uniform mat3 normalMatrix;

// = camera position in world space
// uniform vec3 cameraPosition;

// default vertex attributes provided by BufferGeometry
// attribute vec3 position;
// attribute vec3 normal;
// attribute vec2 uv;

varying vec2 vUV;

void main()
{
  vec4 pos = projectionMatrix * vec4(position, 1.0);
  gl_Position = vec4(pos.xy, pos.w, pos.w); // z = w ⇒ depth = 1

  vUV = uv;
}