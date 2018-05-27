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
  gui.add(controls, 'isHalfLambert', true);

  // light
  const light = new THREE.DirectionalLight(0xFFFFFF);
  light.intensity = 1.0;
  light.position.set(1, 1, -1);
  scene.add(light);

  // SHADER
  let materialLambert = new THREE.ShaderMaterial({
    vertexShader: loadShaderFile("shader/vertex.vsh"),
    fragmentShader: loadShaderFile("shader/lambert.fsh"),
    uniforms:{
      lightPos: {type: "v3", value: light.position},
    },
  });

  let materialHalfLambert = new THREE.ShaderMaterial({
    vertexShader: loadShaderFile("shader/vertex.vsh"),
    fragmentShader: loadShaderFile("shader/half_lambert.fsh"),
    uniforms:{
      lightPos: {type: "v3", value: light.position},
    },
  });

  // COLLADA
  const loader = new THREE.ColladaLoader();
  var colladaModel;
  loader.load('../models/dragon.dae', (collada) => {
    colladaModel = collada.scene;
    colladaModel.scale.set(128,128,128);

    scene.add(colladaModel);
  });

  tick();

  function tick() {
    requestAnimationFrame(tick);

    if( !controls.isHalfLambert ) {
      colladaModel.children.forEach(function(childModel) {
        childModel.material = materialLambert;
      });
    } else {
      colladaModel.children.forEach(function(childModel) {
        childModel.material = materialHalfLambert;
      });
    }

    renderer.render(scene, camera);
    stats.update();
  }
}
