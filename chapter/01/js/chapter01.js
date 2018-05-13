
window.addEventListener('DOMContentLoaded', init);

function init() {
  const width = 960;
  const height = 540;

  const renderer = initRenderer(width, height);
  const scene = initScene(width, height);
  const camera = initCamera(width, height, 0, 0, +1000);
  const controls = initCameraControls(camera, 0, 0, 32);

  // models
  const geometry = new THREE.BoxGeometry(100, 100, 100);
  const material = new THREE.MeshStandardMaterial({color: 0xAAAAAA});
  const box = new THREE.Mesh(geometry, material);
  scene.add(box);

  // light
  const light = new THREE.DirectionalLight(0xFFFFFF);
  light.position.set(1, 1, 1);
  scene.add(light);

  tick();

  function tick() {
    requestAnimationFrame(tick);

    // rotation box
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;

    renderer.render(scene, camera);
  }
}
