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

  var addwave_span = 50;
  var addwave_counter = 0;

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

  // RENDER TARGET
  var normalMap = new NormalMap(renderer);

  // GUI
  var controls = new function () {
      this.lightspeed = 1.5;
      this.waveSpan = 25;
      this.opacity = 0.86;
      this.normalScale = 1.0;
      this.maxHeightBias = 2.4;
      this.specular = 16;
      this.specularPower = 0.8;
      this.heightScale = 3.0;
      this.wireframe = false;
  };
  var gui = new dat.GUI( { autoPlace: true } );
  gui.add(controls, 'lightspeed', 0.0, 6.0);
  gui.add(controls, 'waveSpan', 1, 50);
  gui.add(controls, 'opacity', 0.2, 1.0);
  // gui.add(controls, 'normalScale', 1.0, 24.0);
  // gui.add(controls, 'maxHeightBias', 0.0, 0.25);
  gui.add(controls, 'specular', 1, 32);
  gui.add(controls, 'specularPower', 0.0, 3.0);
  gui.add(controls, 'heightScale', 0.0, 10.0);
  gui.add(controls, 'wireframe').onChange(changeWireFrame);
  function changeWireFrame() {
    parallax.wireframe = controls.wireframe;
  };

  document.getElementById("GLCanvas").onclick = function() {
    generateWave();
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

  var geometry = new THREE.PlaneGeometry( 50000, 50000, 320, 320 );
  var texture = new THREE.TextureLoader().load( '../textures/cubemap/posy.jpg' );

  var parallax = new THREE.ShaderMaterial({
    vertexShader: loadShaderFile("shader/parallax.vsh"),
    fragmentShader: loadShaderFile("shader/parallax.fsh"),
    side: THREE.DoubleSide,
    transparent: true,
    wireframe: controls.wireframe,
    uniforms:{
      texture0: { type: "t", value: texture },
      texture1: { type: "t", value: normalMap.normalTexture() },
      v_lightPosition: {type: "v3", value: vLightPosition},
      opacity: {type: "f", value: controls.opacity},
      normalScale: {type: "f", value: controls.normalScale},
      ambientColor: {type: "v3", value: new THREE.Vector3(23.0/255.0,96.0/255.0,45.0/255.0)},
      maxHeightBias: {type: "f", value: controls.maxHeightBias},
      specular: {type: "f", value: controls.specular},
      specularPower: {type: "f", value: controls.specularPower},
      heightScale: {type: "f", value: controls.heightScale},
    },
  });

  var plane = new THREE.Mesh( geometry, parallax );
  scene.add( plane );
  plane.position.y = 0;
  plane.rotation.x = Math.PI/2;

  plane.scale.x = 1;
  plane.scale.y = 1;

  // addGround(geometry);

  //
  progress();

  function progress() {
    requestAnimationFrame(progress);

    progress_timer += (0.016*controls.lightspeed);

    addwave_counter++;
    if( addwave_counter > addwave_span ) {
      addwave_counter = 0;
      addwave_span = (Math.random()*controls.waveSpan)+1;

      generateWave();
    }

    //
    normalMap.dynamicNormalMap();

    // 移動行列を作成
    var mTrans = new THREE.Matrix4();
    mTrans.makeTranslation(40000, 30000, 0);
    // mTrans.makeTranslation(0, 30000, 0);

    // 回転行列を作成
    var mRotate = new THREE.Matrix4();
    mRotate.makeRotationAxis( new THREE.Vector3(0, 1, 0), progress_timer);

    // 移動行列 * 回転行列をした行列から
    // 移動成分を抽出する
    var mLightPosition = mRotate.multiply(mTrans);
    vLightPosition.setFromMatrixPosition(mLightPosition);
    // console.log('pos: ', camera.position);

    // 光源の位置に設定
    sphereMesh.position.set(vLightPosition.x,vLightPosition.y,vLightPosition.z);

    // progress uniforms
    parallax.uniforms['texture1'] = { type: "t", value: normalMap.normalTexture() };
    parallax.uniforms['v_lightPosition'] = {type: "f", value: vLightPosition};
    parallax.uniforms['opacity'] = {type: "f", value: controls.opacity};
    parallax.uniforms['normalScale'] = {type: "f", value: controls.normalScale};
    parallax.uniforms['maxHeightBias'] = {type: "f", value: controls.maxHeightBias};
    parallax.uniforms['specular'] = {type: "f", value: controls.specular};
    parallax.uniforms['specularPower'] = {type: "f", value: controls.specularPower};
    parallax.uniforms['heightScale'] = {type: "f", value: controls.heightScale};

    renderer.render(scene, camera);
    stats.update();
  }

  ////
  function generateWave() {
    normalMap.addWave();
  }

  ////
  function addGround(bottomGeometry) {
    var geometryPlane = new THREE.PlaneGeometry( 100000, 30000, 2, 2 );
    var material = new THREE.MeshPhongMaterial({ color: 0x4C4C4C, side: THREE.DoubleSide });

    var bottomPlane = new THREE.Mesh( bottomGeometry, material );
    scene.add( bottomPlane );
    bottomPlane.position.y = -20000;
    bottomPlane.rotation.x = Math.PI/2;

    var nearPlane = new THREE.Mesh( geometryPlane, material );
    scene.add( nearPlane );
    nearPlane.position.y = -5000;
    nearPlane.position.z = -50000;

    var farPlane = new THREE.Mesh( geometryPlane, material );
    scene.add( farPlane );
    farPlane.position.y = -5000;
    farPlane.position.z = 50000;

    var leftPlane = new THREE.Mesh( geometryPlane, material );
    scene.add( leftPlane );
    leftPlane.position.y = -5000;
    leftPlane.position.x = 50000;
    leftPlane.rotation.y = Math.PI/2;

    var rightPlane = new THREE.Mesh( geometryPlane, material );
    scene.add( rightPlane );
    rightPlane.position.y = -5000;
    rightPlane.position.x = -50000;
    rightPlane.rotation.y = Math.PI/2;
  }

}

///////////////////////////////////////////////////////////////////////////////
/**
  Render Target
*/
class RenderTarget {
  constructor(bufferWidth, bufferHeight) {
    this.index = 0;
    this.bufferWidth = bufferWidth;
    this.bufferHeight = bufferHeight;
    this.aspect = this.bufferWidth / this.bufferHeight;

    this.heightBuffer = [
      new THREE.WebGLRenderTarget(bufferWidth, bufferHeight, {
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter
      }),
      new THREE.WebGLRenderTarget(bufferWidth, bufferHeight, {
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter
      })
    ];
  }

  normalTexture() {
    return this.heightBuffer[this.index].texture
  }
}

///////////////////////////////////////////////////////////////////////////////
/**
  GLSL
*/
class Shader {
  constructor(renderTarget) {
    this.uniforms = new Uniforms(renderTarget.bufferWidth, renderTarget.bufferHeight)

    // height map shader
    this.heightMap = [
        new THREE.ShaderMaterial({
          vertexShader: loadShaderFile("shader/vertex.vsh"),
          fragmentShader: loadShaderFile("shader/heightmap.fsh"),
          side: THREE.DoubleSide,
          depthWrite: false,
          uniforms:{
            texture0: { type: "t", value: renderTarget.heightBuffer[0].texture },
            textureOffset: { type: "v2", value: this.uniforms.textureOffset },
            springPower: { type: "f", value: this.uniforms.springPower },
            addWavePos: { type: "v2", value: this.uniforms.wavePoint },
            addWaveHeight: { type: "f", value: this.uniforms.waveHeight },
          },
        })
      ,new THREE.ShaderMaterial({
        vertexShader: loadShaderFile("shader/vertex.vsh"),
        fragmentShader: loadShaderFile("shader/heightmap.fsh"),
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms:{
          texture0: { type: "t", value: renderTarget.heightBuffer[1].texture },
          textureOffset: { type: "v2", value: this.uniforms.textureOffset },
          springPower: { type: "f", value: this.uniforms.springPower },
          addWavePos: { type: "v2", value: this.uniforms.wavePoint },
          addWaveHeight: { type: "f", value: this.uniforms.waveHeight },
        },
      })
    ];

    // normal map shader
    this.normalMap = new THREE.ShaderMaterial({
      vertexShader: loadShaderFile("shader/vertex.vsh"),
      fragmentShader: loadShaderFile("shader/normalmap.fsh"),
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms:{
        texture0: { type: "t", value: renderTarget.heightBuffer[1].texture },
        textureOffset: { type: "v2", value: this.uniforms.textureOffset },
      },
    });
  }
}

///////////////////////////////////////////////////////////////////////////////
/**
  Uniforms
*/
class Uniforms {
  constructor(bufferWidth, bufferHeight) {
    this.wavePoint = new THREE.Vector2( 0.0, 0.0 );

    this.set();
    this.textureOffset = new THREE.Vector2( 1.0/bufferWidth, 1.0/bufferHeight );
  }

  set() {
    var x = (Math.random()%100) * 1.0;
    var y = (Math.random()%100) * 1.0;
    var height = ((Math.random()%100)*100) * 0.26 + 0.14;
    var power = 0.29;

    this.wavePoint.x = x;
    this.wavePoint.y = y;
    this.waveHeight = height;
    this.springPower = power;

    console.log('wave: ', height);
  }

  reset() {
  }
}

///////////////////////////////////////////////////////////////////////////////
/**
  NormalMap
*/
class NormalMap {
  constructor(renderer) {

    this.renderer = renderer;
    this.progress_timer = 0;

    this.renderTarget = new RenderTarget(256, 256);
    this.shader = new Shader(this.renderTarget);

    this.bufferScene = new THREE.Scene();
    this.cameraTarget = new THREE.PerspectiveCamera(90, this.renderTarget.aspect, 0.1, 1000);
    this.cameraTarget.position.z = this.renderTarget.bufferHeight / 2;


    var geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
    this.plane = new THREE.Mesh(geometry, this.shader.heightMap[1]);
    this.bufferScene.add(this.plane);

    this.plane.scale.x = this.renderTarget.bufferWidth;
    this.plane.scale.y = this.renderTarget.bufferHeight;
  }

  addWave() {
    this.shader.uniforms.set();
    this.dynamicNormalMap();
  }

  waveUniforms() {
    this.shader.heightMap[0].uniforms['springPower'] = {type: "f", value: this.shader.uniforms.springPower};
    this.shader.heightMap[0].uniforms['addWavePos'] = {type: "v2", value: this.shader.uniforms.wavePoint};
    this.shader.heightMap[0].uniforms['addWaveHeight'] = {type: "f", value: this.shader.uniforms.waveHeight};

    this.shader.heightMap[1].uniforms['springPower'] = {type: "f", value: this.shader.uniforms.springPower};
    this.shader.heightMap[1].uniforms['addWavePos'] = {type: "v2", value: this.shader.uniforms.wavePoint};
    this.shader.heightMap[1].uniforms['addWaveHeight'] = {type: "f", value: this.shader.uniforms.waveHeight};
  }

  normalTexture() {
    return this.renderTarget.normalTexture();
  }

  renderBuffer() {
    // Height Map
    this.renderTarget.index ^= 1;
    this.plane.material = this.shader.heightMap[ this.renderTarget.index ];

    var currentBuffer = this.renderTarget.heightBuffer[ this.renderTarget.index ];
    var nextBuffer = this.renderTarget.heightBuffer[ this.renderTarget.index^1 ];
    this.renderer.render(this.bufferScene, this.cameraTarget, nextBuffer);

    // Normal Map
    this.shader.normalMap.uniforms['texture0'] = { type: "t", value: nextBuffer.texture };
    this.plane.material = this.shader.normalMap;
    this.renderer.render(this.bufferScene, this.cameraTarget, currentBuffer);
  }

  dynamicNormalMap() {
    this.progress_timer += 0.005;
    if( this.progress_timer >= 1.0 ) {
      this.progress_timer = 0.0;
    }

    this.waveUniforms();
    this.renderBuffer();

    // setting reset
    this.shader.uniforms.reset();
  }
}
