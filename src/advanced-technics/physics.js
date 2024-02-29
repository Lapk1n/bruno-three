import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as CANNON from 'cannon-es'
import * as lil from 'lil-gui'





/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/* Sound */
const hitSound = new Audio('/sounds/hit.mp3')
const playSound = (event) => {
    const impactStrengh = event.contact.getImpactVelocityAlongNormal()

    if (impactStrengh > 1) {
        hitSound.volume = Math.random()
        hitSound.currentTime = 0
        hitSound.play()
    }
}

/* CANNON */
const world = new CANNON.World()
// world.broadphase = new CANNON.SAPBroadphase(world)
// sleeping mode leads to bug
// world.allowSleep = true
world.gravity.set(0, -9.82, 0)

// Materials

// just a name, does not have any physic props
// the physic props will be added in contact material
const defaultMaterial = new CANNON.Material('default')

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7,
    }
)
world.addContactMaterial(defaultContactMaterial)

// instead of adding material prop to every body we can set is as default to all bodies
world.defaultContactMaterial = defaultContactMaterial

// Bodies
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
    mass: 0, // we aren't say that the floor is like air, we say it's static. This is the default param, no need to write
    shape: floorShape,
    // position: its already in the center, no need to provide
})

// we also need to rotate the floor body, just like we did for the floor mesh. But it canno js its not possible to call rotation method
// instead, we can use quaternion:
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0), // its like to stick an axis inside the object
    Math.PI * 0.5
)
world.addBody(floorBody)

/* THREE */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.8,
        roughness: 0.4,
        envMapIntensity: 0.5,
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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


// Utils
const objectsToUpdate = []

const createSphere = (radius, position) => {

    const sphereGeometry = new THREE.SphereGeometry(radius, 20, 20)
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: '#BA001F',
        metalness: 0.5,
        roughness: 0.4,
    })

    // THREE
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // CANNON
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass: 1,
        shape,
        material: defaultMaterial,
    })
    body.position.copy(position)
    body.addEventListener('collide', playSound)
    world.addBody(body)

    // save in obj to update
    objectsToUpdate.push({
        mesh,
        body
    })
}

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    color: '#4963CD',
    metalness: 0.4,
    roughness: 0.5,
})

const createBox = (width, height, depth, position) => {

    // THREE
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // CANNON
    // in case of box, we have to create a shape with so called half extent
    // it means we use the center mass
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))
    const body = new CANNON.Body({
        mass: 1,
        friction: 0.8,
        position: new CANNON.Vec3(position),
        shape,
        material: defaultMaterial,
    })
    body.position.copy(position)
    body.addEventListener('collide', playSound)
    world.addBody(body)

    // save in obj to update
    objectsToUpdate.push({
        mesh,
        body
    })
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-8, 4, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Debug
 */
const gui = new lil.GUI()
const debugObj = {
    createSphere: () => {
        createSphere(Math.random() * 0.5, { x: (Math.random() - 0.5) * 6, y: 3, z: (Math.random() - 0.5) * 6 })
    },
    createBox: () => {
        createBox(
        Math.random() * 1.5,
        Math.random() * 1.5,
        Math.random() * 1.5,
        { x: (Math.random() - 0.5) * 6, y: 3, z: (Math.random() - 0.5) * 6 })
    },
    reset: () => {
        for (const  obj of objectsToUpdate) {
            // remove body
            obj.body.removeEventListener('collide', playSound)
            world.removeBody(obj.body)
    
            // remove mesh
            scene.remove(obj.mesh)
    
            objectsToUpdate.splice(0, objectsToUpdate.length)
        }
        floor.rotation.x = - Math.PI * 0.5
        floorBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(-1, 0, 0), // its like to stick an axis inside the object
            Math.PI * 0.5
        )
    },
    liftFloorFromLeft: () => {
        floor.rotation.x = - Math.PI * 0.4
        floorBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(-1, 0, 0), // its like to stick an axis inside the object
            Math.PI * 0.4
        )
    },
    liftFloorFromRight: () => {
        floor.rotation.x = - Math.PI * 0.6
        floorBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(-1, 0, 0), // its like to stick an axis inside the object
            Math.PI * 0.6
        )
    }
}

gui.add(debugObj, 'createSphere')
gui.add(debugObj, 'createBox')
// gui.add(debugObj, 'reset')
gui.add(debugObj, 'liftFloorFromLeft')
gui.add(debugObj, 'liftFloorFromRight')


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaElapsedTime = elapsedTime - oldElapsedTime

    // Update physics world
    // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position)
    // 1 - fixed time step; 2 - time passed since the last step; 3 - how much iterations the world can apply to catch up a potential delay
    world.step(1 / 120, deltaElapsedTime, 3)

    // mesh.position.copy(body.position)
    // mesh.quaternion.copy(body.quaternion)

    // establish connection between CANNON world and THREE
    for (const obj of objectsToUpdate) {
        obj.mesh.position.copy(obj.body.position)
        obj.mesh.quaternion.copy(obj.body.quaternion)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

/*
    Notes:

    1. Best 3D physics libraries:
        - Ammo.js (better but harder)
        - Cannon.js (worse but easier)
        - Oimo.js
    2. Best 2D physics libraries:
        - Matter.js
        - P2.js
        - Planck.js
        - Box2D.js
    
    3. In general, there are two worlds (objects) that contains controls out objects on the scene
    The first is visual one - three js world, it shows us how objects looks and it is also able
    to provide some basic dynamics to objects. Antoher is hidden one - physics world. In our
    particular case this world is provided by CANNOn library. The thing is, under the scene this object
    contains information about scene objects coordinates. Connecting two worlds, we can achieve the 
    realistic behaviour on the view

    4. By default cannon js uses an algorithm called naive broadphase. This approach involves calculation of motion path
    regarding every object on the scene in order to track every possible collision properly. It allows us to achieve
    the most realistic world/behaviour. But the cost of it is performance. Another way to increase your performace is using SAPBroadphase.
    This approach is good for the slow objects. And if you scene is considered to use fast objects - this will lead you to the bugs.
    The point of the last one is to separate objects by zones where they can collide with each other

    5. An interesting thing - even if all the scene became static and objects are not moving, cannon continues to calculate the possible
    collision event if the advanced algorithm of broadphase is enabled. The next step to increase the performance is to enable sleeping mode.
    In this mode, if objects stoped movings the calculation will be also stoped

    6. Performance optimization trick - using workers. This approach allows use to assign the physics world calculation to another core
    of your CPU while the default one will continue to work with rest JS.

    7. Cannon js hasnt been updated for years, however there are some enthusiastic guys that continue update it in the fork called
    cannon-es
*/