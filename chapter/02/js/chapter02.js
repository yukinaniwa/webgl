// window.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

function init() {
  const width = 960;
  const height = 540;

  const renderer = initRenderer(width, height);
  const scene = initScene(width, height);
  const camera = initCamera(width, height, 0, 100, -468);
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

  // light
  const light = new THREE.DirectionalLight(0xFFFFFF);
  light.intensity = 1.0;
  light.position.set(1, 1, -1);
  scene.add(light);

  // SHADER
  let material = new THREE.ShaderMaterial({
    vertexShader: loadShaderFile("shader/vertexshader.js"),
    fragmentShader: loadShaderFile("shader/fragmentshader.js"),
    uniforms:{
      uColor: {type: "c", value: new THREE.Color(0xFF0000)}
    }
  });

  // COLLADA
  const loader = new THREE.ColladaLoader();
  loader.load('../models/dragon.dae', (collada) => {
    const model = collada.scene;
    model.scale.set(128,128,128);
    model.children.forEach(function(childModel) {
      childModel.material = material;
    });

    console.log("model.children");
    console.log(model.children);

    scene.add(model);
  });

  tick();

  function tick() {
    requestAnimationFrame(tick);

    renderer.render(scene, camera);
    stats.update();
  }
}
