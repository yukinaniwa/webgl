
// varying: fragment shader に送るもの
// viewMatrix と cameraPosition 送らなくても fsh で使える
precision mediump float;

varying vec2 vUv;
varying vec3 vVertex;
varying mat4 vModelViewMatrix;

varying vec3 vEyePosition;
varying vec3 vLightPosition;

// uniforms 外から定義して送るもの
uniform sampler2D texture0;
uniform sampler2D texture1;

uniform float opacity;
uniform float normalScale;
uniform vec3 ambientColor;

uniform float maxHeightBias;
uniform float specular;
uniform float specularPower;

void main() {
  vec2 fUv = vUv;
  vec4 waveMap = texture2D(texture1, vUv);
  vec4 albedo = texture2D(texture0, vUv);

  float height = waveMap.w * normalScale;
  vec2 tex = vUv + maxHeightBias * height * vEyePosition.xy;

  // normal range [0.0-1.0]
  vec3 normal = 2.0 * waveMap.xyz - 1.0;

  vec3 H = normalize(vLightPosition+vEyePosition);

  float HL = dot(H, normal) * 0.5 + 0.5;
  float HA = dot(normal, vLightPosition) * 0.5 + 0.5;
  float s = pow(HL, specular) * specularPower;
  vec3 ambient = max(ambientColor, HA);

  vec3 finalColor = albedo.rgb * ambient.rgb + s;
  gl_FragColor = vec4(finalColor, opacity);

}
