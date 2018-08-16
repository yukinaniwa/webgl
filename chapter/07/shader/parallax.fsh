
// varying: fragment shader に送るもの
// viewMatrix と cameraPosition 送らなくても fsh で使える
precision mediump float;

varying vec2 vUv;
varying vec4 vTangent;
varying vec3 vVertex;
varying mat4 vModelViewMatrix;

// uniforms 外から定義して送るもの
uniform float opacity;
uniform vec3 f_lightPosition;
uniform vec3 f_cameraPosition;
uniform sampler2D texture0;
uniform sampler2D texture1;
uniform float scale;
uniform float bias;
uniform float lightIntensity;
uniform vec3 lightColor;
uniform vec3 ambientColor;

void main() {
  vec2 fUv = vUv;
  vec4 waveMap = texture2D(texture1, vUv);
  vec4 color = texture2D(texture0, vUv);

  vec3 normal = normalize(waveMap.xyz);
  float height = waveMap.w * scale + bias;

  vec3 vLightPosition = vec3(vModelViewMatrix * vec4(f_lightPosition, 1.0));
  vec3 vCameraPosition = vec3(vModelViewMatrix * vec4(f_cameraPosition, 1.0));

  vec3 lightVector = normalize(vVertex.xyz - vLightPosition);

  vec3 tangent = normalize(vTangent.xyz);
  vec3 binormal = normalize( cross(normal, tangent) * vTangent.w );
  mat3 TBN = mat3(tangent, binormal, normal);

  vec3 tsNormal = TBN * normal;
  vec3 tsPosition = TBN * vVertex;
  vec3 tsLightPosition = TBN * vLightPosition;
  vec3 tsEyePosition = TBN * (vCameraPosition - vVertex);

  vec2 eyeVector = normalize(tsEyePosition.xy);
  fUv = vUv + height;// + (eyeVector * height);
  color = texture2D(texture0, fUv);

  vec3 lightDirection = tsPosition - tsLightPosition;
  //vec3 lightVector = normalize(lightDirection);
  vec3 diffuse = (lightColor * lightIntensity) * max(dot(lightVector, normal), 0.0);
  vec3 ambient = ambientColor * lightIntensity;
  vec3 intensity = ambient + diffuse;

  float lambert = dot(lightVector, normal) * 0.5 + 0.5;

  //gl_FragColor = vec4(vec3(intensity), 1.0);
  //gl_FragColor = vec4(vec3(color.rgb), 1.0);
  gl_FragColor = vec4(color.rgb * intensity, opacity);
}
