import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Fog
const fog = new THREE.Fog('#262837', 1, 25)
scene.fog = fog

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const doorAmbientTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')

const bricksColorTexture = textureLoader.load('/textures/bricks/color.jpg')
const bricksAmbientTexture = textureLoader.load('/textures/bricks/ambientOcclusion.jpg')
const bricksNormalTexture = textureLoader.load('/textures/bricks/normal.jpg')
const bricksRoughnessTexture = textureLoader.load('/textures/bricks/roughness.jpg')


const grassColorTexture = textureLoader.load('/textures/grass/color.jpg')
const grassAmbientTexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg')
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg')
const grassRoughnessTexture = textureLoader.load('/textures/grass/roughness.jpg')

grassColorTexture.repeat.set(8, 8)
grassAmbientTexture.repeat.set(8, 8)
grassNormalTexture.repeat.set(8, 8)
grassRoughnessTexture.repeat.set(8, 8)

grassColorTexture.wrapS = THREE.RepeatWrapping
grassAmbientTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassRoughnessTexture.wrapS = THREE.RepeatWrapping

grassColorTexture.wrapT = THREE.RepeatWrapping
grassAmbientTexture.wrapT = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping
grassRoughnessTexture.wrapT = THREE.RepeatWrapping

/**
 * House
 */

// Group
const house = new THREE.Group()
scene.add(house)

// Group.Walls
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({ 
        map: bricksColorTexture,
        aoMap: bricksAmbientTexture,
        normalMap: bricksNormalTexture,
        roughnessMap: bricksRoughnessTexture
     })
)
walls.position.setY(2.5 / 2)
house.add(walls)

// Group.Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 2, 4),
    new THREE.MeshStandardMaterial({ color: '#b35f45' })
)
house.add(roof)
roof.position.setY(3.5)
roof.rotateY(Math.PI * 0.25)

// Group.Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 32, 32),
    new THREE.MeshStandardMaterial({ 
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.1,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
    })
)
door.position.set(0, 1, 1.97)
house.add(door)

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.position.set(2.35, 0.3, 2.35)
bush1.scale.set(0.5, 0.5, 0.5)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.position.set(-2.35, 0.3, 2.35)
bush2.scale.set(0.5, 0.5, 0.5)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.position.set(2.85, 0.15, 2.85)
bush3.scale.set(0.25, 0.25, 0.25)

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.position.set(-2.85, 0.15, 2.85)
bush4.scale.set(0.25, 0.25, 0.25)

scene.add(bush1, bush2, bush3, bush4)

// Graves
const graves = new THREE.Group()
scene.add(graves)

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' })

for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 4 + Math.random() * 6

    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    const grave = new THREE.Mesh(graveGeometry, graveMaterial)
    grave.position.set(x, 0.3, z)
    grave.rotateY((Math.random() - 0.5) * 0.4)
    grave.rotateZ((Math.random() - 0.5) * 0.4)
    grave.castShadow = true 
    graves.add(grave)
}

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ 
        map: grassColorTexture,
        aoMap: grassAmbientTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture,
    })
)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
scene.add(floor)

/**
 * Lights
 */

// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.15)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#ffffff', 0.15)
moonLight.position.set(4, 5, - 2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(moonLight)

// Door light
const doorLight = new THREE.PointLight('#ff7d46', 1, 9)
doorLight.position.set(0, 2.2, 2.7)
house.add(doorLight)

// Ghosts
const ghost1 = new THREE.PointLight('#ff00ff', 2, 3)
const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
scene.add(ghost1, ghost2, ghost3)

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
camera.position.x = 4
camera.position.y = 2.7
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
renderer.setClearColor('#262837')

// Shadows
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

moonLight.castShadow = true
doorLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

walls.castShadow = true
bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
bush4.castShadow = true

floor.receiveShadow = true

// Shadows/Optimization
moonLight.shadow.mapSize.width = 256
moonLight.shadow.mapSize.height = 256 
moonLight.shadow.camera.far = 7 

doorLight.shadow.mapSize.width = 256
doorLight.shadow.mapSize.height = 256 
doorLight.shadow.camera.far = 7 

ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256 
ghost1.shadow.camera.far = 7 

ghost2.shadow.mapSize.width = 256
ghost2.shadow.mapSize.height = 256 
ghost2.shadow.camera.far = 7 

ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256 
ghost3.shadow.camera.far = 7 



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Update ghosts
    const ghost1Angle = elapsedTime / 1.5
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    ghost1.position.y = Math.sin(elapsedTime * 3)

    const ghost2Angle = - elapsedTime / 2.5
    ghost2.position.x = Math.cos(ghost2Angle) * 6
    ghost2.position.z = Math.sin(ghost2Angle) * 6
    ghost2.position.y = Math.sin(elapsedTime * 2) + Math.sin(elapsedTime * 3)

    const ghost3Angle = elapsedTime / 3.5
    ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.cos(elapsedTime * 0.32))
    ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.62))
    ghost3.position.y = Math.sin(elapsedTime * 1.5) + Math.sin(elapsedTime * 3.5) 

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

{/*
    Notes:
    1. A group is an empty object the main goal of that is to store
    logically related objects

    2. Read about texture wrapping and repeating
*/}