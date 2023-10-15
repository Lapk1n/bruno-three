import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Scene
const scene = new THREE.Scene();

// Red cube1
const mesh1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 5, 5, 5), 
    new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
)
scene.add(mesh1)

// Sizes 
const sizes = {
    width: 800,
    height: 600
}


// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)

// to normalize the object view for the current sizes
// const aspectRatio = sizes.width / sizes.height
// const camera = new THREE.OrthographicCamera(-1 * aspectRatio, 1 * aspectRatio, 1, -1, 1, 1000)

camera.position.set(0, 0, 3)

// Renderer
const canvas = document.querySelector('.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)

// Camera controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Animation
const animation = () => {
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(animation)
}

animation()

// Notes