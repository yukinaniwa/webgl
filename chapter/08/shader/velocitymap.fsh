// https://qiita.com/_nabe/items/1657d9556591284a43c8

// varying: fragment shader に送るもの
// viewMatrix と cameraPosition 送らなくても fsh で使える

uniform sampler2D texture1;
uniform float heightScale;

void main() {
  gl_FragColor = vec4(vec3(1.0, 0.0, 1.0), 1.0);
}
