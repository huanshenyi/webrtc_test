'use strict'

var localVideo = document.querySelector("video#localvideo");
var remotevideo = document.querySelector("video#remotevideo");

var btnConn = document.querySelector("button#connserver");
var btnLeave = document.querySelector("button#leave");

var localStream = null;

var roomid = '111111';
var socket = null;
var state = 'init';
var pc = null;


function sendMessage(roomid, data) {
    console.log('send p2p message', roomid, data);
    if(socket){
       socket.emit('message', roomid, data);
    }
}

function handleAnswerError(error) {
    console.error('Failed to get Answer!', error);
}

function getAnswer(desc) {
    pc.setLocalDescription(desc);
    sendMessage(roomid, desc)
}

function handleOfferError(err) {
    console.error('Failed to get Offer!', err);
}

function getOffer(desc) {
    pc.setLocalDescription(desc);
    sendMessage(roomid, desc);
}

function call() {
    if (state === 'joined_conn'){
        if (pc){
            var options = {
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1
            };
            pc.createOffer(options)
                .then(getOffer)
                .catch(handleOfferError);
        }
    }
}

function connSignalServer() {
    start();
    return true;
}

function conn() {
    socket = io.connect("ws://127.0.0.1:8080");

    socket.on('joined', (roomid, id)=>{
        console.log('receive joined message:', roomid,id);
        state = 'joined';
        createPeerConnection();
        btnConn.disable = true;
        btnLeave.disabled = false;
        console.log('receive joined message:state=', state);

    });

    socket.on('otherjoin', (roomid)=>{
        console.log('receive otherjoined message:', roomid);
        if(state === 'joined_unbind'){
            createPeerConnection();
        }
        state = 'joined_conn';
        //メディア
        console.log('receive joined message:state=', state);
    });

    //人数一杯になった場合
    socket.on('full', (roomid, id)=>{
        console.log('receive full message:', roomid, id);
        state = 'leaved';
        console.log('receive full message:state', state);
        socket.disconnect();
        alert('the room is full!');
    });

    socket.on('leaved', (roomid, id)=>{
        console.log('receive leaved message:', roomid, id);
        state = 'leaved';
        console.log('receive leaved message:state=', state);
        socket.disconnect();
        btnConn.disable = false;
        btnLeave.disabled = true
    });

    //向こうがleaved
    socket.on('bye', (roomid, id)=>{
        console.log('receive bye message:', roomid,id);
        state = 'joined_unbind';
        closePeerConnection();
        console.log('receive bye message:state=',state)
    });

    socket.on('message', (roomid,data)=>{
        console.log('receive client message:', roomid, data);
        //メディアの協定
        if(data){
            if(data.type === 'offer'){
                  pc.setRemoteDescription(new RTCSessionDescription(desc));
                  pc.createAnswer()
                      .then(getAnswer)
                      .catch(handleAnswerError);
            }else if(data.type === 'answer'){
                  pc.setRemoteDescription(new RTCSessionDescription(desc));
            }else if(data.type === 'candidate'){
                   var candidate = new RTCIceCandidate({
                       sdpMLineIndex :data.label,
                       candidate: data.candidate
                   });
                   pc.addIceCandidate(candidate);
            }else {
                console.error('the message is invalid!', data)
            }
        }
    });
    socket.emit('join', '111111');
    return
}

function getMediaStream(stream){
    localVideo.srcObject = stream;
    //他のところでstreamをadd用の為に、グロバール化
    localStream = stream;
    conn();
}

function handelError(err){
    console.log("Get UserMedia error:"+err)
}

function handleAnswerError(err){
    console.log("Get UserMedia error:"+err)
}

function start(){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !navigator.mediaDevices.getDisplayMedia){
        console.errors("the getUserMedia not supported!");
        return;
    }else{
        var constraints = {
            video:true,
            audio:false
        }
        navigator.mediaDevices.getDisplayMedia(constraints).then(getMediaStream).catch(handelError);
    }
}

function getRemoteStream(e){
    remotevideo.srcObject = e.streams[0];
}

function handelOfferError(err){
   console.error("Faile to create offer:", err)
}

function getOffer(desc){
    pc1.setLocalDescription(desc);
    offer.value = desc.sdp; //Session Description Protocolを表示
    // send desc to signal(信令サーバー)
    // receive desc from signal
    pc2.setRemoteDescription(desc);
    pc2.createAnswer().then(getAnswer).catch(handleAnswerError);
}

function getAnswer(desc){
   pc2.setLocalDescription(desc);
   answer.value = desc.sdp;
   //send desc to signal
   //receive desc to signal
   pc1.setRemoteDescription(desc);
}


function closeLocalMedia(){
    if(localStream && localStream.getTracks()){
        localStream.getTracks().forEach((track)=>{
            track.stop()
        })
    }
    localStream = null;
}

//離れる
function leave(){
    if(socket){
        socket.emit('leave', '111111');
    }
    closePeerConnection();
    closeLocalMedia();
    btnConn.disable = false;
    btnLeave.disabled = true
}

function createPeerConnection(){
    console.log("createPeerConnection");
    if(!pc){
        var pcConfig = {
          'iceServers':[{
              'urls': 'turn:stun.al.learningrtc.cn:3478',
              'credential': 'mypasswd',
              'username': 'garrylea'
          }]
        };
        pc = new RTCPeerConnection(pcConfig);

        pc.onicecandidate=(e)=>{
            if(e.candidate){
                console.log('find an new candidate',e.candidate);
                sendMessage(roomid, {
                    type: 'candidate',
                    label: e.candidate.sdpMLineIndex,
                    id: e.candidate.sdpMid,
                    candidate: e.candidate.candidate
                });
            }
        };
        pc.ontrack = (e)=>{
           remoteVideo.srcObject = e.streams[0];
        }
    }
    if(localStream){
        localStream.getTracks().forEach((track)=>{
            pc.addTrack(track)
        });
    }
}

function closePeerConnection(){
      console.log("close RTCPeerConnection");
      if(pc){
          pc.close();
          pc = null;
      }
}

btnConn.onclick = connSignalServer;
btnLeave.onclick = leave;

