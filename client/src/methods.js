// var HOST = window.location.origin.replace(/^http/, 'ws')
var url="wss://codingduel.herokuapp.com";
// var url="ws://localhost:4000";
var webSocket = new WebSocket(url);
var opponent = false;
var self = false;
var readyFunction;
var videoFunction;
var audioFunction;
var dataChannel;
var er = false;
const check = async () => {
  const response = await fetch("/check", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
  })
    .then((res) => res.json())
    .catch((err) => alert("Cannot check...login or not server is not running"));
  return response;
};

function getRoomName() {
  console.log('getting roomName..')
  return document.getElementById("room-name").value;
}

webSocket.onmessage = (event) => {
  handleSignallingData(JSON.parse(event.data));
};

webSocket.onclose = function () {
  // Try to reconnect in 5 seconds
  setTimeout(function () {
    start(url);
  }, 5000);
};

function start(url) {
  webSocket = new WebSocket(url);
  webSocket.onclose = function () {
    // Try to reconnect in 3 seconds
    setTimeout(function () {
      start(url);
    }, 5000);
  };
}

function handleSignallingData(data) {
  console.log(data)
  // try {
    // console.log(data);
    switch (data.type) {
      case "answer":
        console.log('received answer.')
        console.log("answer : ",data.answer)
        document.getElementById("call").style.display = "inline";
        try {
          peerConn
            .setRemoteDescription(data.answer)
            .then(() => {console.log('remote description set')})
            .catch((err) => {
              console.log('remote description is not set')
              console.log(err)
              alert("refresh and try again.");
            });
            
        } catch (err) {
          console.log(err)
          alert("refresh page and try again.");
        }
        break;
      case "offer":
        console.log('received offer.')
        document.getElementById("call").style.display = "inline";
        peerConnj
          .setRemoteDescription(data.offer)
          .then(() => {
            console.log('remote description set')
            createAndSendAnswerj();
          })
          .catch((err) => {
            console.log('remote description not set')
            console.log(err)
            alert("refresh page and try again.");
          });
          console.log('offer set')
        break;
      case "candidate":
        try{
          if (data.from == "receiver") {
            peerConn.addIceCandidate(data.candidate)
            .then(()=>{console.log('ice candidate added')})
            .catch(err => {
              console.log('while adding ice candidate')
              console.log(err)
              if(er==true){
                console.log('cannot add ice candidates')
                return;
              }
              alert("someone try to join, refresh page and try again.")
              er=true;
            })
          }
          else {
            peerConnj.addIceCandidate(data.candidate)
            .then(()=>{
              console.log('ice candidate added')
            })
            .catch(err => {
              console.log('while adding ice candidate')
              console.log(err)
              if(er==true){
                console.log('cannot add ice candidates')
                return;
              }
              alert("someone try to join, refresh page and try again.")
              er=true;
            })
          };
        }catch(err){
          console.log(err)
          alert("someone try to join, refresh page and try again.");
        }
        break;
    }
  // } catch (err) {
    // alert("   refresh page and try again.");
  // }
}

function sendData(data) {
  console.log(`sending.. ${data.type}`)
  data.username = username;
  data.from = "sender";
  webSocket.send(JSON.stringify(data));
}

let localStream;
let peerConn;
let username;

function goToVideoCall(callback, roomName) {
  console.log('starting call')
  document.querySelector("p").style.display = "inline";
  console.log('he')
  username = getRoomName();
  sendData({
    type: "store_user",
  });
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then(
      (stream) => {
        localStream = stream;
        let configuration = {
          iceServers: [
            {
              urls: [
                "stun:stun.stunprotocol.org",
                "stun:stun.cheapvoip.com:3478",
                "stun:stun.commpeak.com:3478",
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
              ],
            },
            {
              urls: "turn:numb.viagenie.ca",
              credential: "muazkh",
              username: "webrtc@live.com"
            },
            {
              urls:"turn:106.215.229.64:3478",
              credential: "test123",
              username: "test"
            }
          ],
        };

        peerConn = new RTCPeerConnection(configuration);
        localStream.getTracks().forEach(function (track) {
          peerConn.addTrack(track, localStream);
        });

        peerConn.onnegotiationneeded = async () =>{
          try{
            createAndSendOffer();
          }catch(er){
            console.log(er);
            alert('negotiation');
          }
        }

        peerConn.onconnectionstatechange = (e) => {
          console.log('state : ',peerConn.connectionState)
          if (
            peerConn.connectionState == "disconnected" ||
            peerConn.connectionState == "failed"
          ) {
            if (localStream) {
              localStream.getVideoTracks()[0].stop();
              localStream.getAudioTracks()[0].stop();
            }
            console.log(peerConn.connectionState);
            if (peerConn) {
              peerConn.close();
            } else if (peerConnj) {
              peerConnj.close();
            }
            const remoteVideo = document.querySelector("video");
            remoteVideo.pause();
            remoteVideo.srcObject = null;

            const readyButton = document.getElementById("ready-btn");
            readyButton.removeEventListener("click", readyFunction);
            readyButton.innerText = "Ready?";

            const audioButton = document.getElementById("audio-btn");
            audioButton.innerText = "Mute yourself";

            document.getElementById("opponent-status").innerText =
              "Opponent is not ready";

            const videoButton = document.getElementById("video-btn");
            videoButton.innerText = "Mute Your Video";

            document.getElementById("status").style.display = "inline";
            document.getElementById("call").style.display = "none";
            self = false;
            opponent = false;
            isAudio = true;
            isVideo = true;

            
            alert("Not available");
          }
        };

        var dataChannelOptions = {
          reliable: true,
        };

        dataChannel = peerConn.createDataChannel(
          "myDataChannel",
          dataChannelOptions
        );
        dataChannel.onopen = (e) => {
          document.getElementById("call").style.display = "inline";
        };
        dataChannel.onerror = function (error) {};
        try {
          dataChannel.onmessage = function (event) {
            const data = JSON.parse(event.data);
            opponent = data.ready;
            if (opponent) {
              document.getElementById("opponent-status").innerText =
                "Opponent is Ready";
            } else {
              document.getElementById("opponent-status").innerText =
                "Opponent Not Ready";
            }
            if (opponent && self) {
              document.getElementById("status").style.display = "none";
              callback(true);
            }
          };
        } catch (err) {
          console.log(err);
          alert("Not connected to opponent.");
        }

        try {
          peerConn.ontrack = (e) => {
            document.getElementById("call").style.display = "inline";
            const remoteStream = e.streams[0];
            if (remoteStream) {
              const remoteVideo = document.querySelector("video");
              remoteVideo.srcObject = remoteStream;
              peerConn.addEventListener("track", async (event) => {
                remoteStream.addTrack(event.track, remoteStream);
              });
              remoteVideo.playsInline = true;
              remoteVideo.autoplay = true;
            } else {
              alert(
                "cannot add video, proceed without video or refresh page and try again."
              );
            }
          };
        } catch (err) {
          console.log(err);
          alert("cannot add video, refresh and try again.");
        }
        try {
          peerConn.onicecandidate = (e) => {
            if (e.candidate == null) return;
            sendData({
              type: "store_candidate",
              candidate: e.candidate,
            });
          };
        } catch (err) {
          console.log(err);
          alert("Refresh and try again.");
        }

        createAndSendOffer();
      },
      (error) => {
        console.log(error);
        alert("Cannot get video");
      }
    );

  const readyButton = document.getElementById("ready-btn");
  try {
    readyFunction = () => {
      self = !self;
      try {
        if (peerConn) dataChannel.send(JSON.stringify({ ready: self }));
        else if (peerConnj)
          peerConnj.dataChannel.send(JSON.stringify({ ready: self }));
      } catch (err) {
        alert("Not connected to Opponent");
      }
      if (self) {
        readyButton.innerText = "Not Ready?";
      } else {
        readyButton.innerText = "Ready?";
      }
      if (opponent && self) {
        document.getElementById("status").style.display = "none";
        callback(true);
      }
    };
    readyButton.addEventListener("click", readyFunction);
  } catch (err) {
    console.log(err)
    alert("Not connected to Opponent.");
  }
}

async function createAndSendOffer() {
  // try{
  //   await peerConn.setLocalDescription(await peerConn.createOffer());

  //   sendData({
  //     type: "store_offer",
  //     offer: peerConn.localDescription,
  //   });
  // }
  // catch(err){
  //   console.log(err);
  //   console.log('cannot set local description or cannot create offer')
  // }

  peerConn
    .createOffer()
    .then((offer) => {
      console.log('offer : ',offer)
      peerConn.setLocalDescription(offer)
      .then(() => {
        console.log('local description set')
        sendData({
          type: "store_offer",
          offer: offer,
        });
      })
      .catch(err =>{
        console.log('local description is not set')
        console.log(err);
      });
    })
    .catch((error) => {
      console.log(error);
      alert("cnnot connect with opponent, refresh and try again.");
    });
}

let peerConnj;
function joinVideoCall(callback, roomName) {
  document.querySelector("p").style.display = "inline";
  username = getRoomName();
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then(
      (stream) => {
        localStream = stream;
        let configuration = {
          iceServers: [
            {
              urls: [
                "stun:stun.stunprotocol.org",
                "stun:stun.cheapvoip.com:3478",
                "stun:stun.commpeak.com:3478",
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
              ],
            },
            {
              urls: "turn:numb.viagenie.ca",
              credential: "muazkh",
              username: "webrtc@live.com"
            },
            {
              urls:"turn:106.215.229.64:3478",
              credential: "test123",
              username: "test"
              
            }
          ],
        };

        peerConnj = new RTCPeerConnection(configuration);
        localStream.getTracks().forEach(function (track) {
          peerConnj.addTrack(track, localStream);
        });

        peerConnj.onconnectionstatechange = (e) => {
          console.log('state : ',peerConnj.connectionState)
          if (
            peerConnj.connectionState == "failed" ||
            peerConnj.connectionState == "disconnected"
          ) {
            if (localStream) {
              localStream.getVideoTracks()[0].stop();
              localStream.getAudioTracks()[0].stop();
            }
            console.log(peerConnj.connectionState)
            if (peerConn) {
              peerConn.close();
            } else if (peerConnj) {
              peerConnj.close();
            }
            const remoteVideo = document.querySelector("video");
            remoteVideo.pause();
            remoteVideo.srcObject = null;

            const readyButton = document.getElementById("ready-btn");
            readyButton.removeEventListener("click", readyFunction);
            readyButton.innerText = "Ready?";

            const audioButton = document.getElementById("audio-btn");
            audioButton.innerText = "Mute yourself";

            document.getElementById("opponent-status").innerText =
              "Opponent is not ready";

            const videoButton = document.getElementById("video-btn");
            videoButton.innerText = "Mute Your Video";

            document.getElementById("status").style.display = "inline";
            document.getElementById("call").style.display = "none";
            self = false;
            opponent = false;
            isAudio = true;
            isVideo = true;
            

            alert("Not Available.");
          }
        };

        var dataChannelOptions = {
          reliable: true,
        };

        peerConnj.ondatachannel = (e) => {
          peerConnj.dataChannel = e.channel;
          peerConnj.dataChannel.onmessage = (event) => {
            const data = JSON.parse(event.data);
            opponent = data.ready;
            if (opponent) {
              document.getElementById("opponent-status").innerText =
                "Opponent is Ready";
            } else {
              document.getElementById("opponent-status").innerText =
                "Opponent Not Ready";
            }
            if (opponent && self) {
              document.getElementById("status").style.display = "none";
              callback(true);
            }
          };
          peerConnj.dataChannel.onopen = (e) => {
            console.log("connection opened");
          };
        };
        try {
          peerConnj.ontrack = (e) => {
            document.getElementById("call").style.display = "inline";
            const remoteStream = e.streams[0];
            const remoteVideo = document.querySelector("video");
            remoteVideo.srcObject = remoteStream;
            peerConnj.addEventListener("track", async (event) => {
              remoteStream.addTrack(event.track, remoteStream);
            });
            remoteVideo.playsInline = true;
            remoteVideo.autoplay = true;
          };
        } catch (err) {
          console.log(err)
          alert("cannot add video, proceed or refresh page and try again.");
        }

        // peerConnj.onicecandidate = (e) => {
        //   if (e.candidate == null) return;

        //   sendDataj({
        //     type: "send_candidate",
        //     candidate: e.candidate,
        //   });
        // };

        sendDataj({
          type: "join_call",
        });
      },
      (error) => {
        console.log(error)
        alert("cannot get video.");
      }
    );
  try {
    const readyButton = document.getElementById("ready-btn");
    readyFunction = () => {
      self = !self;
      console.log("self : ", self);
      try {
        if (peerConn) dataChannel.send(JSON.stringify({ ready: self }));
        else if (peerConnj)
          peerConnj.dataChannel.send(JSON.stringify({ ready: self }));
      } catch (err) {
        alert("Not connected to Opponent");
      }
      if (self) {
        readyButton.innerText = "Not Ready?";
      } else {
        readyButton.innerText = "Ready?";
      }
      if (opponent && self) {
        document.getElementById("status").style.display = "none";
        callback(true);
      }
    };
    readyButton.addEventListener("click", readyFunction);
  } catch (err) {
    console.log(err)
    alert("Not connected with opponent");
  }
}

function createAndSendAnswerj() {
  peerConnj.createAnswer(
    (answer) => {
      peerConnj.setLocalDescription(answer)
      .then(()=>{
        console.log('local description set')
        console.log('sending answer..')
        sendDataj({
          type: "send_answer",
          answer: answer,
        });
        peerConnj.onicecandidate = (e) => {
          if (e.candidate == null) return;

          sendDataj({
            type: "send_candidate",
            candidate: e.candidate,
          });
        };
      })
      .catch(err => {
        console.log('local description not set')
        console.log(err);
      });
      // console.log('sending answer..')
      // sendDataj({
      //   type: "send_answer",
      //   answer: answer,
      // });
    },
    (error) => {
      console.log(error)
      alert("cannot connect with opponent, Refresh page and try again.");
    }
  );
}

function sendDataj(data) {
  try {
    console.log(`sending.. ${data.type}`)
    data.username = username;
    data.from = "receiver";
    webSocket.send(JSON.stringify(data));
  } catch (err) {
    console.log(err)
    alert("try again");
  }
}

function videoStop() {
  if (localStream) {
    localStream.getVideoTracks()[0].stop();
    localStream.getAudioTracks()[0].stop();
  }
  if (peerConn) {
    peerConn.close();
  } else if (peerConnj) {
    peerConnj.close();
  }
  const remoteVideo = document.querySelector("video");
  remoteVideo.pause();
  remoteVideo.srcObject = null;

  const readyButton = document.getElementById("ready-btn");
  readyButton.removeEventListener("click", readyFunction);
  readyButton.innerText = "Ready?";

  const audioButton = document.getElementById("audio-btn");
  audioButton.innerText = "Mute yourself";

  document.getElementById("opponent-status").innerText =
    "Opponent is not ready";

  const videoButton = document.getElementById("video-btn");
  videoButton.innerText = "Mute Your Video";

  document.getElementById("status").style.display = "inline";
  document.getElementById("call").style.display = "none";
  self = false;
  opponent = false;
  isAudio = true;
  isVideo = true;
}

var isAudio = true;
const audioButton = document.getElementById("audio-btn");
audioFunction = () => {
  if (localStream) {
    isAudio = !isAudio;
    localStream.getAudioTracks()[0].enabled = isAudio;
    if (isAudio == true) audioButton.textContent = "Mute yourself";
    else audioButton.textContent = "Unmute yourself";
  }
};
audioButton.addEventListener("click", audioFunction);

var isVideo = true;
const videoButton = document.getElementById("video-btn");
videoFunction = () => {
  if (localStream) {
    isVideo = !isVideo;
    localStream.getVideoTracks()[0].enabled = isVideo;
    if (isVideo == true) videoButton.textContent = "Mute Your video";
    else videoButton.textContent = "Unmute Your video";
  }
};
videoButton.addEventListener("click", videoFunction);
const methods = {
  goToVideoCall,
  joinVideoCall,
  check,
  videoStop
}

export default methods
// module.exports = {
//   goToVideoCall,
//   joinVideoCall,
//   check,
//   videoStop,
// };
