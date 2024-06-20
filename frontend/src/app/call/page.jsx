// CallPage.js
'use client'
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import io from 'socket.io-client';

const socket = io('http://localhost:8000'); // Update with your server URL

const CallPage = () => {
  const [myId, setMyId] = useState('');
  const [remoteId, setRemoteId] = useState('');
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      setMyId(id);
      socket.emit('join', id);
    });

    peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          myVideoRef.current.srcObject = stream;
          myVideoRef.current.play();
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play();
          });
        });
    });

    socket.on('offer', (data) => {
      peerRef.current.signal(data.offer);
    });

    socket.on('answer', (data) => {
      peerRef.current.signal(data.answer);
    });

    socket.on('candidate', (data) => {
      peerRef.current.signal(data.candidate);
    });

  }, []);

  const makeCall = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        myVideoRef.current.srcObject = stream;
        myVideoRef.current.play();
        const call = peerRef.current.call(remoteId, stream);
        call.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        });

        peerRef.current.on('signal', (data) => {
          if (data.type === 'offer') {
            socket.emit('offer', { offer: data, target: remoteId });
          } else if (data.type === 'answer') {
            socket.emit('answer', { answer: data, target: remoteId });
          } else if (data.candidate) {
            socket.emit('candidate', { candidate: data, target: remoteId });
          }
        });
      });
  };

  return (
    <div>
      <h1>Video Call</h1>
      <div>
        <label>Your ID: {myId}</label>
      </div>
      <div>
        <label>Remote ID:</label>
        <input type="text" value={remoteId} onChange={(e) => setRemoteId(e.target.value)} />
        <button onClick={makeCall}>Call</button>
      </div>
      <div>
        <video ref={myVideoRef} width="300" height="200" />
        <video ref={remoteVideoRef} width="300" height="200" />
      </div>
    </div>
  );
};

export default CallPage;
