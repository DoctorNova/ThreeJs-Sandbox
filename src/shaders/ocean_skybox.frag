precision mediump float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iCameraForward;
uniform vec3 iCameraUp;
uniform vec3 iCameraPosition;
uniform vec3 iLightPosition;
uniform float iDeepSeeDepth;

varying vec2 vUV;
varying vec3 lightDirection;

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed)
{
	vec2 sourceToCoord = coord - raySource;
	float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
	
	return clamp(
		(0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
		(0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
		0.0, 1.0) *
		clamp((iResolution.x - length(sourceToCoord)) / iResolution.x, 0.5, 1.0);
}

vec4 GodRays( vec2 fragCoord )
{
  // Calculate from where the light is comming (send by god from above of course)
  //vec3 lightDirection = normalize(iLightPosition - iCameraPosition);
  //vec3 cameraRight = normalize(cross(iCameraUp, iCameraForward));
  //vec2 lightDirectionNdc = (dot(iCameraForward.xy, vec2(0, 1)) * cameraRight).xz;

	vec2 uv = vUV;
	vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

	// Set the parameters of the sun rays
	vec2 rayPos1 = vec2(iResolution.x * 0.7, iResolution.y * -0.4);
	vec2 rayRefDir1 = normalize(vec2(1.0, -0.116));
	float raySeedA1 = 36.2214;
	float raySeedB1 = 21.11349;
	float raySpeed1 = 1.5;
	
	vec2 rayPos2 = rayPos1 + vec2(iResolution.x * 0.1, iResolution.y * -0.2);
	vec2 rayRefDir2 = normalize(vec2(1.0, 0.241));
	const float raySeedA2 = 22.39910;
	const float raySeedB2 = 18.0234;
	const float raySpeed2 = 1.1;
	
	// Calculate the colour of the sun rays on the current fragment
	vec4 rays1 =
		vec4(1.0, 1.0, 1.0, 1.0) *
		rayStrength(rayPos1, rayRefDir1, coord, raySeedA1, raySeedB1, raySpeed1);
	 
	vec4 rays2 =
		vec4(1.0, 1.0, 1.0, 1.0) *
		rayStrength(rayPos2, rayRefDir2, coord, raySeedA2, raySeedB2, raySpeed2);
	
	vec4 fragRayColor = rays1 * 0.5 + rays2 * 0.4;
	
	// Attenuate brightness towards the bottom, simulating light-loss due to depth.
	// Give the whole thing a blue-green tinge as well.
	float brightness = 1.0 - (coord.y / iResolution.y);
	fragRayColor.x *= 0.1 + (brightness * 0.8);
	fragRayColor.y *= 0.3 + (brightness * 0.6);
	fragRayColor.z *= 0.5 + (brightness * 0.5);

  return fragRayColor;
}

void main()
{
  vec3 seaColor = vec3(0.18, 0.29, 0.52);
  vec3 surfaceSeaColor = vec3(100.0, 229.0, 255.0) / 255.0;
  vec3 deepSeaColor = vec3(0.01, 0.02, 0.08); // Very dark blue
  vec2 ndc = vUV * 2.0 - 1.0;

  float depthFactor = 0.0;
  if (cameraPosition.y < 0.0) {
    depthFactor = clamp(-cameraPosition.y / iDeepSeeDepth, 0.0, 1.0);
  }

  float lookingUp = dot(normalize(iCameraForward), vec3(0, 1, 0));
  float modifier = lookingUp * 0.25;
  vec3 background = mix(seaColor, surfaceSeaColor, modifier + ndc.y);
  vec4 rays = GodRays(gl_FragCoord.xy);

  vec3 finalColor = rays.rgb * rays.a * max(0.1, 1.0 - depthFactor) + mix(background, deepSeaColor, depthFactor);

  gl_FragColor = vec4(finalColor, 1);
}