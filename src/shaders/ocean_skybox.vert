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
  // this only works with planes
  // Mode range for plane [-0.5 to 0.5] to ndc [-1, 1]
  vec3 pos = position * 2.0f;
  gl_Position = vec4(pos.xy, 1, 1);

  vUV = uv;
}