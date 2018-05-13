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
  camera.position.set(0, 10, 10);

  //
  const loader = new THREE.ColladaLoader();
  loader.load('../models/elf/elf/elf.dae', (collada) => {
    const model = collada.scene;
    scene.background = new THREE.Color( 0xFF0000 );
    scene.add(model);
  });

  // 平行光源
  const light = new THREE.DirectionalLight(0xFFFFFF);
  // light.intensity = 1;
  light.position.set(1, 1, 1);
  // シーンに追加
  scene.add(light);

  // 初回実行
  tick();

  function tick() {
    requestAnimationFrame(tick);

    // 箱を回転させる
    // box.rotation.x += 0.01;
    // box.rotation.y += 0.01;

    // レンダリング
    renderer.render(scene, camera);
  }
}
