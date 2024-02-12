async function loadMoveNet() {
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    const video = document.getElementById('videoElement');
    const poses = await detector.estimatePoses(video);
    console.log(poses[0].keypoints);
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
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
        const video = document.getElementById('videoElement');
        const poses = await detector.estimatePoses(video);
        console.log(poses[0].keypoints);
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
