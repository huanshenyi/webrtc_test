var createoffer = document.querySelector("button#createOffer");

var pc = new RTCPeerConnection();
var pc2 = new RTCPeerConnection();

function getAnswer(desc) {
    console.log('answer:',desc.sdp);
    pc2.setLocalDescription(desc);
    pc.setRemoteDescription(desc);
}

function getOffer(desc) {
    console.log('offer:',desc.sdp);
    pc.setLocalDescription(desc);
    pc2.setRemoteDescription(desc);
    pc2.createAnswer().then(getAnswer).catch(handelError);
}

function getMediaStream(stream) {
    stream.getTracks().forEach((track)=>{
      pc.addTrack(track);
    });
    var options = {
      offerToReceiveAudio: 0,
      offerToReceiveVideo: 1,
      iceRestart: true
    };
    pc.createOffer(options).then(getOffer).catch(handelError);
}


function handelError(err) {
    console.log('Failed to get Media Stream:', err)
}

function getStream() {
    var constraints = {
        audio:false,
        video:true,
    };

    navigator.mediaDevices.getUserMedia(constraints).then(getMediaStream).catch(handelError);
}

function test() {
    if(!pc){
        console.error('pc is null');
        return
    }
    getStream();
    return
}

createoffer.onclick = test;