
// varying: fragment shader に送るもの
// viewMatrix と cameraPosition 送らなくても fsh で使える
precision mediump float;

varying vec2 vUv;                // テクスチャを貼るためのUV座標

uniform vec2 textureOffset;
uniform sampler2D texture0;

void main(){

    vec2 uv = vUv.xy;
    vec4 wave = texture2D(texture0, uv);

    float h1 = texture2D(texture0, uv + vec2(textureOffset.x, 0.0)).r;
    float h2 = texture2D(texture0, uv + vec2(0.0, textureOffset.y)).r;
    float h3 = texture2D(texture0, uv + vec2(-textureOffset.x, 0.0)).r;
    float h4 = texture2D(texture0, uv + vec2(0.0, -textureOffset.y)).r;

    float tu = 0.5 * (h3 - h1) + 0.5;
    float tv = 0.5 * (h4 - h2) + 0.5;

    gl_FragColor = vec4(tu, tv, 1.0, wave.r * 0.5 + 0.5);
}
