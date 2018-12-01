// https://qiita.com/_nabe/items/1657d9556591284a43c8

// window.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

function init() {
  const width = window.parent.screen.width;
  const height = window.parent.screen.height;

  const renderer = initRenderer(width, height);
  const scene = initScene(width, height);
  const camera = initCamera(width, height, 215.65, 12533.44, -65900.42);
  initCameraControls(renderer, camera, 0, 0, 0);
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
      this.lightspeed = 1.5;
  };
  var gui = new dat.GUI( { autoPlace: true } );
  gui.add(controls, 'lightspeed', 0.0, 6.0);

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

  // Velocity map
  var velocityMap = new VelocityMap(width, height);

  var geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
  var plane = new THREE.Mesh(
            geometry,
            new THREE.MeshLambertMaterial({map: velocityMap.render(renderer, camera.matrixWorldInverse)})
        );
  scene.add(plane);
  plane.scale.x = width;
  plane.scale.y = height;

  //
  progress();

  function progress() {
    requestAnimationFrame(progress);

    // progress Velocity map
    velocityMap.render(renderer, camera.matrixWorldInverse);

    //
    progress_timer += (0.016*controls.lightspeed);

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
  constructor(bufferWidth, bufferHeight) {
    this.bufferWidth = bufferWidth;
    this.bufferHeight = bufferHeight;
    this.aspect = this.bufferWidth / this.bufferHeight;

    this.target = new THREE.WebGLRenderTarget(bufferWidth, bufferHeight, {
      magFilter: THREE.LinearFilter,
      minFilter: THREE.LinearFilter
    });

    this.bufferScene = new THREE.Scene();
    this.cameraTarget = new THREE.PerspectiveCamera( 45, this.bufferWidth/this.bufferHeight, 1, 1000 );
    this.cameraTarget.position.set(0, 0, 0);
  }
}

/**
  Velocity Map
*/
class VelocityMap {
  constructor(bufferWidth, bufferHeight) {

    this.progress_timer = 0
    this.renderTarget = new RenderTarget(bufferWidth, bufferHeight)

    this.modelViewMatrix = new THREE.Matrix4();
    this.prevModelViewMatrix = new THREE.Matrix4();

    this.shader = new THREE.ShaderMaterial({
      vertexShader: loadShaderFile("shader/velocitymap.vsh"),
      fragmentShader: loadShaderFile("shader/velocitymap.fsh"),
      side: THREE.DoubleSide,
      transparent: true,
      uniforms:{
        currentViewMatrix: { type: "m4", value: this.modelViewMatrix },
        prevViewMatrix: { type: "m4", value: this.prevModelViewMatrix }
      },
    });

    // geometory
    var geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
    this.torus = new THREE.Mesh( geometry, this.shader );
    this.renderTarget.bufferScene.add( this.torus );

    this.torus.position.z = -100;
  }

  render(renderer, modelViewMatrix) {
    var mat = modelViewMatrix * this.torus.matrixWorld;

    this.progress_timer += 0.005;
    if( this.progress_timer >= 1.0 ) {
      this.progress_timer = 0.0;
    }

    this.modelViewMatrix = mat
    this.shader.uniforms['prevViewMatrix'] = {type: "m4", value: this.prevModelViewMatrix};

    this.torus.rotation.x = (this.progress_timer*360) * ( Math.PI / 180 );
    renderer.render(this.renderTarget.bufferScene, this.renderTarget.cameraTarget, this.renderTarget.target);

    this.prevModelViewMatrix = mat

    return this.renderTarget.target;
  }
}
