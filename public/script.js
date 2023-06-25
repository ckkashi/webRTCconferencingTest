const socket = io('/');
const videoGrid = document.getElementById('video-grid');
var myPeer = new Peer(undefined,{
    host:'/',
    port:'3001'
});
const peers = {};
myPeer.on('open',id=>{
    socket.emit('join-room',ROOM_ID,id);
})

const myVid = document.createElement('video');
myVid.muted = true;

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream=>{
    addVideoStream(myVid,stream);
    
    myPeer.on('call',call=>{
        call.answer(stream);

        const video = document.createElement('video');
        call.on('stream',userVideoStream=>{
            addVideoStream(video,userVideoStream);
        });
    })

    socket.on('user-connected',userId => {
        connectToNewUser(userId,stream);    
    })
})

socket.on('user-disconnected',userId => {
    console.log('user close the stream : ' + userId);    
    if(peers[userId]){
        peers[userId].close();
    }
})


const addVideoStream = (video,stream)=>{
    video.srcObject = stream;
    video.addEvenetListener('loadedmetadata',()=>{
        video.play();
    })
    videoGrid.append(video);
}

const connectToNewUser = (userId,stream)=>{
    const call = myPeer.call(userId,stream);
    const video = document.createElement('video');
    call.on('stream',userVideoStream => {
        addVideoStream(video,userVideoStream);
    });
    call.on('close',()=>{
        video.remove();
    })

    peers[userId] = call;
}