// https://qiita.com/_nabe/items/1657d9556591284a43c8

// window.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

function init() {
  const width = window.parent.screen.width;
  const height = window.parent.screen.height;

  const renderer = initRenderer(width, height);
  const scene = initScene(width, height);
  const camera = initCamera(width, height, 0, 60000, -4000);
  initCameraControls(renderer, camera, 0, 0, 0);
  const stats = attachFpsView()

  //
  var progress_timer = 0;

  // RENDER TARGET
  var normalMap = new NormalMap(renderer);

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
      this.springPower = 0.33;
  };
  var gui = new dat.GUI( { autoPlace: true } );
  gui.add(controls, 'lightspeed', 0.0, 6.0);
  gui.add(controls, 'springPower', 0.0, 6.0);
  document.getElementById("GLCanvas").onclick = function() {
    addWave();
  };

  // light
  const light = new THREE.DirectionalLight(0xFFFFFF);
  light.intensity = 1.0;
  light.position.set(1, 3, 2);
  scene.add(light);

  // 光源位置に配置する
  var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(768), new THREE.MeshPhongMaterial({
    color: 0xFDB813
  }));
  scene.add(sphereMesh);

  // SHADER
  var vLightPosition = new THREE.Vector3();

  // side: THREE.DoubleSide 両面 CULL=CCW?
  var geometry = new THREE.PlaneGeometry( 100000, 100000, 2 );
  var material = new THREE.MeshBasicMaterial({ map: normalMap.currentRenderTarget(), side: THREE.DoubleSide });
  var plane = new THREE.Mesh( geometry, material );
  scene.add( plane );
  plane.position.y = -8000;
  plane.rotation.x = Math.PI/2;

  //
  tick();

  function tick() {
    requestAnimationFrame(tick);

    progress_timer += (0.016*controls.lightspeed);
    normalMap.setSpringPower(controls.springPower);

    //
    normalMap.dynamicNormalMap();
    material.map = normalMap.currentRenderTarget();

    // 移動行列を作成
    var mTrans = new THREE.Matrix4();
    mTrans.makeTranslation(60000, 30000, 0);

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

  function addWave() {
    var x = (Math.random()%100) * 1.0;
    var y = (Math.random()%100) * 1.0;
    var height = (Math.random()%100-50) * 0.2;
    var power = (Math.random()%100) * 0.68;

    normalMap.addWavePoint( x, y, height, power );
  }
}

///////////////////////////////////////////////////////////////////////////////
/**
  Render Target
*/
class NormalMap {
  constructor(renderer) {
    this.renderer = renderer;
    this.progress_timer = 0;

    this.bufferWidth = 512;
    this.bufferHeight = 512;
    this.aspect = this.bufferWidth / this.bufferHeight;

    this.bufferScene = new THREE.Scene();

    this.index = 0;
    this.renderTarget = [
      new THREE.WebGLRenderTarget(this.bufferWidth, this.bufferHeight, {
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter
      }),
      new THREE.WebGLRenderTarget(this.bufferWidth, this.bufferHeight, {
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter
      })
    ];

    this.cameraTarget = new THREE.PerspectiveCamera(90, this.aspect, 0.1, 1000);
    this.cameraTarget.position.z = this.bufferHeight / 2;

    this.waveHeight = 0.3;
    this.springPower = 0.5;
    this.wavePoint = new THREE.Vector2( 0.5 , 0.5 );
    this.textureOffset = new THREE.Vector2( 1.0/this.bufferWidth, 1.0/this.bufferHeight );

    this.material = [
        new THREE.ShaderMaterial({
          vertexShader: loadShaderFile("shader/normalmap.vsh"),
          fragmentShader: loadShaderFile("shader/normalmap.fsh"),
          side: THREE.DoubleSide,
          depthWrite: false,
          uniforms:{
            texture0: { type: "t", value: this.renderTarget[0].texture },
            textureOffset: { type: "v2", value: this.textureOffset },
            springPower: { type: "f", value: this.springPower },
            addWavePos: { type: "v2", value: this.wavePoint },
            addWaveHeight: { type: "f", value: this.waveHeight },
          },
        })
      ,new THREE.ShaderMaterial({
        vertexShader: loadShaderFile("shader/normalmap.vsh"),
        fragmentShader: loadShaderFile("shader/normalmap.fsh"),
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms:{
          texture0: { type: "t", value: this.renderTarget[1].texture },
          textureOffset: { type: "v2", value: this.textureOffset },
          springPower: { type: "f", value: this.springPower },
          addWavePos: { type: "v2", value: this.wavePoint },
          addWaveHeight: { type: "f", value: this.waveHeight },
        },
      })
    ];

    var geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
    this.plane = new THREE.Mesh( geometry, this.material[1] );
    this.bufferScene.add( this.plane );

    this.plane.scale.x = this.bufferWidth;
    this.plane.scale.y = this.bufferHeight;
  }

  addWavePoint(x, y, height, power) {
    this.wavePoint.x = x;
    this.wavePoint.y = y;
    this.waveHeight = height;
    this.springPower = power;

    this.changeBuffer();
    console.log('addWavePoint..');
  }

  setSpringPower(power) {
    this.springPower = power;
  }

  currentRenderTarget() {
    return this.renderTarget[this.index].texture;
  }

  changeBuffer() {
    this.index ^= 1;

    this.plane.material = this.material[this.index];
    this.renderer.render(this.bufferScene, this.cameraTarget, this.renderTarget[this.index^1]);
  }

  dynamicNormalMap() {
    this.progress_timer += 0.005;
    if( this.progress_timer >= 1.0 ) {
      this.progress_timer = 0.0;
    }

    this.changeBuffer();
    return this.renderTarget;
  }
}
