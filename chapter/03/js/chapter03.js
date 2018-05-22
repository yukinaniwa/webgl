// window.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

function init() {
  const width = 960;
  const height = 540;

  const renderer = initRenderer(width, height);
  const scene = initScene(width, height);
  const camera = initCamera(width, height, 0, 100, -880);
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
  light.intensity = 1.0;
  light.position.set(0, 1, -1);
  // シーンに追加
  scene.add(light);

  // 環境光を追加
  const ambientLight = new THREE.AmbientLight(0xFFFFFF);
  scene.add(ambientLight);

  var geometry = new THREE.SphereGeometry( 100, 300, 300);
  var material = new THREE.MeshPhongMaterial({
  	color: 0x868686,
  	envMap: cubeTexture,
  	reflectivity: 0.8
  });
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  tick();

  function tick() {
    requestAnimationFrame(tick);

    renderer.render(scene, camera);
    stats.update();
  }
}
