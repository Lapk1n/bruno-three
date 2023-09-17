import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui'
import { gsap } from 'gsap';

// Scene
const scene = new THREE.Scene();

// Params 
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const view = {
    color: 0xff0000,
    spin: () => gsap.to(mesh1.rotation, { duration: 2, y: mesh1.rotation.y + 10 })
}

// Red cube1
const mesh1 = new THREE.Mesh(
    new THREE.BoxGeometry(1), 
    new THREE.MeshBasicMaterial({ color: view.color, wireframe: true })
)
scene.add(mesh1)

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0, 0, 3)

// Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
// limit this to avoid perfomace issues
renderer.setPixelRatio(window.devicePixelRatio)

// gui
const gui = new lil.GUI()
gui.add(mesh1.position, 'y').min(-1.5).max(1.5).step(0.01).name('elevation')
gui.add(mesh1, 'visible')
gui.add(mesh1.material, 'wireframe')
gui.addColor(view, 'color').onChange((c) => mesh1.material.color.set(c))
gui.add(view, 'spin')

// Animation
const animation = () => {
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(animation)
}

animation()

// Notes