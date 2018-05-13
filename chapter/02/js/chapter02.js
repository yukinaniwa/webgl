// window.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

function init() {
  const width = 960;
  const height = 540;

  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#GLCanvas')
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // シーンを作成
  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x333333 );

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera.position.set(0, 50, 300);

  // カメラコントローラーを作成
  const controls = new THREE.OrbitControls(camera);
  controls.target.set(0, 0, 32);
  controls.update();

  // 平行光源
  const light = new THREE.DirectionalLight(0xFFFFFF);
  // light.intensity = 1;
  light.position.set(1, 1, 1);
  // シーンに追加
  scene.add(light);

  // 環境光を追加
  // const ambientLight = new THREE.AmbientLight(0x33DD33);
  // scene.add(ambientLight);

  //
  const loader = new THREE.ColladaLoader();
  loader.load('../models/boletus/boletus.dae', (collada) => {
    const model = collada.scene;
    scene.add(model);
  });

  tick();

  function tick() {
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
}
