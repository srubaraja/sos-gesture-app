let video, canvas, ctx;
let handpose, detector;
let isRunning = false;

// Start the camera
async function startCamera() {
    try {
        video = document.getElementById('webcam');
        canvas = document.getElementById('output');
        ctx = canvas.getContext('2d');
        
        // Get camera access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        video.srcObject = stream;
        
        // Wait for video to load
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            initializeAI();
        };
        
        document.getElementById('status').textContent = 'Camera on! Show me your hand 👋';
    } catch (error) {
        alert('Oops! Could not access camera. Please allow camera permissions.');
        console.error('Camera error:', error);
    }
}

// Load the hand-tracking AI
async function initializeAI() {
    try {
        // Load TensorFlow.js hand detection model
        handpose = await handpose.load();
        detector = new SOSDetector();
        
        isRunning = true;
        detectHands(); // Start detecting
    } catch (error) {
        console.error('AI loading error:', error);
        document.getElementById('status').textContent = 'AI helper taking a nap... 😴';
    }
}

// Main detection loop
async function detectHands() {
    if (!isRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
        // Detect hands in the video
        const predictions = await handpose.estimateHands(video);
        
        if (predictions.length > 0) {
            const hand = predictions[0];
            const landmarks = hand.landmarks;
            
            // Draw hand points (like connect-the-dots)
            drawHand(landmarks);
            
            // Detect what hand shape you're making
            const gesture = detector.detectHandShape(landmarks);
            
            // Check for SOS pattern
            if (detector.checkSOSPattern(gesture)) {
                triggerSOSAlert();
            }
            
            // Show current gesture
            document.getElementById('status').textContent = 
                `Seeing: ${gesture} hand ${detector.isSOS ? ' - 🆘 SOS DETECTED!' : ''}`;
        } else {
            document.getElementById('status').textContent = 'No hand detected - show me your hand! 👋';
        }
    } catch (error) {
        console.error('Detection error:', error);
    }
    
    // Keep checking (like a game loop)
    requestAnimationFrame(detectHands);
}

// Draw hand dots and lines
function drawHand(landmarks) {
    ctx.fillStyle = '#00FF00';
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    
    // Draw dots for each finger point
    landmarks.forEach(point => {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw lines connecting the dots (like a hand skeleton)
    const connections = [
        [0,1,2,3,4],           // Thumb
        [0,5,6,7,8],           // Index finger
        [0,9,10,11,12],        // Middle finger
        [0,13,14,15,16],       // Ring finger
        [0,17,18,19,20]        // Pinky
    ];
    
    connections.forEach(finger => {
        ctx.beginPath();
        for (let i = 0; i < finger.length - 1; i++) {
            const start = landmarks[finger[i]];
            const end = landmarks[finger[i + 1]];
            ctx.moveTo(start[0], start[1]);
            ctx.lineTo(end[0], end[1]);
        }
        ctx.stroke();
    });
}

// SOS Alert!
function triggerSOSAlert() {
    const status = document.getElementById('status');
    status.textContent = '🆘 EMERGENCY SOS DETECTED! 🆘';
    status.className = 'status sos';
    
    // Make flashy alert
    alert('🚨 SOS SIGNAL DETECTED! 🚨\nHelp has been notified!');
    
    // You can add more alerts here:
    // - Play loud sound
    // - Send email to family
    // - Call emergency number
}

// Test button
function testSOS() {
    triggerSOSAlert();
}

// Start when page loads
window.onload = () => {
    document.getElementById('status').textContent = 'Click "Start Camera" to begin!';
};
