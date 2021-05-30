const socket = io("/");
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined,{
    host:'/',
    port:'3001'
})
let peer={};
const myVideo = document.createElement('video');
myVideo.muted = true

navigator.mediaDevices.getUserMedia({
    video:true,
    // audio:true
}).then(stream =>{
  addVideoStrean(myVideo,stream)
  myPeer.on('call',call=>{
      call.answer(stream)
      const video = document.createElement("video");
      call.on('stream',userVideoStream =>{
        addVideoStrean(video,userVideoStream)
      })
  })
  socket.on('user-connected',userId =>{
     connectedToNewUser(userId,stream) 
  })
})

socket.on('user-disconnected',userId=>{
    if(peer[userId]) {
        peer[userId].close()
    }
})

myPeer.on('open',id=>{
    socket.emit('join-room',ROOM_ID,id)
})

// socket.emit('join-room',ROOM_ID,10)

socket.on('user-connected',(userid)=>{
    console.log('User Connected',userid)
})

function addVideoStrean(video,stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata',()=>{
        video.play()
    })
    videoGrid.append(video)
}


function connectedToNewUser(userid,stream){
    const call = myPeer.call(userid,stream)
    const video = document.createElement("video")
    call.on('stream',userVideoStream =>{
        addVideoStrean(video,userVideoStream)
    })
    call.on('close',()=>{
        video.remove()
    })
    peer[userid] = call;
}