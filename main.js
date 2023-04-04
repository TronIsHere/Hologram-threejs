import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { BokehPass } from './passes/bokehPass';
import terrainFragmentShader from "./shaders/fragment.glsl"
import terrainVertexShader from "./shaders/vertex.glsl"
import terrainDepthVertexShader from "./shaders/terrainDepth/vertex.glsl"
import terrainDepthFragmentShader from "./shaders/terrainDepth/fragment.glsl"
/**
 * Base
 */

// Debug
const gui = new dat.GUI();
const guiDummy = {}
guiDummy.clearColor = '#080024'

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
terrain.texture.bigLineWidth = 0.08;
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
    terrain.texture.context.fillStyle = '#00ffff';
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
gui.add(terrain.texture,'bigLineWidth').min(0).max(0.5).step(0.0001).name('bigLineWidth').onChange(()=>{
  terrain.texture.update()
}) 
gui.add(terrain.texture,'smallLineWidth').min(0).max(0.1).step(0.0001).name('smallLineWidth').onChange(()=>{
  terrain.texture.update()
}) 
gui.add(terrain.texture,'smallLineAlpha').min(0).max(1).step(0.0001).name('smallLineAlpha').onChange(()=>{
  terrain.texture.update()
}) 

gui.addColor(guiDummy,'clearColor').name('clearColor').onChange(()=>{
  renderer.setClearColor(guiDummy.clearColor,1)
}) 
 


//Geometry
terrain.geometry = new THREE.PlaneGeometry(1,1,1000,1000);
terrain.geometry.rotateX(-Math.PI*0.5)

/* Uniforms */
console.log(terrain.texture,1);
terrain.uniforms = {
  uTexture:{value:terrain.texture.instance},
    uElevation:{value:0.825},
    uTime:{value:0},
    uHslHue:{value:1.0},
    uHslHueOffset:{value:0.0},
    uHslHueFrequency:{value:10.0},
    uHslLightness:{value:0.75},
    uHslLightnessVariation:{value:0.25},
    uHslLightnessFrequency:{value:20.0}
}
terrain.material = new THREE.ShaderMaterial({
  transparent:true,
  vertexShader:terrainVertexShader,
  fragmentShader:terrainFragmentShader,
  uniforms:terrain.uniforms
});

gui.add(terrain.material.uniforms.uElevation,'value').min(0).max(10).step(0.001).name('uElevation').onChange(()=>{
  terrain.texture.update()
}) 

/*

 depth Material
 
*/
const uniforms = THREE.UniformsUtils.merge([
  THREE.UniformsLib.common,
  THREE.UniformsLib.displacementmap,

])
for(const uniformKey in terrain.uniforms){
  uniforms[uniformKey] = terrain.uniforms[uniformKey]
}
terrain.depthMaterial = new THREE.ShaderMaterial({
  uniforms:uniforms,
  vertexShader:terrainDepthVertexShader,
  fragmentShader:terrainDepthFragmentShader
})
terrain.depthMaterial.depthPacking = THREE.RGBADepthPacking
terrain.depthMaterial.blending = THREE.NoBlending

terrain.mesh = new THREE.Mesh(terrain.geometry,terrain.material);
terrain.mesh.scale.set(10,10,10)
terrain.mesh.userData.depthMaterial = terrain.depthMaterial
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
  // bokehPass.renderTargetDepth.width = sizes.width * Math.min(window.devicePixelRatio, 2)
  // bokehPass.renderTargetDepth.height = sizes.height * Math.min(window.devicePixelRatio, 2)
 
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
camera.position.set(2.8, 0.2, 3);
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
renderer.setClearColor('#0f0822')
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
  focus: 0.4859,
  aperture: 0.00395,
  maxblur: 0.0029,

} );
effectComposer.addPass(bokehPass)

let bokehFolder = gui.addFolder('bokehPass');
 bokehFolder.add(bokehPass.materialBokeh.uniforms.focus,'value').name('focus').min(0).max(10).step(0.0001)
 bokehFolder.add(bokehPass.materialBokeh.uniforms.aperture,'value').name('aperture').min(0.0002).max(0.1).step(0.00001)
 bokehFolder.add(bokehPass.materialBokeh.uniforms.maxblur,'value').name('maxblur').min(0).max(0.02).step(0.00001)
 bokehFolder.add(bokehPass,'enabled').name('enabled')
/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  terrain.uniforms.uTime.value = elapsedTime
  // console.log(camera.position);
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
