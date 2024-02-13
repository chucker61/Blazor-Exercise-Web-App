let detector;

// Ana işlem
async function run() {
    
    const canvas = document.getElementById('overlay');
    // Kullanıcıdan kamera izni iste ve başlat
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false
            video: {
                height: 240,
                width: 320,
                facingMode : 'user',
            }
        });
        const video = document.getElementById('video');
        video.srcObject = stream;
        video = await new Promise((resolve, reject) => {
            video.onloadedmetadata = () => resolve(videoElement);
        });
        video.play();

    } catch (err) {
        console.error("Kamera erişiminde hata:", err);
    }
    if (detector == null) {
        detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    }

    const poses = await detector.estimatePoses(video);
    const keypoints = poses[0].keypoints;
    return keypoints;
}




