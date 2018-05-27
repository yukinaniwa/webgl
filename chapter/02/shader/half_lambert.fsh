
// varying: fragment shader に送るもの
// viewMatrix と cameraPosition 送らなくても fsh で使える

varying mat4 vModelMatrix;       // オブジェクト座標からワールド座標へ変換する
varying mat4 vModelViewMatrix;   // modelMatrixとviewMatrixの積算
varying mat4 vProjectionMatrix;  // カメラの各種パラメータから３次元を２次元に射影し、クリップ座標系に変換する行列
varying mat4 vNormalMatrix;      // 頂点法線ベクトルを視点座標系に変換する行列
varying vec3 vPosition;          // 頂点座標
varying vec3 vNormal;            // 頂点法線ベクトル
varying vec2 vUv;                // テクスチャを貼るためのUV座標

// uniforms 外から定義して送るもの
uniform vec3 lightPos;

void main() {
  vec3 lightVector = normalize(lightPos - vPosition);
  float half_lambert = dot(lightVector, vNormal) * 0.5 + 0.5;

  gl_FragColor = vec4(vec3(half_lambert), 1.0);
}
