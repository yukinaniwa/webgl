
window.addEventListener('DOMContentLoaded', init);

function init() {
  const width = 960;
  const height = 540;

  const renderer = initRenderer(width, height);
  const scene = initScene(width, height);
  const camera = initCamera(width, height, 0, 100, 468);
  initCameraControls(renderer, camera, 0, 32, 32);
  const stats = attachFpsView()

  // light
  const light = new THREE.DirectionalLight(0xFFFFFF);
  light.intensity = 0.33;
  light.position.set(1, 1, 1);
  scene.add(light);

  // COLLADA
  const loader = new THREE.ColladaLoader();
  loader.load('../models/Jesus_Statue.dae', (collada) => {
    const model = collada.scene;
    model.scale.set(60,60,60);
    model.rotation.set( -90 * Math.PI / 180, 0, 0 );
    model.position.set(0,-130,0);

    scene.add(model);
  });

  tick();

  function tick() {
    requestAnimationFrame(tick);

    renderer.render(scene, camera);
    stats.update();
  }
}
