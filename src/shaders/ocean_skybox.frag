precision mediump float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iCameraForward;

varying vec2 vUV;

#define GOD_RAY_LENGTH 1.1 // higher number = shorter rays
#define GOD_RAY_FREQUENCY 28.0

float GodRays(  in vec2 ndc, in vec2 uv) {
    vec2 godRayOrigin = ndc + vec2(-1.15, -1.25);
    float rayInputFunc = atan(godRayOrigin.y, godRayOrigin.x) * 0.63661977236; // that's 2/pi
    float light = (sin(rayInputFunc * GOD_RAY_FREQUENCY + iTime * -2.25) * 0.5 + 0.5);
    light = 0.5 * (light + (sin(rayInputFunc * 13.0 + iTime) * 0.5 + 0.5));
    //light *= (sin(rayUVFunc * 8.0 + -iTime * 0.25) * 0.5 + 0.5);
    light *= pow(clamp(dot(normalize(-godRayOrigin), normalize(ndc - godRayOrigin)), 0.0, 1.0), 2.5);
    light *= pow(uv.y, GOD_RAY_LENGTH);
    light = pow(light, 1.75);
    return light;
}

void main()
{
  float lookingUp = dot(normalize(iCameraForward), vec3(0, 1, 0));
  vec2 ndc = vUV * 2.0 - 1.0;
  vec3 background = mix(vec3(0.1, 0.3, 0.5), vec3(0.788, 0.956, 1.0), ndc.y + lookingUp * 0.5);
  vec3 lightColor = mix(vec3(0.1, 0.3, 0.5), vec3(0.788, 0.956, 1.0) * 0.75, 1.0 - ndc.y);
  float godrays = GodRays(ndc, vUV);
  background = mix(background, lightColor, (godrays + 0.05)/1.05);
  gl_FragColor = vec4(background, 1);
}