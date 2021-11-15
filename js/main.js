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
const TIME_LIMIT = 30;
let gameState = "loading";
let isLookingBackward = true;

const loaderBackground = new THREE.TextureLoader();
const bgTexture = loaderBackground.load('./models/background.jpg');

scene.background = background;

var ballTexture;
ballTexture = loaderBackground.load('./models/ball.jpg');

const gt = new THREE.TextureLoader().load( "./models/grasslight-big.jpg" );
const gg = new THREE.PlaneGeometry( 200, 200 );
const gm = new THREE.MeshPhongMaterial( { color: 0xffffff, map: gt } );
const ground = new THREE.Mesh( gg, gm );

ground.material.map.repeat.set( 64, 64 );
ground.material.map.wrapS = THREE.RepeatWrapping;
ground.material.map.wrapT = THREE.RepeatWrapping;
ground.material.map.encoding = THREE.sRGBEncoding;
ground.receiveShadow = true;

scene.add( ground );

let DEAD_PLAYERS = 0
let SAFE_PLAYERS = 0

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
            gltf.scene.position.set(0, 0.4, 1);
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
            gltf.scene.scale.set(0.009,0.009,0.004);
            gltf.scene.position.set(0, -0.5, 0);
            this.Goal = gltf.scene;
        })
    }
    goUp(){
        gsap.to(this.Goal.rotation, {x: -.15, duration: 1})

    }

}

class Player{
    constructor(name = "Player", radius = .25, posY = 0){
    const geometry = new THREE.SphereGeometry( .25, 16, 8 );
    const material = new THREE.MeshBasicMaterial( { 
        color: 0xffffff,
        map:ballTexture
    } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.position.z = 0.05
    sphere.position.x = start_position
    sphere.position.y = posY
    scene.add( sphere );
    this.Player = sphere
    this.playerInfo = {
        positionX: start_position,
        velocity: 0,
        name,
        isDead: false
    }

    }

    run(){
        if(this.playerInfo.isDead) return
        this.playerInfo.velocity = .03
    }

    stop(){
        gsap.to(this.playerInfo, {velocity: 0, duration: .4})
    }
    
    check(){
        if(this.playerInfo.isDead) return
        if(this.playerInfo.velocity > 0 && !isLookingBackward){
            text.innerText = this.playerInfo.name + " lost!"
            this.playerInfo.isDead = true
            this.stop()
            DEAD_PLAYERS++
            if(DEAD_PLAYERS == players.length){
                text.innerText = "No Winners" 
                gameState = "over!"
            }
            if(DEAD_PLAYERS + SAFE_PLAYERS == players.length){
                gameState = "over!"
            }
            
        }
        if(this.playerInfo.positionX < end_position){
            text.innerText = this.playerInfo.name + " won!"
            this.playerInfo.isDead = true
            this.stop()
            SAFE_PLAYERS++
            if(SAFE_PLAYERS == players.length){
                text.innerText = "Two Winners"
                gameState = "over!"
            }
            if(DEAD_PLAYERS + SAFE_PLAYERS == players.length){
                gameState = "over!"
            }
        }
    }

    update(){
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity;
        this.Player.position.x = this.playerInfo.positionX;
    }
}

const player1 = new Player("Player 1", .25, .3)
const player2 = new Player("Player 2", .25, -.3)

const players = [
    {
        player: player1,
        key: "ArrowUp",
        name: "Player 1"
    },
    {
        player: player2,
        key: "w",
        name: "Player 2"
    }
]


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
    players.map(player => player.player.update())
	renderer.render( scene, camera );
    if(gameState == "over!") return
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
    let p = players.find(player => player.key == e.key)
    if(p){
        p.player.run()
    }
})

window.addEventListener('keyup', function(e){
    let p = players.find(player => player.key == e.key)
    if(p){
        p.player.stop()
    }
})