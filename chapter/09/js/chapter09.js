// https://qiita.com/_nabe/items/1657d9556591284a43c8

// window.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

var cubeTexturePath = '../textures/cubemap/'

// トーラスシェーダー生成
function torusMaterial(red, green, blue) {
  let materialHalfLambert = new THREE.ShaderMaterial({
    vertexShader: loadShaderFile("shader/lambert/vertex.vsh"),
    fragmentShader: loadShaderFile("shader/lambert/half_lambert.fsh"),
    uniforms:{
      materialColor: {type: "v3", value: new THREE.Vector3(red, green, blue) },
    },
  });

  return materialHalfLambert;
}

function init() {
  const width = window.parent.screen.width;
  const height = window.parent.screen.height;

  const renderer = initRenderer(width, height);
  const scene = initScene(width, height);
  const camera = initCamera(width, height, 0, 16, -360);
  initCameraControls(renderer, camera, 0, 32, 32);
  const stats = attachFpsView()

  var progress_timer = 0;

  // RENDER TARGET
  var renderTarget = new RenderTarget(renderer, width, height);
  var renderTargetMap = renderTarget.capture(renderer, camera, progress_timer);

  var cubeTexture = new THREE.CubeTextureLoader()
  	.setPath(cubeTexturePath)
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
      this.refractive = 0.0;
      this.isColorMode = false;
  };
  var gui = new dat.GUI( { autoPlace: true } );
  gui.add(controls, 'refractive', -12.0, 12.0);
  gui.add(controls, 'isColorMode');

  // SHADER
  var vLightPosition = new THREE.Vector3();
  var texture = new THREE.TextureLoader().load( '../textures/cubemap/posy.jpg' );

  let stealthShader = new THREE.ShaderMaterial({
    vertexShader: loadShaderFile("shader/vertex.vsh"),
    fragmentShader: loadShaderFile("shader/stealth.fsh"),
    uniforms:{
      texture0: { type: "t", value: texture },
      objColor: { type: "v3", value: new THREE.Vector3(1, 1, 1) },
      coefficient: { type: "float", value: controls.coefficient },
    },
  });

  // COLLADA
  const loader = new THREE.ColladaLoader();

  var dragonModel;
  loader.load('../models/dragon.dae', (collada) => {
    dragonModel = collada.scene;
    dragonModel.scale.set(108,108,108);
    dragonModel.position.set(0,0,0);

    dragonModel.children.forEach(function(childModel) {
      childModel.material = stealthShader;
    });

    scene.add(dragonModel);
  });

  var torusMeshForest = new THREE.Mesh(new THREE.TorusGeometry(48, 20, 24, 24));
  torusMeshForest.material = torusMaterial(34.0/255.0, 139.0/255.0, 34.0/255.0);
  scene.add(torusMeshForest);
  torusMeshForest.position.set(256,64,368);

  var torusMeshYellow = new THREE.Mesh(new THREE.TorusGeometry(48, 20, 24, 24));
  torusMeshYellow.material = torusMaterial(255.0/255.0, 165.0/255.0, 0.0/255.0);
  scene.add(torusMeshYellow);
  torusMeshYellow.position.set(0,64,512);

  var torusMeshBlue = new THREE.Mesh(new THREE.TorusGeometry(48, 20, 24, 24));
  torusMeshBlue.material = torusMaterial(0.0/255.0, 191.0/255.0, 255.0/255.0);
  scene.add(torusMeshBlue);
  torusMeshBlue.position.set(-256,64,368);

  // render progress
  tick();

  function tick() {
    requestAnimationFrame(tick);

    progress_timer += (0.024*controls.lightspeed);

    // light vector
    var mTrans = new THREE.Matrix4();
    mTrans.makeTranslation(320, 220, 0);
    var mRotate = new THREE.Matrix4();
    mRotate.makeRotationAxis( new THREE.Vector3(0, 1, 0), progress_timer);
    var mLightPosition = mRotate.multiply(mTrans);
    vLightPosition.setFromMatrixPosition(mLightPosition);

    renderTargetMap = renderTarget.capture(renderer, camera, progress_timer);

    torusMeshForest.rotation.set(progress_timer*1.8, progress_timer, 0);
    torusMeshYellow.rotation.set(progress_timer, 0, progress_timer*1.4);
    torusMeshBlue.rotation.set(progress_timer, progress_timer, 0);

    torusMeshForest.material.uniforms['lightPos'] = {type: "v3", value: vLightPosition};
    torusMeshYellow.material.uniforms['lightPos'] = {type: "v3", value: vLightPosition};
    torusMeshBlue.material.uniforms['lightPos'] = {type: "v3", value: vLightPosition};

    stealthShader.uniforms['isObjColor'] = { type: "bool", value: controls.isColorMode };
    stealthShader.uniforms['coefficient'] = { type: "float", value: controls.refractive };
    stealthShader.uniforms['texture0'] = { type: "t", value: renderTargetMap.texture };

    renderer.render(scene, camera);

    stats.update();
  }
}

///////////////////////////////////////////////////////////////////////////////
/**
  Render Target
*/
class RenderTarget {
  constructor(renderer, width, height) {

    this.bufferWidth = width;
    this.bufferHeight = height;

    this.bufferScene = initScene(width, height);
    this.renderTarget = new THREE.WebGLRenderTarget(this.bufferWidth, this.bufferHeight, {
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter
    });

    var cubeTexture = new THREE.CubeTextureLoader()
    	.setPath(cubeTexturePath)
    	.load( [
    		'posx.jpg',
    		'negx.jpg',
    		'posy.jpg',
    		'negy.jpg',
    		'posz.jpg',
    		'negz.jpg'
    	] );

    this.bufferScene.background = cubeTexture;

    this.vLightPosition = new THREE.Vector3();

    this.torusMeshForest = new THREE.Mesh(new THREE.TorusGeometry(48, 20, 24, 24));
    this.torusMeshForest.material = torusMaterial(34.0/255.0, 139.0/255.0, 34.0/255.0);
    this.bufferScene.add(this.torusMeshForest);
    this.torusMeshForest.position.set(256,64,368);

    this.torusMeshYellow = new THREE.Mesh(new THREE.TorusGeometry(48, 20, 24, 24));
    this.torusMeshYellow.material = torusMaterial(255.0/255.0, 165.0/255.0, 0.0/255.0);
    this.bufferScene.add(this.torusMeshYellow);
    this.torusMeshYellow.position.set(0,64,512);

    this.torusMeshBlue = new THREE.Mesh(new THREE.TorusGeometry(48, 20, 24, 24));
    this.torusMeshBlue.material = torusMaterial(0.0/255.0, 191.0/255.0, 255.0/255.0);
    this.bufferScene.add(this.torusMeshBlue);
    this.torusMeshBlue.position.set(-256,64,368);
  }

  capture(renderer, camera, progress_timer) {

    // light vector
    var mTrans = new THREE.Matrix4();
    mTrans.makeTranslation(320, 220, 0);
    var mRotate = new THREE.Matrix4();
    mRotate.makeRotationAxis( new THREE.Vector3(0, 1, 0), progress_timer);
    var mLightPosition = mRotate.multiply(mTrans);
    this.vLightPosition.setFromMatrixPosition(mLightPosition);

    this.torusMeshForest.rotation.set(progress_timer*1.8, progress_timer, 0);
    this.torusMeshYellow.rotation.set(progress_timer, 0, progress_timer*1.4);
    this.torusMeshBlue.rotation.set(progress_timer, progress_timer, 0);

    this.torusMeshForest.material.uniforms['lightPos'] = {type: "v3", value: this.vLightPosition};
    this.torusMeshYellow.material.uniforms['lightPos'] = {type: "v3", value: this.vLightPosition};
    this.torusMeshBlue.material.uniforms['lightPos'] = {type: "v3", value: this.vLightPosition};

    renderer.render(this.bufferScene, camera, this.renderTarget);

    return this.renderTarget;
  }
}
