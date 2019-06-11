"use strict"
var videoplay = document.querySelector("video#player");
//video audio
function gotMediaStream(stream){
    videoplay.srcObject = stream;
}
function handlerError(err){
    console.log("getUserMedia error:",err);
}
if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    console.log("getUserMedia is not supported")
}else{
    //メディアの取得関連パラメータ
    var constrants = {
       video : true,
       audio : true 
    }
    navigator.mediaDevices.getUserMedia(constrants).then(gotMediaStream).catch(handlerError);
}