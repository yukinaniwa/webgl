
// varying: fragment shader に送るもの
// viewMatrix と cameraPosition 送らなくても fsh で使える
precision mediump float;

varying mat4 vModelMatrix;       // オブジェクト座標からワールド座標へ変換する
varying mat4 vModelViewMatrix;   // modelMatrixとviewMatrixの積算
varying mat4 vProjectionMatrix;  // カメラの各種パラメータから３次元を２次元に射影し、クリップ座標系に変換する行列
varying mat4 vNormalMatrix;      // 頂点法線ベクトルを視点座標系に変換する行列
varying vec3 vPosition;          // 頂点座標
varying vec3 vNormal;            // 頂点法線ベクトル
varying vec2 vUv;                // テクスチャを貼るためのUV座標

// uniforms 外から定義して送るもの
uniform vec3 lightPos;
uniform vec3 cameraPos;

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
