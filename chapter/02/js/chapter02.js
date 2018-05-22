// window.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

function init() {
  const width = 960;
  const height = 540;

  const renderer = initRenderer(width, height);
  const scene = initScene(width, height);
  const camera = initCamera(width, height, 0, 100, -256);
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
  
  // 平行光源
  const light = new THREE.DirectionalLight(0xFFFFFF);
  light.intensity = 1.6;
  light.position.set(1, 1, 1);
  // シーンに追加
  scene.add(light);

  // 環境光を追加
  // const ambientLight = new THREE.AmbientLight(0x33DD33);
  // scene.add(ambientLight);

  // COLLADA
  const loader = new THREE.ColladaLoader();
  loader.load('../models/dragon.dae', (collada) => {
    const model = collada.scene;
    model.scale.set(128,128,128);
    scene.add(model);
  });

  tick();

  function tick() {
    requestAnimationFrame(tick);

    renderer.render(scene, camera);
    stats.update();
  }
}
