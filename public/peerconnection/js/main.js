'use strict'

var localVideo = document.querySelector("video#localvideo");
var remotevideo = document.querySelector("video#remotevideo");

var btnStart = document.querySelector("button#start")
var btnCall = document.querySelector("button#call")
var btnHangup = document.querySelector("button#hangup")

var offer = document.querySelector("textarea#offer")
var answer = document.querySelector("textarea#answer")

//ローカルstreamをグロバール用
var localStream;
var pc1;
var pc2;

function getMediaStream(stream){
    localVideo.srcObject = stream
    //他のところでstreamをadd用の為に、グロバール化
    localStream = stream
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

function call(){
    //パラメタ入力も可能,local内にテストするめた、あえて空
    //pc=>PeerConnection
    pc1 = new RTCPeerConnection();
    pc2 = new RTCPeerConnection()
    pc1.onicecandidate = (e)=>{
        pc2.addIceCandidate(e.candidate);
    }
    pc2.onicecandidate = (e)=>{
        pc1.addIceCandidate(e.candidate);
    }
    pc2.ontrack = getRemoteStream;

    localStream.getTracks().forEach((track)=>{
        pc1.addTrack(track,localStream);
    });
    var offerOptions={
      offerToRecieveAudio:0,
      offerToRecieveVideo:1
    }
    pc1.createOffer(offerOptions).then(getOffer).catch(handelOfferError);
    btnCall.disabled = true
    btnHangup.disabled = false
}

function hangup(){
    pc1.close();
    pc2.close();
    pc1= null;
    pc2= null;
    btnCall.disabled = false
}

btnStart.onclick = start;
btnCall.onclick = call;
btnHangup.onclick = hangup;
