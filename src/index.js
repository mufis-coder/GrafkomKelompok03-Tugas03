import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  DirectionalLight,
  HemisphereLight,
  Vector3,
  Clock,
  AnimationMixer
} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';

let container;
let camera;
let renderer;
let scene;
let controls;

const mixers = [];
const clock = new Clock();

function init() {
  container = document.querySelector("#scene-container");

  // Creating the scene
  scene = new Scene();
  scene.background = new Color("skyblue");

  createCamera();
  createLights();
  loadModels();
  createControls();
  createRenderer();

  let clouds = [], count = 0;
  let x1=0, y1=0, z1=38;
  let x2=15, y2=-3, z2=43;
  let x3=-20, y3=-7, z3=42;
  
  renderer.setAnimationLoop(async () => {
    update();
    render();

    x1, y1, z1 = changePos(x1, y1, z1);
    x2, y2, z2 = changePos(x2, y2, z2);
    x3, y3, z3 = changePos(x3, y3, z3);
    count += 1;

    clouds.push(cloudMk("Cloud01_", count, x1, y1, z1, 0.32, 0.33, 0.30));
    clouds.push(cloudMk("Cloud02_", count, x2, y2, z2, 0.28, 0.27, 0.25));
    clouds.push(cloudMk("Cloud03_", count, x3, y3, z3, 0.31, 0.33, 0.34));

    await cloudRmv(clouds);

  });
}

function cloudMk(name, count, x, y, z, xscale, yscale, zscale){
  name += String(count);
  loadModelsCloud(new Vector3(x, y, z), name, xscale, yscale, zscale);
  return name;
}

async function removeEntity(name) {
  var selectedObject = scene.getObjectByName(name);
  // console.log(selectedObject);
  await scene.remove( selectedObject );
}

async function cloudRmv(clouds){
  if(clouds.length >= 1){
    for(let i = 0; i < clouds.length - 15; i++){
      let obj = clouds[i];
      await removeEntity(obj);
    }
    console.log(clouds.length);
  }
  if(clouds.length >= 100){
    for(let i = 0; i < clouds.length - 10; i++){
      clouds.shift();
    }
  }
}

function changePos(x, y, z){
  x += 0;
  y -= 0.01;
  z -= 0.1;
  return x, y, z;
}


function loadModelsCloud(cloudPosition, nameObj, xscale, yscale, zscale){
  const loader = new GLTFLoader();
  let model;

  const onLoadQO = (result, position) => {
    model = result.scene.children[0];
    model.position.copy(position);
    model.scale.set(xscale, yscale, zscale);
    model.name = nameObj;

    scene.add(model);
  };

  const onProgress = progress => {};

  loader.load(
    "/src/models/cloud.glb",
    gltf => onLoadQO(gltf, cloudPosition),
    onProgress
  );

  return model;
}

function createCamera() {
  const fov = 35;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.1;
  const far = 1000;
  camera = new PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(-1.5, 1.5, 10);
}

function createLights() {
  const mainLight = new DirectionalLight(0xffffff, 5);
  mainLight.position.set(10, 10, 10);

  const hemisphereLight = new HemisphereLight(0xddeeff, 0x202020, 5);
  scene.add(mainLight, hemisphereLight);
}


function loadModels() {
  const loader = new GLTFLoader();

  const onLoad = (result, position) => {
    const model = result.scene.children[0];
    model.position.copy(position);
    model.scale.set(0.05, 0.05, 0.05);

    const mixer = new AnimationMixer(model);
    mixers.push(mixer);

    const animation = result.animations[0];
    const action = mixer.clipAction(animation);
    action.play();

    scene.add(model);
  };

  const onProgress = progress => {};

  const parrotPosition = new Vector3(0, 0, 2.5);
  loader.load(
    "/src/models/Parrot.glb",
    gltf => onLoad(gltf, parrotPosition),
    onProgress
  );

  const flamingoPosition = new Vector3(7.5, 0, -10);
  loader.load(
    "/src/models/Flamingo.glb",
    gltf => onLoad(gltf, flamingoPosition),
    onProgress
  );

  const storkPosition = new Vector3(0, -2.5, -10);
  loader.load(
    "/src/models/Stork.glb",
    gltf => onLoad(gltf, storkPosition),
    onProgress
  );
}

function createRenderer() {
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;
  renderer.physicallyCorrectLights = true;

  container.appendChild(renderer.domElement);
}

function createControls() {
  controls = new OrbitControls(camera, container);
}

function update() {
  const delta = clock.getDelta();
  mixers.forEach(mixer => mixer.update(delta));
}

function render() {
  renderer.render(scene, camera);
}

init();

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;

  // Update camera frustum
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
}
window.addEventListener("resize", onWindowResize, false);
