/*let btnSend;
let textSend;

let peer;
let pCall;


document.getElementById("btnCreate").addEventListener("click", ()=>{
    peer = new Peer(document.getElementById("usernameText").value,{
        host: location.hostname,
        port: location.port || (location.protocol === 'https:' ? 443 : 80),
        path: '/peerjs'
    });
    document.getElementById("pop-up-main").style.display = "none";
    document.getElementById("text-thing").style.display = "flex";
    peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
        
      });
      peer.on('connection', function(conn) {
        console.log("Connected to " + conn);
      });
});


document.getElementById("btnConnect").addEventListener("click", ()=>{
    pCall =  peer.connect(document.getElementById("connectName").value);
    //document.getElementById("btnConnect").removeEventListener("click");
    btnSend = document.getElementById("btnConnect");
    textSend = document.getElementById("connectName")
    btnSend.addEventListener("click",()=>{
        pCall.send(textSend.value);
        console.log("sending data");
    });
    pCall.on('data',function(data){
        console.log('Received',data);
    });
});
*/
let btnStart = document.getElementById("btnStart");
let mainToolWrapper = document.getElementById("main-tool-wrapper");

let peer;
let pCon;
let pCall;
let videoRemotes = document.getElementsByClassName("videoRemote");

let otherId;
let isStarted = false;

function setupStreamToVideo(strm){
    videoRemotes.forEach(element => {
        element.srcObject = strm;
    });
}


function setupConn(conn) {
    console.log("Connected to " + conn.peer);

    // When the connection is established, set up data sending
    if(conn != pCon){
        pCon = conn;
    }
    
    //btnSend = document.getElementById("btnSend");
    //document.getElementById("btnStream").style.display = "inline";
    //textSend = document.getElementById("connectName");
    //btnSend.style.display="inline";

    //btnSend.addEventListener("click", () => {
    //    pCon.send(textSend.value);
    //    console.log("Sending data: " + textSend.value);
    //    textSend.value = ''; // Clear the input field after sending
    //});

    pCon.on('data', function(data) {
        console.log('Received: ' + data);
    });
    peer.on('call', function(call) {
        call.answer();
        console.log("Answeared new call");
        if(call != pCall){
            console.log("setup call");
            pCall = call;
            videoRemotes[0].style.display = "block";
            videoRemotes[1].style.display = "block";
        }
        
        pCall.on('stream',function(stream){
            
            console.log("got stream");
            btnStart.style.display = "none";
            videoRemotes[0].srcObject = stream;
            videoRemotes[1].srcObject = stream;
            btnStart.addEventListener("click", ()=>{console.log("ALREADY CREATED A CONNECTION, WAITING FOR STREAM")});
            mainToolWrapper.style.gap = "0%"
            btnStart.style.zIndex = "-2";
            isStarted = true;
        });    
    });
    
};

function createUser(username) {
    console.log("start create");
    if (!username) {
        alert("Please enter a username.");
        return;
    }

    peer = new Peer(username, {
        host: '192.168.0.98', //*Add so it can easily be changed to pcs address.
        port: 3000 || (location.protocol === 'https:' ? 443 : 80),
        path: '/peerjs'
    });

    //document.getElementById("pop-up-main").style.display = "none";
    //document.getElementById("text-thing").style.display = "flex";

    peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
    });


    peer.on('connection', (conn) => setupConn(conn));
}

function connectToPeer(peerName) {
    //const connectName = document.getElementById("connectName").value;

    if (!peerName) {
        alert("Please enter the peer's name ..to connect.");
        return;
    }

    // Connect to the peer using their ID (connectName)
    pCon = peer.connect(peerName);

    pCon.on('open', () => {
        console.log('Connected to ' + peerName);
        setupConn(pCon)
    });
}


btnStart.addEventListener("click", ()=>{
    createUser("mum");
    connectToPeer("dud");
    btnStart.innerHTML = "WAITING FOR STREAM";

});

btnStart.addEventListener("touchstart", ()=>{
    if(!isStarted)
        //mainToolWrapper.style.animationName = "gapHoverOpen";
        mainToolWrapper.style.gap = "75%"
});

btnStart.addEventListener("touchcancel",()=>{
    if(!isStarted)
        mainToolWrapper.style.gap = "50%" 
});

// * CREDIT : google codebase!
//let inspctr = document.getElementById("inspctr");

/**
 * Query for WebXR support. If there's no support for the `immersive-ar` mode,
 * show an error.
 */
(async function() {
    const isArSessionSupported = navigator.xr && navigator.xr.isSessionSupported && await navigator.xr.isSessionSupported("immersive-ar");
    if (isArSessionSupported) {
      console.log("waiting for start");
      document.getElementById("btnStart").addEventListener("click", window.app.activateXR)
    } else {
      console.log("Not supported WebXR");
      onNoXRDevice();
    }
  })();
  
  /**
   * Container class to manage connecting to the WebXR Device API
   * and handle rendering on every frame.
   */
  class App {
    /**
     * Run when the Start AR button is pressed.
     */
    activateXR = async () => {
      try {
        // Initialize a WebXR session using "immersive-ar".
        this.xrSession = await navigator.xr.requestSession("immersive-ar",{
          requiredFeatures : ["dom-overlay"],
          domOverlay: {
            root: document.getElementById("unimportant"),
          }
        });
        //document.exitFullscreen();
        // Create the canvas that will contain our camera's background and our virtual scene.
        this.createXRCanvas();
  
        // With everything set up, start the app.
        await this.onSessionStarted();
      } catch(e) {
        console.log(e);
        onNoXRDevice();
      }
    }
  
    /**
     * Add a canvas element and initialize a WebGL context that is compatible with WebXR.
     */
    createXRCanvas() {
      this.canvas = document.createElement("canvas");
      document.body.appendChild(this.canvas);
      this.gl = this.canvas.getContext("webgl", {xrCompatible: true});
  
      this.xrSession.updateRenderState({
        baseLayer: new XRWebGLLayer(this.xrSession, this.gl)
      });
    }
  
  
    
  
    /**
     * Called when the XRSession has begun. Here we set up our three.js
     * renderer and kick off the render loop.
     */
    async onSessionStarted() {
      // Add the `ar` class to our body, which will hide our 2D components
      document.body.classList.add('ar');
  
      // To help with working with 3D on the web, we'll use three.js.
      this.setupThreeJs();
  
      // Setup an XRReferenceSpace using the "local" coordinate system.
      this.localReferenceSpace = await this.xrSession.requestReferenceSpace("viewer");
  
      // Start a rendering loop using this.onXRFrame.
      this.xrSession.requestAnimationFrame(this.onXRFrame);
    }
  
    /**
     * Called on the XRSession's requestAnimationFrame.
     * Called with the time and XRPresentationFrame.
     */
    onXRFrame = (time, frame) => {
     this.xrSession.requestAnimationFrame(this.onXRFrame);
     //inspctr.innerHTML = (frame.getViewerPose(this.localReferenceSpace).views[0].transform.positon);
      console.log(frame.getViewerPose(this.localReferenceSpace).views[0].transform);
     /** TODO draw the application */
    }
  
    /**
     * Initialize three.js specific rendering code, including a WebGLRenderer,
     * a demo scene, and a camera for viewing the 3D content.
     */
    setupThreeJs() {
     
    }
  };
  
  function onNoXRDevice() {
    document.getElementById("unsupported-info").style.display = "block";
  }
  
  
  window.app = new App();
  
