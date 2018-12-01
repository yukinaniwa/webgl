// https://qiita.com/_nabe/items/1657d9556591284a43c8

// varying: fragment shader に送るもの
// viewMatrix と cameraPosition 送らなくても fsh で使える

uniform mat4 currentViewMatrix;
uniform mat4 prevViewMatrix;

void main() {

    vec4 vertex = vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vertex;
}
