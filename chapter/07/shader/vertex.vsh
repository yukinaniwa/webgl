// https://qiita.com/_nabe/items/1657d9556591284a43c8

// varying: fragment shader に送るもの
// viewMatrix と cameraPosition 送らなくても fsh で使える

varying mat4 vModelMatrix;       // オブジェクト座標からワールド座標へ変換する
varying mat4 vModelViewMatrix;   // modelMatrixとviewMatrixの積算
varying mat4 vProjectionMatrix;  // カメラの各種パラメータから３次元を２次元に射影し、クリップ座標系に変換する行列
varying mat4 vNormalMatrix;      // 頂点法線ベクトルを視点座標系に変換する行列
varying vec3 vPosition;          // 頂点座標
varying vec3 vNormal;            // 頂点法線ベクトル
varying vec2 vUv;                // テクスチャを貼るためのUV座標

void main() {
  vUv = uv;
  vNormal = normal;
  vPosition = position;
  vProjectionMatrix = projectionMatrix;
  vModelViewMatrix = modelViewMatrix;

  //gl_Position = vec4(vPosition, 1.0);
  gl_Position = vProjectionMatrix * vModelViewMatrix * vec4(vPosition, 1.0);
}
