const scene = new THREE.Scene(); //creating a scene
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); // to see something we need a camera

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight ); 
document.body.appendChild( renderer.domElement );

const light = new THREE.AmbientLight( 0xffffff )
scene.add( light )

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
directionalLight.castShadow = true
scene.add( directionalLight )
directionalLight.position.set( 0, 1, 1 )

camera.position.z = 5
background = renderer.setClearColor( 0x008800, 1);

const loader = new THREE.GLTFLoader();

const start_position = 5
const end_position = -start_position
const text = document.querySelector('.text')
const TIME_LIMIT = 10;
let gameState = "loading";
let isLookingBackward = true;

const loaderBackground = new THREE.TextureLoader();
const bgTexture = loaderBackground.load('./models/background.jpg');

scene.background = background;

var ballTexture;
ballTexture = loaderBackground.load('./models/ball.jpg');

camera.position.z = 5;

function createCube(size, posX, rotY = 0, color = 0xffffff){
    const geometry = new THREE.BoxGeometry( size.w, size.h, size.d )
    const material = new THREE.MeshBasicMaterial( { color } )
    const cube = new THREE.Mesh( geometry, material )
    cube.position.set(posX, 0, 0)
    cube.rotation.y = rotY
    scene.add( cube )
    return cube
}

function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Keeper{
    constructor(){
        loader.load('./models/keeper/scene.gltf', (gltf) =>{
            scene.add( gltf.scene );
            gltf.scene.scale.set(0.025,0.025,0.025);
            gltf.scene.position.set(0, 1, 0);
            this.Keeper = gltf.scene;
        })
    }

    lookBackward(){
        // this.Keeper.rotation.y = -3.15
        gsap.to(this.Keeper.rotation, {y: -3.15, duration: .45})
        setTimeout(() => isLookingBackward = true, 150)
    }
    lookForward(){
        gsap.to(this.Keeper.rotation, {y: 0, duration: .45})
        setTimeout(() => isLookingBackward = false, 450)

    }
    async start(){
        this.lookBackward()
        await delay((Math.random() * 1000) + 1000)
        this.lookForward()
        await delay((Math.random() * 750) + 750)
        this.start()
    }
}
class Goal{

    constructor(){

        loader.load('./models/goal/scene.gltf', (gltf) =>{
            scene.add( gltf.scene );
            gltf.scene.scale.set(0.009,0.009,0.009);
            gltf.scene.position.set(0, -0.5, 0);
            this.Goal = gltf.scene;
        })
    }
    goUp(){
        gsap.to(this.Goal.rotation, {x: -.15, duration: 1})

    }

}

class Player{
    constructor(){
    const geometry = new THREE.SphereGeometry( .3, 16, 8 );
    const material = new THREE.MeshBasicMaterial( { 
        color: 0xffffff,
        map:ballTexture
    } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.z = 1
    sphere.position.x = start_position
    scene.add( sphere );
    this.Player = sphere
    this.playerInfo = {
        positionX: start_position,
        velocity: 0
    }

    }

    run(){
        this.playerInfo.velocity = .03
    }

    stop(){
        gsap.to(this.playerInfo, {velocity: 0, duration: .4})
    }
    
    check(){
        if(this.playerInfo.velocity > 0 && !isLookingBackward){
            text.innerText = "You lost!"
            gameState = "over!"
        }
        if(this.playerInfo.positionX < end_position){
            text.innerText = "You won!"
            gameState = "over!"
        }
    }

    update(){
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity;
        this.Player.position.x = this.playerInfo.positionX;
    }
}

const player = new Player()

let keeper = new Keeper()
let goal = new Goal()

async function init(){
    await delay(500)
    text.innerText = "We start in 3"
    await delay(500)
    text.innerText = "We start in 2"
    await delay(500)
    text.innerText = "We start in 1"
    await delay(500)
    text.innerText = "Let's go"
    startGame()
}

function startGame(){
    gameState = "started"
    let progress = createCube({w: 5, h: .1, d: 1}, 0)
    progress.position.y = 3.35
    gsap.to(progress.scale, {x: 0, duration: TIME_LIMIT})
    setTimeout(() => {
        if(gameState != "over!"){
            text.innerText = "time's up"
            gameState = "over!"
        }
    }, TIME_LIMIT * 1000);
    keeper.start()
}

init()



setTimeout(() => {
    goal.goUp()
}, 1000);


function animate() {
    if(gameState == "over!") return
	renderer.render( scene, camera, player.update() );
    requestAnimationFrame( animate );

}
animate();

window.addEventListener( 'resize', onWindowResize, false);

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight);

}

window.addEventListener('keydown', function(e){
    if(gameState != "started") return
    if(e.key == "a"){
        player.run()
    }
})

window.addEventListener('keyup', function(e){
    if(e.key == "a"){
        player.stop()
    }
})