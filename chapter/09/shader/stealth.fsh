varying vec4 vTextureCoords;

// uniforms 外から定義して送るもの
uniform sampler2D texture0;

void main() {
  vec4 smpColor  = texture2DProj(texture0, vTextureCoords);
  gl_FragColor   = smpColor;
}
