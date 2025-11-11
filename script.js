const video = document.getElementById('video');

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    alert('Error accessing camera: ' + err);
  }
}

startCamera();

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.8,
  minTrackingConfidence: 0.8
});
hands.onResults(onResults);

const mpCamera = new Camera(video, {
  onFrame: async () => { await hands.send({ image: video }); },
  width: 640,
  height: 480
});
mpCamera.start();

function onResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    document.getElementById('status').innerText = "Gesture detected!";
    detectSOSGesture(results.multiHandLandmarks[0]);
  } else {
    document.getElementById('status').innerText = "No hand detected.";
  }
}

function detectSOSGesture(landmarks) {
  const thumbTip = landmarks[4];
  const pinkyTip = landmarks[20];

  const dist = Math.sqrt(
    (thumbTip.x - pinkyTip.x) ** 2 +
    (thumbTip.y - pinkyTip.y) ** 2 +
    (thumbTip.z - pinkyTip.z) ** 2
  );

  if (dist < 0.05) {
    document.getElementById('status').innerText = "SOS Gesture recognized! Sending alert...";
    sendSOSAlert();
  }
}

function sendSOSAlert() {
  alert("SOS Alert Sent! Emergency contacts notified.");
  playAlarmSound();
}

function playAlarmSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 1);
}
