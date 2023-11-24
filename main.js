// importing three.js library
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js'; 
// lets the camera move around
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js'; 
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

class BasicWorldDemo {
  constructor() {
    this._playerRotation = 0; // keep track of players rotation so its relative to direction its moving 
    this._Initialize();
    this._JetWall(); // wall that is created behind the player
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
    // decide if we need shadows or not
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;            
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
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


    const plane = new THREE.Mesh( // render a 3d plane which in this case is our ground
    
        new THREE.PlaneGeometry(100, 100, 10, 10),  // (width, height, widthSegments, heightSegments), w/h segments determine subdivisions,
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
}


_LoadModel() {
    const loader = new GLTFLoader();
    console.log('hi')
    // loader.load('/home/kareem/Downloads/tron_moto_sdc__free/scene.gltf', (gltf) => {
    // loader.load('./tron_moto_sdc__free/classic_tron_lightcycle.glb', (gltf) => {
        loader.load('./tron_moto_sdc__free/classic-1982-tron-light-cycle-blue-blend.glb', (gltf) => {

        const player = gltf.scene; // set the player object to the render
        this._player = player;


        console.log(gltf); // debugging

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
 
    let speed = 0.3
    window.addEventListener("keydown", (e) => {
      if(e.key === 'd' || e.key === 'D'){ //|| e.key === "ArrowRight"){ // right/left arrow conflicts with orbit controls
        console.log('Key pressed:', e.key);
        this._moveRight = true;
        this._playerRotation += 90; 
        this._player.rotateY(-Math.PI / 2);
        

        // adjust for wall gap when rotating player
        switch (this._playerRotation){
          case 360: // this doesn't get updated from 360 to 0 until after
            this._player.position.z -= speed + 0.1 ;
            this._player.position.x += 0.37;
            console.log("turned")
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

      if(e.key === 'a' || e.key === 'A'){ //|| e.key === "ArrowLeft"){
    
        console.log('Key pressed:', e.key);    
        this._moveLeft = true;
        this._playerRotation -= 90;
        this._player.rotateY(Math.PI / 2);
        

                // adjust for wall gap when rotating player
                switch (this._playerRotation){
                  case 0:
                    this._player.position.z -= speed + 0.1 ;
                    this._player.position.x -= 0.37;
                    break;
                  case 90:
                   // played around with these values until wall gap was removed
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
                              if we include a boost feature, we would need to make a longer wall
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

    /****************/

      const height = 7.5;
      const distanceFromPlayer = 17;
  
      let targetRotation = 0;
  
      switch (this._playerRotation) {
          case 0:
              targetRotation = 0;
              break;
          case 90:
              targetRotation = -Math.PI / 2;
              break;
          case 180:
              targetRotation = -Math.PI;
              break;
          case 270:
              targetRotation = Math.PI / 2;
              break;
          default:
              targetRotation = 200;
      }
  
      // linear interpolation (lerp), smoother transitions
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
      this._camera.position.lerp(targetPosition, 0.1);
      console.log(this._playerRotation)
  



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
  
  }




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

      switch (this._playerRotation){
        case 0: // initial direction
          this._player.position.z -= speed;
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

