// https://qiita.com/_nabe/items/1657d9556591284a43c8

varying vec3 vEyeVector;
varying vec4 vTextureCoords;

uniform float coefficient;

void main() {
  mat4 textureMatrix = mat4(
    vec4(0.5, 0.0, 0.0, 0.0),
    vec4(0.0, 0.5, 0.0, 0.0),
    vec4(0.0, 0.0, 1.0, 0.0),
    vec4(0.5, 0.5, 0.0, 1.0)
  );

  mat4 textureViewProjectionMatrix = textureMatrix * projectionMatrix;
  textureMatrix = textureViewProjectionMatrix * viewMatrix;

  vec3 modelPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vec3 modelNormal = normalize((modelMatrix * vec4(normal, 1.0)).xyz);
  vTextureCoords   = textureMatrix * vec4(modelPosition + modelNormal * (coefficient * 0.64), 1.0);

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position , 1.0);
}
