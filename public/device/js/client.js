"use strict"

var audioSource = document.querySelector('select#audioSourc'); 
var audioInput = document.querySelector('select#audioOutput'); 
var videoSource = document.querySelector('select#videoSource');

if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices){
    console.log("enumerateDevices無理無理")
}else{
    //ディバイスを使用しようとする
    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handlerError);
}

function gotDevices(deviceInfos)
{
    deviceInfos.forEach(function(deviceInfo){
                  //どんあ種類(odio,video,出力か入力か)
      console.log(deviceInfo.kind + ": label ="
            //どんな名前
            + deviceInfo.label + ": id ="
             //ディバイスid
            + deviceInfo.deviceId + ": groupId = "
            //物理設備のid
            + deviceInfo.groupId );
      var option = document.createElement("option");
      option.text = deviceInfo.label;
      option.value = deviceInfo.deviceId;
      if(deviceInfo.kind === 'audioinput'){
            audioSource.appendChild(option);
      } else if(deviceInfo.kind === 'audiooutput'){
            audioOutput.appendChild(option);
      }else if(deviceInfo.kind === 'videoinput'){
            videoSource.appendChild(option);
      }  
    });
}

function handlerError(err)
{
  console.log(err.name +' : '+err.message)
}
