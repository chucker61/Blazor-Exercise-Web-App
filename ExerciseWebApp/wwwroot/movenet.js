let detector;

// Ana işlem
async function run() {

    const canvas = document.getElementById('overlay');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('video');
        video.width = 320;
        video.heigh = 240;

        video.srcObject = stream;
        video.onloadedmetadata = async () => {
            video.play();
            if (detector == null) {
                detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
            }
            const poses = await detector.estimatePoses(video);
            const keypoints = poses[0].keypoints;
        };
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




