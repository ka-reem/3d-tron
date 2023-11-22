// importing three.js library
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js'; 
// lets the camera move around
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js'; 
// import gltf files that have our renders
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';

class tronControls {
    constructor(params) {
      this._Init(params);
    }
  
    _Init(params) {
      this._params = params;
      this._move = {
        forward: false,
        backward: false,
        left: false,
        right: false,
      };
      //   this._acceleration = new THREE.Vector3(1, 0.25, 50.0); // if we decide to implement a boost in the future
      //   this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0); // turn off boost
      this._velocity = new THREE.Vector3(2, 0, 0);  // tron bike has constant speed; can only turn left or right
      
      // Store the reference to controlObject
        this.controlObject = this._params.target;
  
      document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
      document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }

    _onKeyDown(event) { // make it just turn 90 degrees instead of move
        
        switch (event.keyCode) { // store ascii values for desired buttons
          case 65: // a
            // this._move.left = true;
            controlObject.rotateY(Math.PI / 2);
            break;
          case 68: // d
            // this._move.right = true;
            controlObject.rotateY(-Math.PI / 2);
            break;
          case 37: // left // if i want to change controls in the future
          case 39: // right
            break;
        }
      }
    
    //   _onKeyUp(event) { 
    //     switch(event.keyCode) {
    //       case 65: // a
    //         this._move.left = false;
    //         break;
    //       case 68: // d
    //         this._move.right = false;
    //         break;
    //       case 37: // left
    //       case 39: // right
    //         break;
    //     }
    //   }
};

class ControlsInput {
    constructor(){

    }
}

class FiniteStateMachine{ // possible states and transitions
    constructor () {

    }
}

class BasicWorldDemo {
  constructor() {
    this._Initialize();
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

    const fov = 60; // presepective camera
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(35, 2, 0); // sets the cameras intial position (x,y,z)

    this._scene = new THREE.Scene(); // scene: serves as container for all our 3d objects in the world

    // lighting setup 
    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0); // directional light created for shadows
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
    this._scene.add(light);

    const controls = new OrbitControls( // lets the user to move the cameras position using arrow or mouse controls
      this._camera, this._threejs.domElement);
    controls.target.set(0, 5, 0); // (x,y,z) // where camera points
    controls.update(); 

    const loader = new THREE.CubeTextureLoader();
    // load a background if you want
    // const texture = loader.load([ // load background
    //     './resources/pic1.jpg', // here you can download a skybox which is basically yourself in a cube, where each side represents a picture
    //     './resources/...jpg',
    //     './resources/pic6.jpg',
    // ]);
    // this._scene.background = texture;


    this._threejs.setClearColor(new THREE.Color(0x090f00)); // background color


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

    // for (let x = -8; x < 8; x++) { // this creates a bunch of random boxes around the plane
    //   for (let y = -8; y < 8; y++) {
    //     const box = new THREE.Mesh(
    //       new THREE.BoxGeometry(2, 2, 2),
    //       new THREE.MeshStandardMaterial({
    //           color: 0x808080,
    //       }));
    //     box.position.set(Math.random() + x * 5, Math.random() * 4.0 + 2.0, Math.random() + y * 5);
    //     box.castShadow = true;
    //     box.receiveShadow = true;
    //     this._scene.add(box);
    //   }
    // }

    // const box = new THREE.Mesh(
    //   new THREE.SphereGeometry(2, 32, 32),
    //   new THREE.MeshStandardMaterial({
    //       color: 0xFFFFFF,
    //       wireframe: true,
    //       wireframeLinewidth: 4,
    //   }));
    // box.position.set(0, 0, 0);
    // box.castShadow = true;
    // box.receiveShadow = true;
    // this._scene.add(box);

    // tron ************************************************

    
    
    // *****************************************************
    this._LoadModel();
    this._RAF();
}

_LoadModel() {
    const loader = new GLTFLoader();
    console.log('hi')
    // loader.load('/home/kareem/Downloads/tron_moto_sdc__free/scene.gltf', (gltf) => {
    // loader.load('./tron_moto_sdc__free/classic_tron_lightcycle.glb', (gltf) => {
        loader.load('./tron_moto_sdc__free/classic-1982-tron-light-cycle-blue-blend.glb', (gltf) => {
        console.log(gltf);

        // gltf.scene.scale.set(.0025, .0025, .0025); // make sure its big enough
        // gltf.scene.scale.set(25,25,25);

        // gltf.scene.position.set(0, 20, 0);

    //   gltf.scene.traverse(c => {
    //     c.castShadow = true;
    //   });

    // downscale
    
      this._scene.add(gltf.scene);
    });
  }


_OnWindowResize() { // handes camera adjustment and rendering when window is resized // shouldn't slow down rendering but i feel like it does
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
}


_RAF() { // render loop that continously renders the scene
    requestAnimationFrame(() => {
      this._threejs.render(this._scene, this._camera);
      this._RAF();
    });
  }
}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new BasicWorldDemo();
});