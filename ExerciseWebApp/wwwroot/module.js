let detector;

async function initializeDetector() {
    const poseDetection = await tf.poseDetection;
    const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
    detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
}

async function startVideo(src) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement = document.getElementById(src);
        if ("srcObject" in videoElement) {
            videoElement.srcObject = stream;
        } else {
            videoElement.src = window.URL.createObjectURL(stream);
        }
        videoElement.onloadedmetadata = function (e) {
            videoElement.play();
        };
        //mirror image
        videoElement.style.webkitTransform = "scaleX(-1)";
        videoElement.style.transform = "scaleX(-1)";
    }
}

function stopVideo() {
    if (videoElement && "srcObject" in videoElement) {
        const stream = videoElement.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
        videoElement.srcObject = null;
    }
}

async function getPose() {

    await initializeDetector();
 
    const image = await captureFrame();
    const poses = await detector.estimatePoses(image);
    return poses;
}

async function captureFrame() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
}
