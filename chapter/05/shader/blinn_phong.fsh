
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
uniform vec3 cameraPos;
uniform vec3 specularPower;

void main() {
  vec3 eyeVector = normalize(cameraPos - vPosition);
  vec3 lightVector = normalize(vPosition - lightPos);

  float NdotL = max(0.0, dot(vNormal, lightVector));
  // R = L + 2 * N * (N ・L)
  // H=(ViewDir + L)/|ViewDir+L|
  vec3 R = (eyeVector + lightVector) / eyeVector + lightVector;
  float spec = pow(max(0.0, dot(R, eyeVector)), specularPower.x);

  vec3 phong = NdotL + spec + vec3(0.1, 0.1, 0.1);

  gl_FragColor = vec4(phong, 1.0);
}
