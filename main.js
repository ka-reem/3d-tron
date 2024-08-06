
// importing three.js library
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js'; 
// using third person camera that follows player around instead // lets the camera move around via mouse/keyboard
// import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js'; 
// import gltf files that have our renders
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';

// class ThirdPersonCamera {
//   constructor(params) {
//     this._params = params;
//     this._camera = params.camera;
//     this._target = params.target;

//     this._currentPosition = new THREE.Vector3();
//     this._currentLookat = new THREE.Vector3();
//   }

//   // Implement methods to calculate the ideal offset and look-at position based on your requirements.

//   // Inside your third-person camera class
// // _CalculateIdealLookat() {
// //   // Calculate the ideal look-at position based on your requirements.
// //   // This can depend on the player's position and rotation.
// // }

//   update(timeElapsed) {
//     const idealOffset = this._CalculateIdealOffset();
//     const idealLookat = this._CalculateIdealLookat();

//     // Interpolate between current and ideal positions/look-at.
//     const t = 1.0 - Math.pow(0.001, timeElapsed);
//     this._currentPosition.lerp(idealOffset, t);
//     this._currentLookat.lerp(idealLookat, t);

//     // Set the camera's position and look-at.
//     this._camera.position.copy(this._currentPosition);
//     this._camera.lookAt(this._currentLookat);
//   }
// }

let globalWallsArr = [];
const mapSize = 300;
let isGameOver = false;


class BasicWorldDemo {
  constructor() {
    this._playerRotation = 0; // keep track of players rotation so its relative to direction its moving 
    this._Initialize();
    this._JetWall(); // wall that is created behind the player
    this._playerFrontalPosition = 0; // compare this position with wall
    // this._wallsArr = []; // store all JetWalls positions
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({ // sets up webgl render which pops everything up on the screen
      antialias: true, // ?
    });
    // render set up
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    // presepective camera
    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // this._camera.position.set(35, 2, 0); // sets the cameras intial position (x,y,z)
    this._camera.position.set(0,2,15) // change this position relative to where the player goes ***

    this._scene = new THREE.Scene(); // scene: serves as container for all our 3d objects in the world

    // lighting setup 
    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0); // directional light created for shadows
    light.position.set(20, mapSize, 10); // previously 100, assuming its grabbing from mapSize
    light.target.position.set(0, 0, 0);
    light.castShadow = true;            
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = mapSize;
    light.shadow.camera.right = -mapSize;
    light.shadow.camera.top = mapSize;
    light.shadow.camera.bottom = -mapSize;
    this._scene.add(light);     

    light = new THREE.AmbientLight(0x101010); // make sure everything is lit up
    // this._scene.add(light);

    // thirs person camera
    // third person camera
    // this._thirdPersonCamera = new ThirdPersonCamera({
    //   camera: this._camera,
    //   target: this._player, 
    // });
    
    // orbit controls
    // const controls = new OrbitControls( // lets the user to move the cameras position using arrow or mouse controls
    // this._camera, this._threejs.domElement);
    // controls.target.set(0, 5, 0); // (x,y,z) // where camera points
    // controls.update(); 

    const loader = new THREE.CubeTextureLoader();
    // load a background if you want
    // const texture = loader.load([ // load background
    //     './resources/pic1.jpg', // here you can download a skybox which is basically yourself in a cube, where each side represents a picture
    //     './resources/...jpg',
    //     './resources/pic6.jpg',
    // ]);
    // this._scene.background = texture;


    this._threejs.setClearColor(new THREE.Color(0x090f00)); // background color, dark green

    // const mapSize = 1000 // originally 100 on vm - now initialized somewhere above
    const plane = new THREE.Mesh( // render a 3d plane which in this case is our ground
      
        // new THREE.PlaneGeometry(100, 100, 10, 10),  // (width, height, widthSegments, heightSegments), w/h segments determine subdivisions,
        new THREE.PlaneGeometry(mapSize, mapSize, 10, 10),  // (width, height, widthSegments, heightSegments), w/h segments determine subdivisions,
        // this is supposed to make it opaque but gets rid of grid
        // new THREE.MeshStandardMaterial({
        //     color: 0x611919,
        //     opacity: 0.5, 
        //     transparent: true,
        //     side: THREE.DoubleSide, // it does make it translucent on bottom
        // }),
        createGrid() // creates white grid lines along plane
        
    );


    
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);
    
    function createGrid() {
        const canvas = document.createElement('canvas'); // make a new canvas
        const context = canvas.getContext('2d');
        const size = 512; // resolution, 1024 or 2048 will make it more defined
    
        canvas.width = size;
        canvas.height = size;
     
        context.fillStyle = '#611919'; // Dark red
        context.fillRect(0, 0, size, size);

        
    
        context.strokeStyle = '#ffffff'; // white grid lines
        context.lineWidth = 2;
    
        // grid lines
        for (let i = 0; i < 10; i++) {
            const pos = i * size/4;
            context.beginPath();
            context.moveTo(pos, 0);
            context.lineTo(pos, size);
            context.stroke();
            context.beginPath();
            context.moveTo(0, pos);
            context.lineTo(size, pos);
            context.stroke();
        }
    
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10); // Adjust the repeat factor as needed
    
        return new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide, // places grid on bottom giving cool effect
        });
    }

    
    // const box = new THREE.Mesh( // create a box
    //   new THREE.BoxGeometry(0, 0, 0), // (width, height, length)
    //   new THREE.MeshStandardMaterial({
    //       color: 0xFFFFFF,
    //   }));
    // box.position.set(0, 1, 0);
    // box.castShadow = true;
    // box.receiveShadow = true;
    // this._scene.add(box);
    this._LoadModel();
    this._RAF();
} // end of main class


_LoadModel() {
    const loader = new GLTFLoader();
    // console.log('hi')
    // loader.load('/home/kareem/Downloads/tron_moto_sdc__free/scene.gltf', (gltf) => {
    // loader.load('./tron_moto_sdc__free/classic_tron_lightcycle.glb', (gltf) => {
        loader.load('./tron_moto_sdc__free/classic-1982-tron-light-cycle-blue-blend.glb', (gltf) => {

        const player = gltf.scene; // set the player object to the render
        this._player = player;


        // console.log(gltf); // debugging

        // gltf.scene.scale.set(.0025, .0025, .0025); // make sure its big enough
        // gltf.scene.scale.set(25,25,25);

        // gltf.scene.position.set(0, 20, 0);

    //   gltf.scene.traverse(c => {
    //     c.castShadow = true;
    //   });

    // downscale
    
      // this._scene.add(gltf.scene);
      this._scene.add(player);
      this._JetWall(); // Call _JetWall after loading the player model
      // scene.add(player)
    });
 
    const speed = 0.3 // const just b/c faster speeds will create gaps in wall, meaning also no boost implemented
    // var playerFrontalPosition; // compare this position with wall  // needs a bigger scoope
    window.addEventListener("keydown", (e) => {
      if(e.key === 'd' || e.key === 'D' || e.key === "ArrowRight"){ // resolved: right/left arrow conflicts with orbit controls
        // console.log('Key pressed:', e.key);
        console.log(this._playerRotation) 
        this._moveRight = true;
        this._playerRotation += 90; 
        this._player.rotateY(-Math.PI / 2);
        

        // adjust for wall gap when rotating player
        switch (this._playerRotation){
          case 360: // this doesn't get updated from 360 to 0 until after
            this._player.position.z -= speed + 0.1 ;
            this._player.position.x += 0.37;
            // console.log("turned")
            break;
          case 90:
           // played around with these values until wall gap was removed
            this._player.position.x += speed + 0.1; // move forward when turning
            this._player.position.z += 0.37; // initial position
            break;
          case 180:
            this._player.position.z += speed + 0.1;
            this._player.position.x -= 0.37;
            break;
          case 270:
            this._player.position.x -= speed + 0.1;
            this._player.position.z -= 0.37;
            break;
          default:
  
        }
      }

      if(e.key === 'a' || e.key === 'A' || e.key === "ArrowLeft"){
        console.log(this._playerRotation) 
        console.log('Key pressed:', e.key);    
        this._moveLeft = true;
        this._playerRotation -= 90;
        this._player.rotateY(Math.PI / 2);
        

                
        switch (this._playerRotation){
          case 0:
            this._player.position.z -= speed + 0.1 ;
            this._player.position.x -= 0.37; // since we're going in the opposite direction we negate this number for all cases
            break;
          case 90:
            this._player.position.x += speed + 0.1 ; // move forward when turning
            this._player.position.z -= 0.37; // initial position
            break;
          case 180:
            this._player.position.z += speed + 0.1;
            this._player.position.x += 0.37;
            break;
          case -90: // this doesn't get updated from -90 to 270 until after
            this._player.position.x -= speed + 0.1;
            this._player.position.z += 0.37;
            break;
          default:
  
        }

        
      }

      
      if(this._playerRotation >= 360) // only done by going right
        this._playerRotation = 0
      else if (this._playerRotation < 0) // only done by going left 
        this._playerRotation = 270; 
      // console.log(this._playerRotation);

    });
    

  }

  _JetWall() { 
    /*
      issues to be aware of: the faster the speed the wider the wall needs to be to not create gaps, also might be dependent on users fps
                              if we include a boost feature, we would need to make a longer wall, maybe pass in a default boolean parameters
                              and if set to true create longer walls this way we avoid unnecessary added lag when we don't need it
    */
    let xPos = this._player.position.x  // can't use const values as we need to change them without messing with players position
    let yPos = this._player.position.y 
    let zPos = this._player.position.z 

    let wallLength; 
    let wallWidth; 
    const wallHeight = 1.95

    // wall stays parallel with player
    if(this._playerRotation === 90 || this._playerRotation === 270){   
      wallLength = 0.8
      wallWidth = 0.05   
    } else{ // 0 || 180
      wallLength = 0.05
      wallWidth = 0.8
    }

    
    const wallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, wallWidth); // (x,y,z)

    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // Adjust the color as needed
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);

    wall.position.set(xPos, yPos, zPos);

    



    this._scene.add(wall);
    
    // store each wall thats created into an array, this'll let us compare players position to all existing walls checking if it collides
    globalWallsArr.push(wall);
    // console.log("wall: ", wall);

    // ******** FOR COLLISIONS *****************************************************


    function checkCollision(box1, box2) {
      // Extract position and dimensions of each box
      // box1 = player collision box
      // box2 = wall                                                          // if players fps is too low can the go through walls being undetected?
      const pos1 = box1.position.clone();                                     // maybe i should scale down the walls when they're created
      const dims1 = new THREE.Vector3().copy(box1.scale).multiplyScalar(0.1); // bad solution but this makes the players hitbox smaller and gets rid of non-existent collisions I had earlier

      const pos2 = box2.position.clone();
      const dims2 = new THREE.Vector3().copy(box2.scale).multiplyScalar(0.3); // anything below 0.3 has issues detecting collision
      
      // check for collision
      const collisionX = Math.abs(pos1.x - pos2.x) < (dims1.x + dims2.x);
      const collisionZ = Math.abs(pos1.z - pos2.z) < (dims1.z + dims2.z);

      if(!isGameOver){ // fixes issue where it'll check for collision before restarting game causing it get stuck
        // out of bounds collision // bounds for reference: new THREE.PlaneGeometry(100, 100, 10, 10), // 50 in each direction(+/-)
        if(Math.abs(pos1.x) > mapSize / 2 || Math.abs(pos1.z) > mapSize / 2 ){ // mapSize was previously 50
          console.log("out of bounds")
          return true;
        }
      // console.log(pos1.x)

        
        //
        return collisionX && collisionZ;
     }
  }


  function wallLoop(wall2){
    for (const wall of globalWallsArr) {
      // const lastWall = wall.position; // not actually lastWall
      if (checkCollision(wall2, wall)) {  
          console.log("collision")
          endGame();
          // return; // Stop checking further walls after the first collision
      }
      // console.log("wall2 pos:",wall2.position.x, wall2.position.y, wall2.position.z)
      // console.log("wall1 pos:", lastWall.x, lastWall.y, lastWall.z);


      // console.log("wall1 pos:",wall.position.x, wall.position.y, wall.position.z)
      // console.log("wall1 pos:", wall) // gives us hash
      // else 
    //   console.log('no collision')  
    }
  }

  function endGame(){
    // alert("Game Over!");
    // return;
    // doesnt work yet:
    isGameOver = true; // fix issue with game checking out of bounds or collision before reloading the webpage causing infinitly stuck
    if (confirm("Game Over!\n\nDo you want to restart?")) 
      // Reload the page to restart the game
      location.reload();


  }


// this keyword is having trouble binding with passed wall parameter
//  function removeWallAfterDelay(wall) { // comment out functions content for hitbox debugging
//     setTimeout(() => {
//       this._scene.remove(wall);
//     }, 1000 / 10); // adjust denominator based on fps, updates every 10fps in this case
//   }


    // const wallGeometry2 = new THREE.BoxGeometry(wallLength, wallHeight+3, wallWidth); // (x,y,z)

    const wallMaterial2 = new THREE.MeshStandardMaterial({ 
      color: 0xFF10F0, // pink for debugging
      transparent: true, // set to false for debugging collision hit box
      opacity: 0,
    });
    // const wall2 = new THREE.Mesh(wallGeometry2, wallMaterial2);
    

    // wall2.position.set(xPos, yPos, zPos);

    // this._scene.add(wall2); // debugging, shows hitbox/players' collision box

    const hitBoxWidth = 0.35
    const hitBoxDebuggerHeight = 3;
    // const hitBoxOffSet = 3;
    // const offSetToNotCollideWithSelf = -1;
    let debugShowAllHitBoxes = false;

    // got lazy and messy here
    switch (this._playerRotation){
      case 0: // initial direction
        // this._player.position.z -= speed;
        // this._playerFrontalPosition = this._player.position.z - 0.3; 
        // const wallGeometry2 = new THREE.BoxGeometry(wallLength-2, wallHeight+3, wallWidth+1); // (x,y,z)
        // wall2.position.set(xPos, yPos, zPos);
        const wallGeometryCase0 = new THREE.BoxGeometry(wallLength + hitBoxWidth -0.2 , wallHeight + hitBoxDebuggerHeight, wallWidth -1); // (x, y, z)
        const wall2Case0 = new THREE.Mesh(wallGeometryCase0, wallMaterial2);
        wall2Case0.position.set(xPos , yPos, zPos - 0.45 - .6); // -0.45 will place the hitbox in a spot where it won't collide with the wall in front of it but its also too far behind that it collides with the wall thats being created, assuming this is due to fps issues
        this._scene.add(wall2Case0); // debugging, shows hitbox/players' collision box
        wallLoop(wall2Case0);
        if (!debugShowAllHitBoxes)
          setTimeout(() => { // remove the wall after we check if its colliding or not
            this._scene.remove(wall2Case0);
          }, 1000 / 10); // adjust denominator based off of fps, right now updates every 10fps
        break;
      case 90:
        const wallGeometryCase90 = new THREE.BoxGeometry(wallLength  -1 , wallHeight + hitBoxDebuggerHeight, wallWidth + hitBoxWidth); // (x, y, z)
        const wall2Case90 = new THREE.Mesh(wallGeometryCase90, wallMaterial2);
        wall2Case90.position.set(xPos  + 0.45 + .6, yPos, zPos);
        this._scene.add(wall2Case90); 
        wallLoop(wall2Case90);
        if (!debugShowAllHitBoxes)
          setTimeout(() => { 
            this._scene.remove(wall2Case90);
          }, 1000 / 10); 
        break;
      case 180:
        const wallGeometryCase180 = new THREE.BoxGeometry(wallLength + hitBoxWidth , wallHeight + hitBoxDebuggerHeight, wallWidth -1); // (x, y, z)
        const wall2Case180 = new THREE.Mesh(wallGeometryCase180, wallMaterial2);
        wall2Case180.position.set(xPos , yPos, zPos + 0.45 + .6);
        this._scene.add(wall2Case180); // debugging, shows hitbox/players' collision box
        wallLoop(wall2Case180);
        if (!debugShowAllHitBoxes)
          setTimeout(() => { 
            this._scene.remove(wall2Case180);
          }, 1000 / 10); 
        break;
      case 270:
        const wallGeometryCase270 = new THREE.BoxGeometry(wallLength  -1 , wallHeight + hitBoxDebuggerHeight, wallWidth + hitBoxWidth); // (x, y, z)
        const wall2Case270 = new THREE.Mesh(wallGeometryCase270, wallMaterial2);
        wall2Case270.position.set(xPos  - 0.45 - .6, yPos, zPos);
        this._scene.add(wall2Case270); // debugging, shows hitbox/players' collision box
        wallLoop(wall2Case270);
        if (!debugShowAllHitBoxes)
          setTimeout(() => { // remove the wall after we check if its colliding or not
            this._scene.remove(wall2Case270);
          }, 1000 / 10); 
        break;
      default:

    }
    

    


  //   // check for collision
  //   for (const wall of globalWallsArr) {
  //     // const lastWall = wall.position; // not actually lastWall
  //     if (checkCollision(wall2, wall)) {  
  //         console.log("collision")
  //         // return; // Stop checking further walls after the first collision
  //     }
  //     // console.log("wall2 pos:",wall2.position.x, wall2.position.y, wall2.position.z)
  //     // console.log("wall1 pos:", lastWall.x, lastWall.y, lastWall.z);


  //     // console.log("wall1 pos:",wall.position.x, wall.position.y, wall.position.z)
  //     // console.log("wall1 pos:", wall) // gives us hash
  //     // else 
  //     //   console.log('no collision')  
  // }

  // debugging marker.wall2 = players frontal position(similiar to a hit box but ours is off center/frontal), check if it collides with any walls
  // setTimeout(() => {
  //   this._scene.remove(wall2);
  // }, 1000 / 10); // adjust denominator based off of fps, right now updates every 10fps

  let fps = 0;
  let lastTime = performance.now();
  
  // Create a div element for displaying FPS
  const fpsDisplay = document.createElement("div");
  fpsDisplay.style.position = "absolute";
  fpsDisplay.style.top = "10px";
  fpsDisplay.style.left = "10px";
  fpsDisplay.style.color = "pink";
  fpsDisplay.style.zIndex = "9999";
  document.body.appendChild(fpsDisplay);
  
  function updateFPS() {
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;
    lastTime = currentTime;
  
    fps = 1000 / elapsed;
  
    // elapsed will sometimes = 0, outputting infinity 
    if(elapsed != 0)
      fpsDisplay.textContent = "FPS: " + fps.toFixed(2);
  
    // Call the next frame
    console.log("running");
    
    requestAnimationFrame(updateFPS);
  }

  if(1 === Math.floor(Math.random() * 100) + 1)// works but not the way its supposed to
    updateFPS();



  }

  _CameraPosition(){

    // CHOPPY APROACH
    // const height = 7.5;
    // const distanceFromPlayer = 17;

    // switch (this._playerRotation){
    //   case 0: // initial direction
    //     this._camera.rotation.set(0, 0, 0);
    //     this._camera.position.set(this._player.position.x, height, this._player.position.z + distanceFromPlayer ); 
    //     break;
    //   case 90:
    //     this._camera.rotation.set(0, -Math.PI / 2, 0);
    //     this._camera.position.set(this._player.position.x - distanceFromPlayer, height, this._player.position.z ); 
    //     break;
    //   case 180:
    //     this._camera.rotation.set(0, -Math.PI, 0);
    //     this._camera.position.set(this._player.position.x  , height, this._player.position.z  - distanceFromPlayer ); 
    //     break;
    //   case 270: // this
    //     this._camera.rotation.set(0, Math.PI / 2, 0);
    //     this._camera.position.set(this._player.position.x  + distanceFromPlayer , height, this._player.position.z ); 
    //     break;
    //   default:

    // }

    // this._camera.rotation.y = THREE.MathUtils.lerp(this._camera.rotation.y*-1, 0, 0.1) // something like this can be the camera shake when you boost if we implement a boost
    /****************/

      const height = 7.5;
      const distanceFromPlayer = 17;


  
      let targetRotation = 0;
      let currentRotation = this._camera.rotation.y; // c
  
      switch (this._playerRotation) {
          case 0:

              targetRotation = 0;
              break;
          case 90:
              targetRotation = -Math.PI / 2; 
              break;
          case 180: // this needs to change from negative to positive depending if you're turning from a 90 deg angle into a 180 or 270 into a 180. the only problem is that if the player goes into 270 -> 180 -> 90, then the camera will rotate 360 deg again as its going from negative to positive 
              // targetRotation = -Math.PI;// -math.pi will do 420 turn between 270 & 180, +math.pi will do samething between 90 & 180. i think lerp function isn't working because to assimilate a positive direction with a negative, it has to turn in the opposing direction
              targetRotation = Math.PI;// claude says do this
              break;
          case 270:
              targetRotation = Math.PI / 2;
              break;
          default:
              // targetRotation = 200;
      }

      /*
main.js:627 Uncaught ReferenceError: currentRotation is not defined
    at BasicWorldDemo._CameraPosition (main.js:627:31)
    at main.js:790:12
      */
     // claude fixing my issues
     
        // Ensure we always rotate in the shortest direction
      while (targetRotation - currentRotation > Math.PI) targetRotation -= 2 * Math.PI; // c
      while (targetRotation - currentRotation < -Math.PI) targetRotation += 2 * Math.PI; // c
  
      // linear interpolation (lerp), smoother transitio
      this._camera.rotation.y = THREE.MathUtils.lerp(this._camera.rotation.y, targetRotation, 0.1);
  
      const targetPosition = new THREE.Vector3();
  
      switch (this._playerRotation) {
          case 0:
              targetPosition.copy(this._player.position).add(new THREE.Vector3(0, height, distanceFromPlayer));
              break;
          case 90:
              targetPosition.copy(this._player.position).add(new THREE.Vector3(-distanceFromPlayer, height, 0));
              break;
          case 180: // does a 360 rotation turn before facing this way
              targetPosition.copy(this._player.position).add(new THREE.Vector3(0, height, -distanceFromPlayer));
              break;
          case 270:
              targetPosition.copy(this._player.position).add(new THREE.Vector3(distanceFromPlayer, height, 0));
              break;
          default:
              targetPosition.copy(this._player.position).add(new THREE.Vector3(0, height, distanceFromPlayer));
      }
  
      //  linear interpolation (lerp), smoother transitions
      this._camera.position.lerp(targetPosition, 0.15);
      // console.log(this._playerRotation) // remmeber to comment
  



    /******************************************** */
    // this._camera.position.set(0,2,15) // change this position relative to where the player goes ***

    // this._camera.position.set(this._player.position.x, 5, this._player.position.z + 10); // works but only follows player
    // // this._camera.position.copy(this._player.position).add(new THREE.Vector3(0, 5, 10)).applyAxisAngle(new THREE.Vector3(0, 1, 0), this._player.rotation.y);


    //     window.addEventListener("keydown", (e) => {
    //   if(e.key === 'd' || e.key === 'D'){ //|| e.key === "ArrowRight"){ // right/left arrow conflicts with orbit controls
    //     // this._camera.rotation.y += 90
    //     // this._camera.rotation.y += 90 * Math.PI / 180
    //     this._camera.rotateY(90 * Math.PI / 180);
        
    //     // this._camera.position.copy(this._player.position).add(new THREE.Vector3(0, 5, -10)).applyAxisAngle(new THREE.Vector3(0, 1, 0), this._player.rotation.y);

    //   }

    //   // if(e.key === 'a' || e.key === 'A'){ //|| e.key === "ArrowLeft"){
        
    //   // }

    // });

    // // this._camera.rotation.y += 90
    // this._camera.position.set(this._player.position.x, 5, this._player.position.z + 10); 

    //************************************************************************** */



    // this._camera.position.set(this._player.position.x, 5, this._player.position.z + 10);
    // this._camera.lookAt(this._player.position);

 
    // Update the camera's look-at position to focus on the player
    // this._camera.lookAt(this._player.position);
    // switch (this._playerRotation){
    //   case 0: // initial direction
    //     this._player.position.z -= speed;
    //     break;
    //   case 90:
    //     this._player.position.x += speed;
    //     break;
    //   case 180:
    //     this._player.position.z += speed;
    //     break;
    //   case 270:
    //     this._player.position.x -= speed;
    //     break;
    //   default:

    // }
    
    
    // if
    // camera.lookAt(player.position);
  
    // Render the scene
    // renderer.render(scene, camera);
  
    // Call animate again on the next frame
    // requestAnimationFrame(this._CameraPosition);
    

    // var offset = new THREE.Vector3(this._player.position.x + 0, this._player.position.y + 6, this._player.position.z + 10);


    // window.addEventListener("keydown", (e) => {
    //   if(e.key === 'd' || e.key === 'D'){ //|| e.key === "ArrowRight"){ // right/left arrow conflicts with orbit controls
    //     this._camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    //   }

    //   if(e.key === 'a' || e.key === 'A'){ //|| e.key === "ArrowLeft"){
        
    //     // this._camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    //     this._camera.rotation.y += 90
    //   }

    // });
    
    // this._camera.position.lerp(offset, 0.2);
  
    // commented until trying jetwall solution
  //   for (const wall of globalWallsArr) {
  //     // if (this.checkCollision(this._player, wall)) {
  //       if(this.checkCollision(this._playerFrontalPosition, wall)) {
  //         // Collision detected, handle the end of the game or take appropriate action
  //         console.log("collision detected")
  //         return; // Stop checking further walls after the first collision
  //     }
  // }
  }

//   checkCollision(object, wall) {
//     // const playerBox = new THREE.Box3().setFromObject(object);
//     // const wallBox = new THREE.Box3().setFromObject(wall);

//     // return playerBox.intersectsBox(wallBox);
//     const playerBox = new THREE.Box3(
//       // new THREE.Vector3(this._playerFrontalPosition - 0.1, 0, -0.1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this._playerRotation),
//       // new THREE.Vector3(this._playerFrontalPosition + 0.1, 2, 0.1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this._playerRotation)
//     );
//     const wallBox = new THREE.Box3().setFromObject(wall);
  
//     // return playerBox.intersectsBox(wallBox);

//     if (playerBox.intersectsBox(wallBox))
//       console.log("COLLISION")

    
// } // end of main class





_OnWindowResize() { // handes camera adjustment and rendering when window is resized 
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
}


_RAF() { // render loop that continously renders the scene
    requestAnimationFrame(() => {
      const speed = 0.8;
      this._threejs.render(this._scene, this._camera);
      this._RAF();
      this._JetWall();

      
      this._CameraPosition();

      // controls.enabled = false; // disable oribit controls so they don't conflict with 3rd person camera

      // this._thirdPersonCamera();

      // this._thirdPersonCamera.update(); // Call the update method of your third-person camera.

      /*
        wall.position.set(xPos, yPos, zPos); // declared as box geometry 
        * create a boxGeometry for the front position of the player, then compare that with all walls
        or just push every x,y,z pos indivually in arr

        new plan: use jetWall but make a new invsible wall or boxGeometry that covers the front 1/3 of the tron bike, also make it wider
                  this new jet wall will always update to the current wall and it'll compare if this new wall is colliding with anyjetWalls
                  this way everything can hopefully be done inside of the jetWall method

      */

      switch (this._playerRotation){
        case 0: // initial direction
          this._player.position.z -= speed;
          // this._playerFrontalPosition = this._player.position.z - 0.3; 
          
          // console.log('pos:'+this._playerFrontalPosition)
          break;
        case 90:
          this._player.position.x += speed;
          break;
        case 180:
          this._player.position.z += speed;
          break;
        case 270:
          this._player.position.x -= speed;
          break;
        default:

      }

      // old movememnt controls 
    //   if (this._moveRight && this._player) {
    //     // this._player.rotateY(-Math.PI / 2);
    //     this._player.rotation.y += Math.PI / 2;
    //     console.log(this._playerRotation);

    //     // Move the player in the updated direction
    //     const speed = 0.1;
    //     this._player.position.x += speed * Math.cos(this._player.rotation.y);
    //     // this._player.position.z += speed * Math.sin(this._player.rotation.y);



    //     this._moveRight = false;
    //     // prevent it from being held down
    //     // this._player.position.x += 0.1;
        
    // }
    // if (this._moveLeft && this._player) {
    //   this._player.rotateY(Math.PI / 2);
    //   this._moveLeft = false;
    //   // prevent it from being held down
    //   // this._player.position.x += 0.1;
      
  // }
    // const speed = 0.1 // make it easier to implement a boost speed
    // this._player.position.z -= speed; // always move forward;

    });
  }
}


let _APP = null;



window.addEventListener('DOMContentLoaded', () => {
  _APP = new BasicWorldDemo();
});
