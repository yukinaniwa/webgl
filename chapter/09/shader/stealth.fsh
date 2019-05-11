varying vec4 vTextureCoords;

// uniforms 外から定義して送るもの
uniform sampler2D texture0;

uniform vec3 objColor;

void main() {
  vec3 stealthColor = texture2DProj(texture0, vTextureCoords).xyz * objColor;

  gl_FragColor = vec4(stealthColor, 1.0);
}
