// https://qiita.com/_nabe/items/1657d9556591284a43c8

varying vec3 vEyeVector;
varying vec4 vTextureCoords;

uniform float coefficient;

void main() {
  mat4 tMatrix = mat4(1.0);
  tMatrix = mat4(
    vec4(0.5, 0.0, 0.0, 0.0),
    vec4(0.0, 0.5, 0.0, 0.0),
    vec4(0.0, 0.0, 1.0, 0.0),
    vec4(0.5, 0.5, 0.0, 1.0)
  );

  mat4 tvpMatrix = tMatrix * projectionMatrix;
  tMatrix = tvpMatrix * viewMatrix;

  vec3 modelPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vec3 modelNormal = normalize((modelMatrix * vec4(normal, 1.0)).xyz);
  vTextureCoords   = tMatrix * vec4(modelPosition + modelNormal * coefficient, 1.0);

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position , 1.0);
}
