
// varying: fragment shader に送るもの
// viewMatrix と cameraPosition 送らなくても fsh で使える
precision mediump float;

varying vec2 vUv;                // テクスチャを貼るためのUV座標

// uniforms 外から定義して送るもの
uniform float addWaveHeight;
uniform vec2 addWavePos;
uniform float springPower;
uniform vec2 textureOffset;
uniform sampler2D texture0;
uniform float change;

void main(){

    vec2 uv = vUv.xy;
    vec4 wave = texture2D(texture0, uv);

    float h1 = texture2D(texture0, uv + vec2(textureOffset.x, 0.0)).r;
    float h2 = texture2D(texture0, uv + vec2(0.0, textureOffset.y)).r;
    float h3 = texture2D(texture0, uv + vec2(-textureOffset.x, 0.0)).r;
    float h4 = texture2D(texture0, uv + vec2(0.0, -textureOffset.y)).r;

    float v = ((h1 + h2 + h3 + h4) * 0.25 - wave.r) * springPower + wave.g;
    float h = wave.r + v;

    float dist = distance(uv, addWavePos);
    if( dist < 0.008 ){
      v += addWaveHeight;
    }

    // 係数をもとに補正
    h = h - h*0.0086;
    v = v - v*0.0048;

    gl_FragColor = vec4(h, v, 1.0, 1.0);
}
