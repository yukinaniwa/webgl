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
      this.isHalfLambert = false;
  };
  var gui = new dat.GUI( { autoPlace: true } );
  gui.add(controls, 'isHalfLambert', true).onChange(setIsHalfLambert);
  function setIsHalfLambert() {
    if( !controls.isHalfLambert ) {
      colladaModel.children.forEach(function(childModel) {
        childModel.material = materialLambert;
      });
    } else {
      colladaModel.children.forEach(function(childModel) {
        childModel.material = materialHalfLambert;
      });
    }
  }

  // light
  const light = new THREE.DirectionalLight(0xFFFFFF);
  light.intensity = 1.0;
  light.position.set(1, 3, 2);
  scene.add(light);

  // 光源位置に配置する
  var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry( 8, 64, 64), new THREE.MeshPhongMaterial({
    color: 0xFDB813
  }));
  scene.add(sphereMesh);

  // SHADER
  var vLightPosition = new THREE.Vector3();
  let materialLambert = new THREE.ShaderMaterial({
    vertexShader: loadShaderFile("shader/vertex.vsh"),
    fragmentShader: loadShaderFile("shader/lambert.fsh"),
    uniforms:{
      lightPos: {type: "v3", value: vLightPosition},
    },
  });

  let materialHalfLambert = new THREE.ShaderMaterial({
    vertexShader: loadShaderFile("shader/vertex.vsh"),
    fragmentShader: loadShaderFile("shader/half_lambert.fsh"),
    uniforms:{
      lightPos: {type: "v3", value: vLightPosition},
    },
  });

  // COLLADA
  const loader = new THREE.ColladaLoader();
  var colladaModel;
  loader.load('../models/dragon.dae', (collada) => {
    colladaModel = collada.scene;
    colladaModel.scale.set(128,128,128);
    colladaModel.children.forEach(function(childModel) {
      childModel.material = materialLambert;
    });

    scene.add(colladaModel);
  });

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

    // 光源の位置に設定
    sphereMesh.position.set(vLightPosition.x,vLightPosition.y,vLightPosition.z);
    
    renderer.render(scene, camera);
    stats.update();
  }
}
