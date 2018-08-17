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

    vec4 waveMap = texture2D(texture1, uv);
    vec3 normal = waveMap.xyz;
    float height = 1.0-waveMap.w;

    vec4 vertex = vec4(normal * ((height*height*height)*heightScale*512.0) + position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vertex;
}
