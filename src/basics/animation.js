import { gsap } from 'gsap';
import * as THREE from 'three';

// Scene
const scene = new THREE.Scene();

// Red cube1
const mesh1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1), 
    new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
)

mesh1.scale.set(1.5, 0.5, 1)
mesh1.rotation.set(0, Math.PI * 0.3, Math.PI * 0.25)
mesh1.position.set(-1.5, 1, 0)
scene.add(mesh1)

// Green cube2
const mesh2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1), 
    new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
)
mesh2.scale.set(1.5, 0.5, 1)
mesh2.position.set(-1.5, -1, 0)
scene.add(mesh2)

// Blue cube3
const mesh3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1), 
    new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
)
mesh3.position.set(1.5, 0, 0)
scene.add(mesh3)

// Sizes 
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.set(0, 0, 3)

// Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)

// Animation

// maximazing fps by native solution
let time = Date.now()

// maximazing fps by build-in solution
const clock = new THREE.Clock()

// animation from 3rd party library
gsap.to(mesh1.position, {x: 3, duration: 1, delay: 1 })
gsap.to(mesh1.position, {x: -1.5, duration: 1, delay: 3 })


const animation = () => {
    // this native trick will rotate the cube regardless to the max of your pc fps
    const currentTime = Date.now()
    const deltaTime = currentTime - time
    time = currentTime
    mesh1.rotation.x += 0.001 * deltaTime
    mesh1.rotation.y += 0.001 * deltaTime

    // this native trick will rotate the cube regardless to the max of your pc fps
    mesh2.rotation.x = clock.getElapsedTime()
    mesh3.position.y = Math.sin(clock.getElapsedTime()) * 0.5

    renderer.render(scene, camera)
    // recursion creation by sending the next frame of object
    window.requestAnimationFrame(animation)
}

animation()

// Notes
/* The steps of any animation:
    1. Change the position/scale/param of object
    2. Make the "picture" of it and render it
    3. Ask the next picture
*/

/* Depending on your computer cpu/gpu power
   the max fps of animation could be different.
   So it's important to animate object regardless to the max of fps 
*/

/* You can even animate the camera like this:
    camera.position.y = Math.sin(clock.getElapsedTime()) * 0.5
    camera.lookAt(mesh3.position)
*/