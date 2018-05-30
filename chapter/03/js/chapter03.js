// window.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);

function init() {
  const width = 960;
  const height = 540;

  const renderer = initRenderer(width, height);
  const scene = initScene(width, height);
  const camera = initCamera(width, height, 0, 100, 400);
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
  light.position.set(0, 1, 1);
  // シーンに追加
  scene.add(light);

  var material = new THREE.MeshPhongMaterial({
  	color: 0xFFFFFF,
  	envMap: cubeTexture,
  	reflectivity: 0.86
  });

  // COLLADA
  const loader = new THREE.ColladaLoader();
  var colladaModel;
  loader.load('../models/Jesus_Statue.dae', (collada) => {
    colladaModel = collada.scene;
    colladaModel.scale.set(60,60,60);
    colladaModel.rotation.set( -90 * Math.PI / 180, 0, 0 );
    colladaModel.position.set(0,-130,0);

    colladaModel.children.forEach(function(childModel) {
      childModel.material = material;
    });
    scene.add(colladaModel);
  });

  tick();

  function tick() {
    requestAnimationFrame(tick);

    renderer.render(scene, camera);
    stats.update();
  }
}
