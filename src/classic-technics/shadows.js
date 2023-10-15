import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Textures
const textureLoader = new THREE.TextureLoader()
const bakedShadow = textureLoader.load('/textures/bakedShadow.jpg')
const dynamicShadow = textureLoader.load('/textures/simpleShadow.jpg')

/**
 * Lights
 */

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(2, 2, - 1)
directionalLight.castShadow = true
const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLightCameraHelper.visible = false

// optimization
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
directionalLight.shadow.camera.far = 6
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.bototm = -2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.left = -2

// extra effects (blur)
// directionalLight.shadow.radius = 5

gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight, directionalLightCameraHelper)

// SpotLight
const spotLight = new THREE.SpotLight(0xffffff, 0.4, 10, Math.PI * 0.3)
spotLight.castShadow = true

// optimization
spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
spotLight.shadow.camera.fov = 30

spotLight.position.set(0, 2, 2)
scene.add(spotLight, spotLight.target)
const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
scene.add(spotLightCameraHelper)
spotLightCameraHelper.visible = false

// PointLight
const pointLight = new THREE.PointLight(0xffffff, 0.3)
pointLight.castShadow = true
pointLight.position.set(-1, 1, 0)

// optimiation
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024
pointLight.shadow.camera.far = 5
pointLight.shadow.camera.near = 0.1

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
scene.add(pointLight, pointLightCameraHelper)
pointLightCameraHelper.visible = false

/**
 * Materials
 */

const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)

sphere.castShadow = true
gui.add(sphere.position, 'x').min(0).max(10).step(0.1).name('pos-x')
gui.add(sphere.position, 'y').min(0).max(10).step(0.1).name('pos-y')
gui.add(sphere.position, 'z').min(0).max(10).step(0.1).name('pos-z')

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    // new THREE.MeshBasicMaterial({ map: bakedShadow })
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5
plane.receiveShadow = true

const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({ alphaMap: dynamicShadow, transparent: true, color: 0x000000 })
)
sphereShadow.position.y = plane.position.y + 0.01
sphereShadow.rotateX(-Math.PI * 0.5)
scene.add(sphere, plane, sphereShadow)

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
camera.position.x = 2
camera.position.y = 1
camera.position.z = 4
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
renderer.shadowMap.enabled = false
renderer.shadowMap.type = THREE.PCFSoftShadowMap

/**
 * Animate
 */
const clock = new THREE.Clock()

const animation = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update sphere
    sphere.position.x = Math.cos(elapsedTime) * 1.5
    sphere.position.z = Math.sin(elapsedTime) * 1.5
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 3))

    // Update shadow
    sphereShadow.position.x = sphere.position.x
    sphereShadow.position.z = sphere.position.z
    const posY = sphere.position.y * 2 + 0.5
    sphereShadow.scale.set(posY, posY, posY)
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.6

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(animation)
}

animation()

{/*
    Notes:
    1. Before the default render of the scene, 3js simulate putting the camera
    in place of the light source and make a shot. This will help it to understand
    what exactly the light see in front of him and which parts of the objects should be
    lighter and which darker. This shot also called as a shadow map.
    The more sources of light you have, the more shadows maps you store

    2. There are only three types of lights that can work with shadowws:
        - point light
        - directional light
        - spotlight
    
    3. By default the shadow map has a 512x512 resolution. By increasing this
    you can improve the shadow quality on the scene.

    4. Another way to tweak the quality is a working with camera position
    or its fov, decreasing its view the shadow details will look better

    5. PCFSoftShadowMap is less performant, a bit better in quality
    and do not support the blur effect of the shadow

    6. PointLight shadows is the least performant, since it force 3js
    to provide 6 additional renders before the initial one.

    7. Baked shadows is relevant when you are sure that the object is always static
    Baking shadows is provided by different 3d softwares, one of them - Blender.

    8. There is an intermediate way to use shadows - i called it a dynamic shadow.
    When adding those shadows as a material we have to use alphaMap instead of map,
    alpha - material color property which hide black and shows white (+ transparent: true)

    The trick of the dynamic shadow is to create a plane mesh and wrap it to the shadow texture.
    Then, inside the animation function, link the position/styles (ex.  opacity, scale) of that plane with the related object
    If the object moves - the plane follows it.
*/}