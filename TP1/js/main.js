import Dude from "./Dude.js";

let canvas;
let engine;
let scene;
// vars for handling inputs
let inputStates = {};

window.onload = startGame;

let center_canard = false;
function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);
    scene = createScene();

    // modify some default settings (i.e pointer events to prevent cursor to go 
    // out of the game window)
    modifySettings();

    // let tank = scene.getMeshByName("heroTank");
    
    engine.runRenderLoop(() => {
        let deltaTime = engine.getDeltaTime(); // remind you something ?
        
        // tank.move();
        let canard = scene.getMeshByName("voxel_duck");
        if(canard){
            if(!center_canard){
                let followCamera = createFollowCamera(scene, canard);
                followCamera.rotationOffset = 0;
                scene.activeCamera = followCamera;
                center_canard = true;
            }
            canard.move();
        }
        // decrease the cooldown but not below 0
        dashCooldown = Math.max(0, dashCooldown - deltaTime/1000);

        let heroDude = scene.getMeshByName("heroDude");
        if(heroDude)
            heroDude.Dude.move(scene);

        scene.render();
    });
}

function createScene() {
    let scene = new BABYLON.Scene(engine);
    let ground = createGround(scene);
    // let freeCamera = createFreeCamera(scene);

    // let tank = createTank(scene);

    // second parameter is the target to follow
    // let followCamera = createFollowCamera(scene, tank);
    // scene.activeCamera = followCamera;

    const camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    createLights(scene);

    createHeroDude(scene);
    loadMeshGLB("voxel_duck", scene, undefined, undefined, undefined, undefined, true, 1);
    loadMeshGLB("house", scene, 50, 0, 0, 80, false, 0);

    // loadMeshGLB(scene, "voxel_duck");


    return scene;
}

function loadMeshGLB(name, scene, position_x=0, position_y=0, position_z=5, max_width=5, moving=false, speed=2){
    BABYLON.SceneLoader.ImportMeshAsync("", "models/", name+".glb", scene).then((result) => {
        var listMesh = [];
        for(let geo of result.geometries){
            listMesh.push(scene.getNodeById(geo.id));
        }
        let modelGLB = BABYLON.Mesh.MergeMeshes(listMesh, true, true, undefined, false, true);

        let bounds = modelGLB.getBoundingInfo();
        var size_x = Math.abs(bounds.minimum.x - bounds.maximum.x);
        var size_y = Math.abs(bounds.minimum.y - bounds.maximum.y);
        var size_z = Math.abs(bounds.minimum.z - bounds.maximum.z);

        var scale_adapt = Math.max(size_x, size_z);
        var scale_factor = max_width/scale_adapt;
        modelGLB.scaling = new BABYLON.Vector3(scale_factor, scale_factor, scale_factor);

        modelGLB.position.x = position_x;
        modelGLB.position.z = position_y;
        modelGLB.position.y = position_z;
        modelGLB.name = name;
        modelGLB.speed = 1;
        modelGLB.frontVector = new BABYLON.Vector3(0, 0, 1);
        if(moving){
            modelGLB.move = () => {
                let yMovement = 0;
                if(modelGLB.position.y > 2) {
                    zMovement = 0;
                    yMovement = -2;
                }
                if(inputStates.up) {
                    modelGLB.moveWithCollisions(modelGLB.frontVector.multiplyByFloats(-modelGLB.speed, -modelGLB.speed, -modelGLB.speed));
                }
                if(inputStates.down) {
                    modelGLB.moveWithCollisions(modelGLB.frontVector.multiplyByFloats(modelGLB.speed, modelGLB.speed, modelGLB.speed));
                }
                if(inputStates.left) {
                    modelGLB.rotation.y -= 0.04;
                    modelGLB.frontVector = new BABYLON.Vector3(Math.sin(modelGLB.rotation.y), 0, Math.cos(modelGLB.rotation.y));
                }
                if(inputStates.right) {
                    modelGLB.rotation.y += 0.04;
                    modelGLB.frontVector = new BABYLON.Vector3(Math.sin(modelGLB.rotation.y), 0, Math.cos(modelGLB.rotation.y));
                }
            };
        }
    });
}

function createGround(scene) {
    const groundOptions = { width:500, height:500, subdivisions:20, minHeight:0, maxHeight:100, onReady: onGroundCreated};
    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", 'images/hmap1.png', groundOptions, scene); 

    function onGroundCreated() {
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/cracked_deepslate_bricks.png");
        ground.material = groundMaterial;
        // to be taken into account by collision detection
        ground.checkCollisions = true;
        //groundMaterial.wireframe=true;
    }
    return ground;
}

function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-1, -1, 0), scene);

}

function createFreeCamera(scene) {
    let camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 50, 0), scene);
    camera.attachControl(canvas);
    // prevent camera to cross ground
    camera.checkCollisions = true; 
    // avoid flying with the camera
    camera.applyGravity = true;

    // Add extra keys for camera movements
    // Need the ascii code of the extra key(s). We use a string method here to get the ascii code
    camera.keysUp.push('z'.charCodeAt(0));
    camera.keysDown.push('s'.charCodeAt(0));
    camera.keysLeft.push('q'.charCodeAt(0));
    camera.keysRight.push('d'.charCodeAt(0));
    camera.keysUp.push('Z'.charCodeAt(0));
    camera.keysDown.push('S'.charCodeAt(0));
    camera.keysLeft.push('Q'.charCodeAt(0));
    camera.keysRight.push('D'.charCodeAt(0));

    return camera;
}

function createFollowCamera(scene, target) {
    let camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);

    camera.radius = 40; // how far from the object to follow
	camera.heightOffset = 14; // how high above the object to place the camera
	camera.rotationOffset = 180; // the viewing angle
	camera.cameraAcceleration = .1; // how fast to move
	camera.maxCameraSpeed = 5; // speed limit

    return camera;
}

let zMovement = 5;
let dashFactor = 4;
// make a cooldown for the dash
let coolDownValue = 10;
let dashDuration = 1;
let dashCooldown = coolDownValue;

function createTank(scene) {
    let tank = new BABYLON.MeshBuilder.CreateBox("heroTank", {height:1, depth:6, width:6}, scene);
    let tankMaterial = new BABYLON.StandardMaterial("tankMaterial", scene);
    tankMaterial.diffuseColor = new BABYLON.Color3.Red;
    tankMaterial.emissiveColor = new BABYLON.Color3.Blue;
    tank.material = tankMaterial;

    // By default the box/tank is in 0, 0, 0, let's change that...
    tank.position.y = 0.6;
    tank.speed = 1;
    tank.frontVector = new BABYLON.Vector3(0, 0, 1);

    tank.move = () => {
        let yMovement = 0;

        if (tank.position.y > 2) {
            zMovement = 0;
            yMovement = -2;
        } 
        //tank.moveWithCollisions(new BABYLON.Vector3(0, yMovement, zMovement));

        if(inputStates.dash) {
            tank.moveWithCollisions(tank.frontVector.multiplyByFloats(dashFactor*tank.speed, dashFactor*tank.speed, dashFactor*tank.speed));
            if((coolDownValue - dashCooldown)>dashDuration) {
                inputStates.dash = false;
            }
        }else{
            if(inputStates.up) {
                //tank.moveWithCollisions(new BABYLON.Vector3(0, 0, 1*tank.speed));
                tank.moveWithCollisions(tank.frontVector.multiplyByFloats(tank.speed, tank.speed, tank.speed));
            }    
            if(inputStates.down) {
                //tank.moveWithCollisions(new BABYLON.Vector3(0, 0, -1*tank.speed));
                tank.moveWithCollisions(tank.frontVector.multiplyByFloats(-tank.speed, -tank.speed, -tank.speed));
    
            }    
            if(inputStates.left) {
                //tank.moveWithCollisions(new BABYLON.Vector3(-1*tank.speed, 0, 0));
                tank.rotation.y -= 0.02;
                tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));
            }    
            if(inputStates.right) {
                //tank.moveWithCollisions(new BABYLON.Vector3(1*tank.speed, 0, 0));
                tank.rotation.y += 0.02;
                tank.frontVector = new BABYLON.Vector3(Math.sin(tank.rotation.y), 0, Math.cos(tank.rotation.y));
            }
        }
    }
    return tank;
}

function createHeroDude(scene) {
   // load the Dude 3D animated model
    // name, folder, skeleton name 
    BABYLON.SceneLoader.ImportMesh("him", "models/Dude/", "Dude.babylon", scene,  (newMeshes, particleSystems, skeletons) => {
        let heroDude = newMeshes[0];
        heroDude.position = new BABYLON.Vector3(0, 0, 5);  // The original dude
        // make it smaller 
        heroDude.scaling = new BABYLON.Vector3(0.2  , 0.2, 0.2);
        //heroDude.speed = 0.1;

        // give it a name so that we can query the scene to get it by name
        heroDude.name = "heroDude";

        // there might be more than one skeleton in an imported animated model. Try console.log(skeletons.length)
        // here we've got only 1. 
        // animation parameters are skeleton, starting frame, ending frame,  a boolean that indicate if we're gonna 
        // loop the animation, speed, 
        let a = scene.beginAnimation(skeletons[0], 0, 120, true, 1);

        let hero = new Dude(heroDude, 0.1)

    });
}


window.addEventListener("resize", () => {
    engine.resize()
});

function modifySettings() {
    // as soon as we click on the game window, the mouse pointer is "locked"
    // you will have to press ESC to unlock it
    scene.onPointerDown = () => {
        if(!scene.alreadyLocked) {
            console.log("requesting pointer lock");
            canvas.requestPointerLock();
        } else {
            console.log("Pointer already locked");
        }
    }

    document.addEventListener("pointerlockchange", () => {
        let element = document.pointerLockElement || null;
        if(element) {
            // lets create a custom attribute
            scene.alreadyLocked = true;
        } else {
            scene.alreadyLocked = false;
        }
    })

    // key listeners for the tank
    inputStates.left = false;
    inputStates.right = false;
    inputStates.up = false;
    inputStates.down = false;
    inputStates.space = false;
    inputStates.dash = false;
    
    //add the listener to the main, window object, and update the states
    window.addEventListener('keydown', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
            inputStates.left = true;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
            inputStates.up = true;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
            inputStates.right = true;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
            inputStates.down = true;
        }  else if ((event.key === " ") && (dashCooldown == 0)) {
            dashCooldown = coolDownValue;
            inputStates.dash = true;
        }
    }, false);

    //if the key will be released, change the states object 
    window.addEventListener('keyup', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
            inputStates.left = false;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
            inputStates.up = false;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
            inputStates.right = false;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
            inputStates.down = false;
        }
    }, false);
}

