import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'

// Canvas
const canvas = document.querySelector('.webgl')

// Scene
const scene = new THREE.Scene();

// Loaders
const fontsLoader = new FontLoader()
const textureLoader = new THREE.TextureLoader()
const matCapTexture = textureLoader.load('/textures/matcaps/4.png')

fontsLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new TextGeometry(
            'Hello world!',
            {
                font,
                size: 0.5,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            }
        )
        textGeometry.center()
        const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matCapTexture })
        const text = new THREE.Mesh(textGeometry, textMaterial)
        scene.add(text)
    }
)

const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
const donutMaterial = new THREE.MeshMatcapMaterial({ matcap: matCapTexture })

for (let i = 0; i < 100; i++) {
    const donut = new THREE.Mesh(donutGeometry, donutMaterial)

    donut.position.x = (Math.random() - 0.5) * 10
    donut.position.y = (Math.random() - 0.5) * 10
    donut.position.z = (Math.random() - 0.5) * 10

    donut.rotation.x = Math.random() * Math.PI
    donut.rotation.y = Math.random() * Math.PI

    const scale = Math.random()
    donut.scale.x = scale
    donut.scale.y = scale
    donut.scale.z = scale

    scene.add(donut)
}

// Params 
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0, 0, 4)
 
// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(window.devicePixelRatio)

// Animation
const animation = () => {
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(animation)
}

animation()

/* Notes
    - a trick to calculate the operational time for some function/algoritm
    console.time('name)
    ...some calculations
    console.timeEnd('name')

    - for optimization purposes, its better to create one geometry + material
      outside the loop
*/


