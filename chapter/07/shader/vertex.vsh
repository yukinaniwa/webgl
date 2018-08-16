// https://qiita.com/_nabe/items/1657d9556591284a43c8

// varying: fragment shader に送るもの
// viewMatrix と cameraPosition 送らなくても fsh で使える

attribute vec4 tangent;

uniform sampler2D texture1;
uniform float heightScale;

// varying
varying vec2 vUv;
varying vec4 vTangent;
varying vec3 vVertex;
varying mat4 vModelViewMatrix;

void main() {
    vUv = uv;
    vTangent = tangent;
    vModelViewMatrix = modelViewMatrix;

    float height = texture2D(texture1, uv).w;
    vec3 p = position;
    p.z += (height * 0.02);

    vec4 vertex = vec4(p, 1.0);
    vVertex = vec3(modelViewMatrix * vertex);

    gl_Position = projectionMatrix * modelViewMatrix * vertex;
}
