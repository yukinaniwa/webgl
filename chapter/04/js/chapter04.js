// https://qiita.com/_nabe/items/1657d9556591284a43c8

// window.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

function init() {
  const width = 960;
  const height = 540;

  const renderer = initRenderer(width, height);
  const scene = initScene(width, height);
  const camera = initCamera(width, height, 0, 100, -400);
  initCameraControls(renderer, camera, 0, 32, 32);
  const stats = attachFpsView()

  //
  var progress_timer = 0;

  var cubeTexture = new THREE.CubeTextureLoader()
  	.setPath('../textures/cubemap/')
  	.load( [
  		'posx.jpg',
  		'negx.jpg',
  		'posy.jpg',
  		'negy.jpg',
  		'posz.jpg',
  		'negz.jpg'
  	] );
  scene.background = cubeTexture;

  // GUI
  var controls = new function () {
      this.power = 4.0;
  };
  var gui = new dat.GUI( { autoPlace: true } );
  gui.add(controls, 'power', 0.5, 8.0);

  // light
  const light = new THREE.DirectionalLight(0xFFFFFF);
  light.intensity = 1.0;
  light.position.set(1, 3, 2);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0xFFFFFF);
  scene.add(ambientLight);

  // 光源位置に配置する
  var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry( 8, 64, 64), new THREE.MeshPhongMaterial({
    color: 0xFDB813
  }));
  scene.add(sphereMesh);

  // SHADER
  var vLightPosition = new THREE.Vector3();

  var rimPower = new THREE.Vector3();
  let rimLighting = new THREE.ShaderMaterial({
    vertexShader: loadShaderFile("shader/vertex.vsh"),
    fragmentShader: loadShaderFile("shader/rim_lighting.fsh"),
    uniforms:{
      lightPos: {type: "v3", value: vLightPosition},
      cameraPos: {type: "v3", value: camera.position},
      rimPower: {type: "v3", value: rimPower},
    },
  });

  // COLLADA
  const loader = new THREE.ColladaLoader();
  var colladaModel;
  loader.load('../models/bunny.dae', (collada) => {
    colladaModel = collada.scene;
    colladaModel.scale.set(128,128,128);
    colladaModel.position.set(0,0,0);

    colladaModel.children.forEach(function(childModel) {
      childModel.material = rimLighting;
    });
    scene.add(colladaModel);
  });

  // progress
  tick();

  function tick() {
    requestAnimationFrame(tick);

    progress_timer += 0.016;

    // 移動行列を作成
    var mTrans = new THREE.Matrix4();
    mTrans.makeTranslation(320, 220, 0);

    // 回転行列を作成
    var mRotate = new THREE.Matrix4();
    mRotate.makeRotationAxis( new THREE.Vector3(0, 1, 0), progress_timer);

    // 移動行列 * 回転行列をした行列から
    // 移動成分を抽出する
    var mLightPosition = mRotate.multiply(mTrans);
    vLightPosition.setFromMatrixPosition(mLightPosition);

    //
    rimPower.set(controls.power,controls.power,controls.power);

    // 光源の位置に設定
    sphereMesh.position.set(vLightPosition.x,vLightPosition.y,vLightPosition.z);

    renderer.render(scene, camera);
    stats.update();
  }
}
