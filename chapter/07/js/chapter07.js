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
      this.lightspeed = 1;
      this.waveSpan = 10;
      this.opacity = 0.86;
      this.bumpScale = 1.0;
      this.bumpBias = 1.0;
      this.lightIntensity = 1.0;
      this.heightScale = 0.0;
      this.wireframe = false;
  };
  var gui = new dat.GUI( { autoPlace: true } );
  gui.add(controls, 'lightspeed', 0.0, 6.0);
  gui.add(controls, 'waveSpan', 1, 100);
  gui.add(controls, 'opacity', 0.2, 1.0);
  gui.add(controls, 'bumpScale', 1.5, 64.0);
  gui.add(controls, 'bumpBias', 1.0, 32.0);
  gui.add(controls, 'lightIntensity', 0.1, 4.0);
  gui.add(controls, 'heightScale', 0.0, 64.0);
  gui.add(controls, 'wireframe').onChange(changeWireFrame);
  function changeWireFrame() {
    parallax.wireframe = controls.wireframe;
  };

  document.getElementById("GLCanvas").onclick = function() {
    normalMap.addWave();
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
  var geometry = new THREE.PlaneGeometry( 100000, 100000, 256 );
  var texture = new THREE.TextureLoader().load( '../textures/cubemap/negy.jpg' );

  var parallax = new THREE.ShaderMaterial({
    vertexShader: loadShaderFile("shader/vertex.vsh"),
    fragmentShader: loadShaderFile("shader/parallax.fsh"),
    side: THREE.DoubleSide,
    transparent: true,
    wireframe: controls.wireframe,
    uniforms:{
      texture0: { type: "t", value: texture },
      texture1: { type: "t", value: normalMap.normalTexture() },
      opacity: {type: "f", value: controls.opacity},
      v_lightPosition: {type: "v3", value: vLightPosition},
      f_lightPosition: {type: "v3", value: vLightPosition},
      v_cameraPosition: {type: "v3", value: camera.position},
      f_cameraPosition: {type: "v3", value: camera.position},
      scale: {type: "f", value: controls.bumpScale},
      bias: {type: "f", value: controls.bumpBias},
      lightIntensity: {type: "f", value: controls.lightIntensity},
      heightScale: {type: "f", value: controls.heightScale},
      lightColor: {type: "v3", value: light.color},
      ambientColor: {type: "v3", value: new THREE.Vector3(64.0/255.0,164.0/255.0,223.0/255.0)},
    },
  });

  var material = new THREE.MeshPhongMaterial({ color: 0x40a4df, map: texture, bumpMap: normalMap.normalTexture(), bumpScale: controls.bumpScale, side: THREE.DoubleSide, transparent: true, opacity: controls.opacity });
  var plane = new THREE.Mesh( geometry, parallax );
  scene.add( plane );
  plane.position.y = -8000;
  plane.rotation.x = Math.PI/2;

  //
  tick();

  function tick() {
    requestAnimationFrame(tick);

    progress_timer += (0.016*controls.lightspeed);

    addwave_counter++;
    if( addwave_counter > addwave_span ) {
      addwave_counter = 0;
      addwave_span = (Math.random()*controls.waveSpan)+1;

      normalMap.addWave();
    }

    //
    normalMap.dynamicNormalMap();

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

    // progress uniforms
    parallax.uniforms['texture1'] = { type: "t", value: normalMap.normalTexture() };
    parallax.uniforms['opacity'] = {type: "f", value: controls.opacity};
    parallax.uniforms['lightIntensity'] = {type: "f", value: controls.lightIntensity};
    parallax.uniforms['v_lightPosition'] = {type: "f", value: vLightPosition};
    parallax.uniforms['f_lightPosition'] = {type: "f", value: vLightPosition};
    parallax.uniforms['v_cameraPosition'] = {type: "f", value: camera.position};
    parallax.uniforms['f_cameraPosition'] = {type: "f", value: camera.position};
    parallax.uniforms['scale'] = {type: "f", value: controls.bumpScale};
    parallax.uniforms['bias'] = {type: "f", value: controls.bumpBias};
    parallax.uniforms['heightScale'] = {type: "f", value: controls.heightScale};

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
    this.waveHeight = 0.73;
    this.springPower = 0.95;
    this.wavePoint = new THREE.Vector2( -1.0 , -1.0 );
    this.textureOffset = new THREE.Vector2( 1.0/bufferWidth, 1.0/bufferHeight );
  }

  set() {

    var x = (Math.random()%100) * 1.0;
    var y = (Math.random()%100) * 1.0;
    var height = ((Math.random()%100)*2.0-1.0) * 1.086;
    var power = (Math.random()%100) * 1.13;

    this.wavePoint.x = x;
    this.wavePoint.y = y;
    this.waveHeight = height;
    this.springPower = power;

    // console.log('wave: ', this.wavePoint.x, this.wavePoint.y, this.waveHeight, this.springPower);
  }

  reset() {
    this.wavePoint.x = -1;
    this.wavePoint.y = -1;
    this.waveHeight = 0;
    this.springPower = 0;
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

    this.renderTarget = new RenderTarget(1024, 1024);
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

    this.renderBuffer();

    // setting reset
    this.shader.uniforms.reset();
  }
}
