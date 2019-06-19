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

//起動時に実効するもの
function start(){

if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    console.log("getUserMedia is not supported")
    return;
}else{
    var deviceId = videoSource.value;
    //メディアの取得関連パラメータ
    var constrants = {
        //videoの大きさも調整可能
       video : {
           width: {
               min:300,
               max:640
           },
           height: 480,
           //映像のfps数
        //    frameRate:{
        //        min:15,
        //        max:30
        //    },
           //facingMode: 'enviroment' 使用するカメラを調整
           deviceId : deviceId ? deviceId : undefined
       },
    //   audio : true 
        audio : {
            echoCancellation:true,   //エコー削除
            //autoGainControl         音声をアップ
            noiseSuppression:true       //ノイズdown
            //latency                 ラグの設定,小さいほどラグは少ないが,ネットによって不具合の可能性も大
            //deviceID                使用するデバイスのidを切替用
        },
    }
    navigator.mediaDevices.getUserMedia(constrants)
    .then(gotMediaStream)
    .then(gotDevices)
    .catch(handlerError);
 }
}

start();
// //使用するデバイスが変化する時に
videoSource.onchange = start;