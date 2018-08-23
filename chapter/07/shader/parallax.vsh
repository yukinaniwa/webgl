// https://qiita.com/_nabe/items/1657d9556591284a43c8

// varying: fragment shader に送るもの
// viewMatrix と cameraPosition 送らなくても fsh で使える

uniform sampler2D texture1;
uniform float heightScale;
uniform vec3 v_lightPosition;

// varying
varying vec2 vUv;
varying vec3 vVertex;
varying mat4 vModelViewMatrix;
varying vec3 vEyePosition;
varying vec3 vLightPosition;

void main() {
    vUv = uv;
    vModelViewMatrix = modelViewMatrix;
    vec4 waveMap = texture2D(texture1, uv);

    // T B N
    vec3 normal = waveMap.xyz;
    vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
    vec3 binormal = normalize( cross(normal, tangent) * 1.0 );

    // calc eye vector
    vec3 eye = normalize(cameraPosition.xyz - position.xyz);
    vEyePosition.x = dot(eye, tangent);
    vEyePosition.y = dot(eye, binormal);
    vEyePosition.z = dot(eye, normal);
    vEyePosition = normalize(vEyePosition);

    // calc light vector
    vec3 light = -v_lightPosition.xyz;
    vLightPosition.x = dot(light, tangent);
    vLightPosition.y = dot(light, binormal);
    vLightPosition.z = dot(light, normal);
    vLightPosition = normalize(vLightPosition);

    // displacement mapping
    float height = 1.0-waveMap.w;

    vec4 vertex = vec4(normal * ((height*height*height)*heightScale*1024.0) + position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vertex;
}
