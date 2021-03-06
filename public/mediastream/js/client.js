"use strict"
//htmlの要素取得用
//devices
var audioSource = document.querySelector("select#audioSource");
var audioOutput = document.querySelector("select#audioOutput");
var videoSource = document.querySelector("select#videoSource");
var filtersSelect = document.querySelector("select#filter");
//video
var videoplay = document.querySelector("video#player");
//audio
var audioplay = document.querySelector("audio#audioplayer");

//スクリーンショット
var snapshot = document.querySelector("button#snapshot");
//スクリーンショットのキャンパス
var picture = document.querySelector("canvas#picture");
picture.width=320;
picture.height=240;

//tracksを表示
var divConstraints = document.querySelector("div#constraints");

//recored 録画内容を表示するvideoタグs
var recvideo = document.querySelector("video#recplayer");
//録画開始button
var btnRecord = document.querySelector("button#record");
//play button
var btnPlay = document.querySelector("button#recplay");
// ダウロード btn 
var btnDownload = document.querySelector("button#download");

//データlist
var buffer;
//グロバル録画オブジェクト
var mediaRecorder;
//video audio の stream
function gotMediaStream(stream){
    videoplay.srcObject = stream;

    //stream中の軌道(tracks)を取得
    var videoTrack =  stream.getVideoTracks()[0];
    var videoConstraints = videoTrack.getSettings();
    divConstraints.textContent = JSON.stringify(videoConstraints,null,2);
    
    window.stream = stream;
    //全てのメディア設備を返す
    return navigator.mediaDevices.enumerateDevices();
}

//ユーザーのメディア取得して
//画面のelementに内容挿入
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
           facingMode: 'enviroment', //スマホ使用するカメラを調整
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

filtersSelect.onchange = function(){
    videoplay.className = filtersSelect.value;
    
}

//スクリンショット事件
snapshot.onclick =()=>{
    picture.className = filtersSelect.value;
    picture.getContext("2d").drawImage(videoplay,
        0,0,picture.width,picture.height);
        //ダウロード する画像にもフィルターかける
        //invertColor();
}

function handleDataAvailable(e){
    if(e && e.data && e.data.size >0){
        buffer.push(e.data);
    }
}

function startRecord(){
    buffer = [];
    var options = {
        mimeType:"video/webm;codecs=vp8"
    }
    if(!MediaRecorder.isTypeSupported(options.mimeType)){
        console.error(`${options.mimeType} is ダメ`);
        return;
    }
    try{
         mediaRecorder = new MediaRecorder(window.stream,options);
    }catch(e){
        console.error(e);
        return
    }
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10);
}
function stopRecord(){
    mediaRecorder.stop();
}
//録画
btnRecord.onclick=()=>{
    if(btnRecord.textContent === "レコーダスタート"){
        startRecord();
        btnRecord.textContent = "レコーダーストップ";
        btnPlay.disabled = true;
        btnDownload.disabled = true;
    }else{
        stopRecord();
        btnRecord.textContent = "レコーダスタート";
        btnPlay.disabled = false;
        btnDownload.disabled = false;
    }
}
//play
btnPlay.onclick = ()=>{
    var blob = new Blob(buffer,{type: 'video/webm'});
    recvideo.src = window.URL.createObjectURL(blob);
    recvideo.srcObject = null;
    recvideo.controls = true;
    recvideo.play();
}
//ダウロード 
btnDownload.onclick = ()=>{
    var blob = new Blob(buffer,{type:'video/webm'});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');

    a.href = url;
    a.style.display='none';
    a.download = 'aaa.webm'
    a.click();
}

// function invertColor(){
//     var canvas = picture;
//     var tempContext = picture.getContext("2d");
//     var len = canvas.width * canvas.height * 4;
//     var canvasData = tempContext.getImageData(0, 0, canvas.width, canvas.height);
//     var binaryData = canvasData.data;

//     // Processing all the pixels
//     colorInvertProcess(binaryData, len);

//     // Copying back canvas data to canvas
//     tempContext.putImageData(canvasData, 0, 0);
// }

// function colorInvertProcess (binaryData, l) {
//     for (var i = 0; i < l; i += 4) {
//       var r = binaryData[i];
//       var g = binaryData[i + 1];
//       var b = binaryData[i + 2];

//       binaryData[i] = 255-r;
//       binaryData[i + 1] = 255-g;
//       binaryData[i + 2] = 255-b;
//     }
//   }