
/**
  WebGL Renderer の初期化を行う
  @param width
  @param height

  @return renderer
*/
function initRenderer(width, height) {
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#GLCanvas')
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  return renderer;
}

/**
  Scene を初期化する
  @param width
  @param height

  @return scene
*/
function initScene(width, height) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x333333 );

  return scene;
}

/**
  Camera を初期化する
  @param width
  @param height
  @param camera_pos_x
  @param camera_pos_y
  @param camera_pos_z

  @return camera
*/
function initCamera(width, height, x, y, z) {
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera.position.set(x, y, z);

  return camera;
}

/**
*/
function initCameraControls(camera, x, y, z) {
  const controls = new THREE.OrbitControls(camera);
  controls.target.set(x, y, z);
  controls.update();

  return controls;
}
