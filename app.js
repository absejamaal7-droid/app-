const APP_ID = "57328947f33b4378a4b88b603be93905"; // Bakka kanatti App ID kee galchi
const TOKEN = null;
let CHANNEL;

const client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});

let localTracks = [];
let remoteUsers = {};

let joinAndDisplayLocalStream = async () => {
    client.on('user-published', handleUserJoined);
    client.on('user-left', handleUserLeft);

    let UID = await client.join(APP_ID, CHANNEL, TOKEN, null);

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

    let player = `<div class="video-player" id="user-container-${UID}">
                    <div id="user-${UID}"></div>
                  </div>`;
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);

    localTracks[1].play(`user-${UID}`);
    
    await client.publish([localTracks[0], localTracks[1]]);
}

let joinStream = async () => {
    CHANNEL = document.getElementById('room-name').value.toLowerCase();
    if(!CHANNEL) return alert("Maaloo maqaa kutaa galchi!");

    document.getElementById('lobby-container').style.display = 'none';
    document.getElementById('video-container').style.display = 'flex';

    await joinAndDisplayLocalStream();
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user;
    await client.subscribe(user, mediaType);

    if (mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`);
        if (player != null) {
            player.remove();
        }

        player = `<div class="video-player" id="user-container-${user.uid}">
                    <div id="user-${user.uid}"></div>
                 </div>`;
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);

        user.videoTrack.play(`user-${user.uid}`);
    }

    if (mediaType === 'audio') {
        user.audioTrack.play();
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid];
    document.getElementById(`user-container-${user.uid}`).remove();
}

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop();
        localTracks[i].close();
    }

    await client.leave();
    document.getElementById('lobby-container').style.display = 'block';
    document.getElementById('video-container').style.display = 'none';
    document.getElementById('video-streams').innerHTML = '';
}

// Mic fi Camera On/Off gochuuf
let toggleMic = async (e) => {
    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false);
        e.target.innerText = 'Mic On';
        e.target.style.backgroundColor = '#333';
    } else {
        await localTracks[0].setMuted(true);
        e.target.innerText = 'Mic Off';
        e.target.style.backgroundColor = 'red';
    }
}

let toggleCamera = async (e) => {
    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false);
        e.target.innerText = 'Camera On';
        e.target.style.backgroundColor = '#333';
    } else {
        await localTracks[1].setMuted(true);
        e.target.innerText = 'Camera Off';
        e.target.style.backgroundColor = 'red';
    }
}

document.getElementById('join-btn').addEventListener('click', joinStream);
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream);
document.getElementById('mic-btn').addEventListener('click', toggleMic);
document.getElementById('camera-btn').addEventListener('click', toggleCamera);
