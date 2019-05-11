
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
uniform sampler2D texture0;

uniform vec3 lightPos;
uniform vec3 cameraPos;
uniform vec3 rimPower;

void main() {
  vec2 power = rimPower.xy;

  vec3 eyeVector = normalize(cameraPos - vPosition);
  vec3 lightVector = normalize(vPosition - lightPos);
  vec3 vnNormal = normalize(vNormal);

  vec2 offset = vnNormal.xy - eyeVector.xy;
  offset.y *= -1.0;

  float p = dot(vNormal, eyeVector);

  mat4 matrix = mat4(1.0);

  matrix[3][0] = offset.x;// * power.x * p;
  matrix[3][1] = offset.y;// * power.y * p;

  vec4 screenPosition = vec4(vPosition, 1.0) * matrix;

  gl_FragColor = texture2D(texture0, vUv);//texture2DProj(texture0, screenPosition);
}
