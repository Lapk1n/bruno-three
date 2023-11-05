import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 300})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Galaxy generation
const params = {}
params.count = 100000
params.size = 0.01
params.radius = 5
params.branches = 10
params.spin = 1
params.randomness = 0.2
params.randomPower = 3
params.insideColor = '#f74008'
params.outsideColor = '#4950bc'

let geometry = null
let material = null
let points = null

const generateGalaxy = () => {

    if (points) {
        // when changing gui controls we have to remove the prev generation
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    // geometry
    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(params.count * 3)
    const colors = new Float32Array(params.count * 3)

    for (let i = 0; i < params.count; i++) {
        const i3 = i * 3

        // Positions
        const radius = Math.random() * params.radius
        const branch = (i % params.branches) / params.branches * Math.PI * 2
        const spin = radius * params.spin

        const randomX = Math.pow(Math.random(), params.randomPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random(), params.randomPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), params.randomPower) * (Math.random() < 0.5 ? 1 : -1)

        // just for the representation of the point coords structure [xyz, xyz, ...]
        positions[i3 + 0] = Math.cos(branch + spin) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branch + spin) * radius + randomZ

        // Colors
        const insideColor = new THREE.Color(params.insideColor)
        const outsideColor = new THREE.Color(params.outsideColor)
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / params.radius)


        colors[i3 + 0] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        )

        geometry.setAttribute(
            'color',
            new THREE.BufferAttribute(colors, 3)
        )
    }

    // material
    material = new THREE.PointsMaterial({
        size: params.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    })

    // points
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

generateGalaxy()
gui.close();
gui.add(params, 'count').min(1000).max(100000).step(1000).onFinishChange(() =>generateGalaxy())
gui.add(params, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(() =>generateGalaxy())
gui.add(params, 'radius').min(1).max(20).step(0.1).onFinishChange(() =>generateGalaxy())
gui.add(params, 'branches').min(1).max(20).step(1).onFinishChange(() =>generateGalaxy())
gui.add(params, 'spin').min(-5).max(5).step(0.01).onFinishChange(() =>generateGalaxy())
gui.add(params, 'randomness').min(0).max(2).step(0.01).onFinishChange(() =>generateGalaxy())
gui.add(params, 'randomPower').min(1).max(10).step(0.01).onFinishChange(() =>generateGalaxy())
gui.addColor(params, 'insideColor').onFinishChange(() =>generateGalaxy())
gui.addColor(params, 'outsideColor').onFinishChange(() =>generateGalaxy())

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 4
camera.position.z = 7
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()