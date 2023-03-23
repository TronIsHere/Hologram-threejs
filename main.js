import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
import terrainFragmentShader from "./shaders/fragment.glsl"
import terrainVertexShader from "./shaders/vertex.glsl"
/**
 * Base
 */

// Debug
const gui = new dat.GUI();


// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Terrain
 */
const terrain = {};

//Texture
terrain.texture = {};
terrain.texture.linesCount = 5;
terrain.texture.bigLineWidth = 0.04;
terrain.texture.smallLineWidth = 0.01;
terrain.texture.smallLineAlpha = 1;
terrain.texture.width = 32;
terrain.texture.height = 128;
terrain.texture.canvas = document.createElement('canvas');
terrain.texture.canvas.width = terrain.texture.width;
terrain.texture.canvas.height = terrain.texture.height;
terrain.texture.canvas.style.position = 'fixed';
terrain.texture.canvas.style.top = 0;
terrain.texture.canvas.style.left = 0;
terrain.texture.canvas.style.zIndex = 1;
document.body.append(terrain.texture.canvas);
terrain.texture.context = terrain.texture.canvas.getContext('2d');

terrain.texture.context.fillRect(0,Math.round(terrain.texture.height * 0.9),terrain.texture.width,4); 
terrain.texture.instance = new THREE.CanvasTexture(terrain.texture.canvas)
terrain.texture.instance.wrapS =  THREE.RepeatWrapping;
terrain.texture.instance.wrapT =  THREE.RepeatWrapping;
terrain.texture.instance.magFilter =  THREE.NearestFilter;

terrain.texture.update = ()=>
{
  terrain.texture.context.clearRect(0,0,terrain.texture.width,terrain.texture.height);

  // Big Lines
  terrain.texture.context.globalAlpha = terrain.texture.smallLineAlpha;
  terrain.texture.context.fillStyle = '#ffffff';
  terrain.texture.context.fillRect(0,0,terrain.texture.width,Math.round(terrain.texture.height * terrain.texture.bigLineWidth)); 

  // Small Lines
  const smallLinesCount = terrain.texture.linesCount - 1;

  for (let i = 0; i < smallLinesCount; i++) {
    terrain.texture.context.fillRect(
      0,
      Math.round(terrain.texture.height / terrain.texture.linesCount) * (i+1),
      terrain.texture.width,
      Math.round(terrain.texture.height * terrain.texture.smallLineWidth)
      ); 
    
  }
  terrain.texture.instance.needsUpdate = true;
}
terrain.texture.update()

//GUI
gui.add(terrain.texture,'linesCount').min(1).max(10).step(1).name('linesCount').onChange(()=>{
  terrain.texture.update()
}) 
gui.add(terrain.texture,'bigLineWidth').min(0).max(0.1).step(0.0001).name('bigLineWidth').onChange(()=>{
  terrain.texture.update()
}) 
gui.add(terrain.texture,'smallLineWidth').min(0).max(0.1).step(0.0001).name('smallLineWidth').onChange(()=>{
  terrain.texture.update()
}) 
gui.add(terrain.texture,'smallLineAlpha').min(0).max(1).step(0.0001).name('smallLineAlpha').onChange(()=>{
  terrain.texture.update()
}) 
//Geometry
terrain.geometry = new THREE.PlaneGeometry(1,1,1000,1000);
terrain.geometry.rotateX(-Math.PI*0.5)
terrain.material = new THREE.ShaderMaterial({
  transparent:true,
  vertexShader:terrainVertexShader,
  fragmentShader:terrainFragmentShader,
  uniforms:{
    uTexture:{value:terrain.texture.instance}
  }
});

terrain.mesh = new THREE.Mesh(terrain.geometry,terrain.material);
terrain.mesh.scale.set(10,10,10)

scene.add(terrain.mesh);


/**
 * Lights
 */


/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Update composer
  effectComposer.setSize(sizes.width, sizes.height);
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  //update passes 
 
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(5, 3, 5);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias:true
});


renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping

// Effect Composer

const renderTarget = new THREE.WebGLMultipleRenderTargets(800,600,{
  minFilter:THREE.LinearFilter,
  magFilter : THREE.LinearFilter,
  format:THREE.RGBAFormat,
  encoding: THREE.sRGBEncoding
})
const effectComposer = new EffectComposer(renderer)
effectComposer.setSize(sizes.width, sizes.height);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

effectComposer.addPass(new RenderPass(scene,camera))

const bokehPass = new BokehPass( scene, camera, {
  focus: 1.0,
  aperture: 0.025,
  maxblur: 0.01
} );
effectComposer.addPass(bokehPass)
let bokehFolder = gui.addFolder('bokehPass');
bokehFolder.add
/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Update controls
  controls.update()
 
  // Render
  // renderer.render(scene, camera);
  renderer.render(scene, camera);
  effectComposer.render()
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
