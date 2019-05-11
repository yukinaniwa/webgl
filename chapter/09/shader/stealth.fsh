varying vec4 vTextureCoords;

// uniforms 外から定義して送るもの
uniform sampler2D texture0;

uniform bool isObjColor;

void main() {

  vec3 color = vec3(0.08, 0.5, 0.109) + (vTextureCoords.xyz * vec3(0.00168) * 0.648);
  if( isObjColor == false ) { color = vec3(1.0); }
  
  vec3 stealthColor = texture2DProj(texture0, vTextureCoords).xyz * color;

  gl_FragColor = vec4(stealthColor, 1.0);
}
