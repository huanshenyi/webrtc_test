"use strict"
//htmlの要素取得用
var audioSource = document.querySelector("select#audioSource");
var audioOutput = document.querySelector("select#audioOutput");
var videoSource = document.querySelector("select#videoSource");

var videoplay = document.querySelector("video#player");
//video audio
function gotMediaStream(stream){
    videoplay.srcObject = stream;
    //全てのメディア設備を返す
    return navigator.mediaDevices.enumerateDevices();
}

//ユーザーのメディアの取得ループ
function gotDevices(deviceInfos){
    deviceInfos.forEach((deviceinfo)=>{

        var option = document.createElement('option')
        option.text = deviceinfo.label;
        option.value = deviceinfo.deviceId; 

        if (deviceinfo.kind === 'audioinput'){
            audioSource.appendChild(option);
        }else if(deviceinfo.kind === 'audiooutput'){
            audioOutput.appendChild(option);
        }else if(deviceinfo.kind === 'videoinput'){
            videoSource.appendChild(option);
        }
    })
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
    navigator.mediaDevices.getUserMedia(constrants)
    .then(gotMediaStream)
    .then(gotDevices)
    .catch(handlerError);
}