// This is our SOS detector - it looks for hand signals
class SOSDetector {
    constructor() {
        this.gestureHistory = [];
        this.sosPattern = ['fist', 'open', 'fist', 'open', 'fist', 'open'];
        this.isSOS = false;
    }

    // Check what hand shape you're making
    detectHandShape(landmarks) {
        if (!landmarks) return 'unknown';
        
        // Get finger tip positions
        const fingertips = [
            landmarks[4],  // thumb tip
            landmarks[8],  // index tip
            landmarks[12], // middle tip
            landmarks[16], // ring tip
            landmarks[20]  // pinky tip
        ];

        const palmBase = landmarks[0];
        
        // Check if fingers are closed (fist)
        let closedFingers = 0;
        fingertips.forEach(tip => {
            const distance = Math.sqrt(
                Math.pow(tip.x - palmBase.x, 2) + 
                Math.pow(tip.y - palmBase.y, 2)
            );
            if (distance < 0.2) closedFingers++;
        });

        if (closedFingers >= 4) return 'fist';
        return 'open';
    }

    // Look for SOS pattern (fist-open-fist-open-fist-open)
    checkSOSPattern(currentGesture) {
        this.gestureHistory.push(currentGesture);
        
        // Keep only last 6 gestures
        if (this.gestureHistory.length > 6) {
            this.gestureHistory.shift();
        }

        // Check if pattern matches SOS
        if (this.gestureHistory.length === 6) {
            let match = true;
            for (let i = 0; i < 6; i++) {
                if (this.gestureHistory[i] !== this.sosPattern[i]) {
                    match = false;
                    break;
                }
            }
            
            if (match) {
                this.isSOS = true;
                setTimeout(() => {
                    this.isSOS = false;
                    this.gestureHistory = [];
                }, 5000); // Reset after 5 seconds
                return true;
            }
        }
        
        return false;
    }
}
