// https://qiita.com/_nabe/items/1657d9556591284a43c8

// window.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

function init() {
  const width = window.parent.screen.width;
  const height = window.parent.screen.height;

  const renderer = initRenderer(width, height);
  const scene = initScene(width, height);
  const camera = initCamera(width, height, 0, 50, -200);
  initCameraControls(renderer, camera, 0, 32, 32);
  const stats = attachFpsView()

  var progress_timer = 0;
  var checkBuffer = 0;

  // RENDER TARGET
  var renderTarget = new RenderTarget(width, height, scene, camera);
  var renderTargetMap = renderTarget.capture(renderer);

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
      this.lightspeed = 1;
      this.coefRefractive = 0.0;
      this.isDebugColorMode = false;
  };
  var gui = new dat.GUI( { autoPlace: true } );
  gui.add(controls, 'coefRefractive', -3.0, 3.0);
  gui.add(controls, 'isDebugColorMode');

  // light
  const light = new THREE.DirectionalLight(0xFFFFFF);
  light.intensity = 1.0;
  light.position.set(1, 3, 2);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0xFFFFFF);
  scene.add(ambientLight);

  // 光源位置に配置する
  var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(768), new THREE.MeshPhongMaterial({
    color: 0xFDB813
  }));
  scene.add(sphereMesh);

  // SHADER
  var vLightPosition = new THREE.Vector3();
  var texture = new THREE.TextureLoader().load( '../textures/cubemap/posy.jpg' );

  let stealthShader = new THREE.ShaderMaterial({
    vertexShader: loadShaderFile("shader/vertex.vsh"),
    fragmentShader: loadShaderFile("shader/stealth.fsh"),
    uniforms:{
      texture0: { type: "t", value: texture },
      lightPos: {type: "v3", value: vLightPosition},
      cameraPos: {type: "v3", value: camera.position},
      objColor: { type: "v3", value: new THREE.Vector3(1, 1, 1) },
      coefficient: { type: "float", value: controls.coefficient },
    },
    // side: THREE.DoubleSide,
  });

  // COLLADA
  const loader = new THREE.ColladaLoader();
  var bunnyModel;
  loader.load('../models/bunny.dae', (collada) => {
    bunnyModel = collada.scene;
    bunnyModel.scale.set(50,50,50);
    bunnyModel.position.set(-50,0,0);

    bunnyModel.children.forEach(function(childModel) {
      childModel.material = stealthShader;
    });

    scene.add(bunnyModel);
  });

  var dragonModel;
  loader.load('../models/dragon.dae', (collada) => {
    dragonModel = collada.scene;
    dragonModel.scale.set(50,50,50);
    dragonModel.position.set(50,0,0);

    dragonModel.children.forEach(function(childModel) {
      childModel.material = stealthShader;
    });

    scene.add(dragonModel);
  });

  // render progress
  tick();

  function tick() {
    requestAnimationFrame(tick);

    progress_timer += (0.016*controls.lightspeed);

    camera.updateProjectionMatrix();

    if(checkBuffer < 5) {
      renderTargetMap = renderTarget.capture(renderer);
    }
    // checkBuffer++;

    // 移動行列を作成
    var mTrans = new THREE.Matrix4();
    mTrans.makeTranslation(40000, 30000, 0);

    // 回転行列を作成
    var mRotate = new THREE.Matrix4();
    mRotate.makeRotationAxis( new THREE.Vector3(0, 1, 0), progress_timer);

    // 移動行列 * 回転行列をした行列から
    // 移動成分を抽出する
    var mLightPosition = mRotate.multiply(mTrans);
    vLightPosition.setFromMatrixPosition(mLightPosition);

    stealthShader.uniforms['isObjColor'] = { type: "bool", value: controls.isDebugColorMode };
    stealthShader.uniforms['coefficient'] = { type: "float", value: controls.coefRefractive};
    stealthShader.uniforms['texture0'] = { type: "t", value: renderTargetMap.texture };

    // 光源の位置に設定
    sphereMesh.position.set(vLightPosition.x,vLightPosition.y,vLightPosition.z);

    renderer.render(scene, camera);
    stats.update();
  }
}

///////////////////////////////////////////////////////////////////////////////
/**
  Render Target
*/
class RenderTarget {
  constructor(width, height, scene, camera) {

    this.bufferWidth = width;
    this.bufferHeight = height;

    this.bufferScene = scene;
    this.cameraTarget = camera;

    this.renderTarget = new THREE.WebGLRenderTarget(this.bufferWidth, this.bufferHeight, {
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter
    });
  }

  capture(renderer) {

    renderer.render(this.bufferScene, this.cameraTarget, this.renderTarget);

    return this.renderTarget;
  }
}
