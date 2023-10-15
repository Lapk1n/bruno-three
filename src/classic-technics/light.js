import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'

THREE.ColorManagement.enabled = false

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.3)
directionalLight.position.x = 2
scene.add(directionalLight)

const hemisphereLight = new THREE.HemisphereLight(0xff00ff, 0x00ff00, 0.5)
scene.add(hemisphereLight)

const pointLight = new THREE.PointLight(0xf0ff0f, 0.5, 10, 2)
pointLight.position.set(1, -0.3, 0.9)
scene.add(pointLight)

const rectLight = new THREE.RectAreaLight(0x4e00ff, 2, 2, 1)
rectLight.position.set(-1, 0, 1.5)
rectLight.lookAt(new THREE.Vector3())
scene.add(rectLight)

const spotLight = new THREE.SpotLight(0x78ff00, 1, 6, Math.PI * 0.1, 0.25, 1)
spotLight.position.set(0, 2, 3)
scene.add(spotLight)

// Helpers
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2)
const rectLightHelper = new RectAreaLightHelper(rectLight)
const spotLightHelper = new THREE.SpotLightHelper(spotLight)
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
scene.add(directionalLightHelper, hemisphereLightHelper, pointLightHelper, rectLightHelper, spotLightHelper)

// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, cube, torus, plane)

// Sizes 
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animate
const clock = new THREE.Clock()

const animation = () =>
{
    const elapsedTime = clock.getElapsedTime()

    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    controls.update()
    renderer.render(scene, camera)

    window.requestAnimationFrame(animation)
}

animation()

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

/*
    Notes:

    - mesh standard material demands a light
    unless you cant see anything

    - by default the light comes from the top vertically
    - light is pointed to the center of the scene

    - the directional light acts like the sun
    - the distance for directional light does not matter

    - the hemisphere light has two opposite parts:
        the first one light from bottom, the second one from the top
        the positions also could be changed

    - the point light has an ability to control the distance
        of the light power 
    
    - the rectAreaLight is only working with standard and physic
        materials

    - adding lights is quite expensive in terms of performace
        sm cost: ambient, hemisphere
        md cost: directional, point
        lg cost: spot, rect
    
    - but since adding lights is super important in terms of realistic
        view, the solution of how to add a lot of lights but keep the performance
        is to use baking. Baking - the process when you merge a texture with
        a light
    
    - using helpers allows us to see the position and direction of the light
*/