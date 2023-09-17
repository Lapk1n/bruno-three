import * as THREE from 'three';

// Scene
const scene = new THREE.Scene();

// Red cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
const mesh = new THREE.Mesh(geometry, material)

mesh.scale.set(1.5, 0.5, 1)
mesh.rotation.set(0, Math.PI * 0.3, Math.PI * 0.25)
mesh.position.set(0, 0.5, 0)
scene.add(mesh)

// Axis helper
// const axes = new THREE.AxesHelper()
// scene.add(axes)

// Sizes 
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
/* by default the camera is set to the center, so you have to move it backward to see the objects */
camera.position.set(0, 0, 3)
/* make camera to look at the center of object */
camera.lookAt(mesh.position)

// Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)

// Some useful tips
// Math.PI * 0.5 - rotate 90deg
// if u rotated object at least on one axe, the other axes will change the defaul direction
// mesh.rotation.reorder('ZXY')