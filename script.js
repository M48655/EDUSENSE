const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

let hasAnswered = false;

hands.onResults((results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks.length > 0) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
      drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});

      if (!hasAnswered && landmarks[0].y < 0.3) {
        showMessage("✅ Answer Recorded!");
        hasAnswered = true;
      }
    }
  }

  canvasCtx.restore();
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 640,
  height: 480
});

camera.start();

function showMessage(msg) {
  let messageBox = document.getElementById("message");
  if (!messageBox) {
    messageBox = document.createElement("div");
    messageBox.id = "message";
    messageBox.style.position = "absolute";
    messageBox.style.top = "10px";
    messageBox.style.left = "10px";
    messageBox.style.backgroundColor = "white";
    messageBox.style.padding = "10px";
    messageBox.style.fontSize = "20px";
    messageBox.style.border = "2px solid black";
    document.body.appendChild(messageBox);
  }
  messageBox.innerText = msg;
}

// 🎤 تسجيل الصوت
let mediaRecorder;
let audioChunks = [];

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();

      mediaRecorder.ondataavailable = e => {
        audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = document.getElementById('student-audio');
        audio.src = audioUrl;
        audio.style.display = 'block';
      };

      showMessage("🎤 Recording started...");
    })
    .catch(err => {
      console.error('Error accessing microphone', err);
      showMessage("❌ Could not access microphone.");
    });
}

function stopRecording() {
  if (mediaRecorder) {
    mediaRecorder.stop();
    showMessage("✅ Recording stopped.");
  }
}








