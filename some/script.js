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
let btnSend;
let textSend;
let peer;
let pCon;
let pCall;
let videoRemote = document.getElementById("videoRemote");

let otherId;

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
            //stream
        }
        
        pCall.on('stream',function(stream){
            console.log("got stream");
            //stream
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
        host: location.hostname,
        port: location.port || (location.protocol === 'https:' ? 443 : 80),
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
        alert("Please enter the peer's name to connect.");
        return;
    }

    // Connect to the peer using their ID (connectName)
    pCon = peer.connect(peerName);

    pCon.on('open', () => {
        console.log('Connected to ' + peerName);
        setupConn(pCon)
    });
}


document.getElementById("btnCreate").addEventListener("click", () => {
    const username = document.getElementById("usernameText").value;
    console.log("start create");
    
    createUser(username);

});

document.getElementById("btnConnect").addEventListener("click", () => {
    const connectName = document.getElementById("connectName").value;

    connectToPeer(connectName);
});
document.getElementById("btnStream").addEventListener("click",() =>{
    //* Only PC-Side Code
    navigator.mediaDevices.getDisplayMedia({video: true, audio: false})
    .then(function(stream) {
        pCall = peer.call(pCon.peer, stream);
        console.log("Called " + pCon.peer)
    })
    .catch(function(err) {
      console.log("error: " + err);
    })
});



