async function setupCamera() {

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('video');
        video.width = 640;
        video.height = 480;
        video.srcObject = stream;
        video.onloadedmetadata = async () => {
            video.play();
        }
    }
    else {
        alert('Webcam not available');
    }
}

async function estimatePose(exerciseName) {
    setupCamera();
    const video = document.getElementById("video")
    const canvas = document.getElementById('overlay');
    const ctx = canvas.getContext('2d');
    const detector = await createDetector();

    async function createDetector() {
        return await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    }

    async function poseDetectionFrame() {
        const result = await detector.estimatePoses(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        drawKeypoints(result, 0.2);
        drawPoseLines(result, 0.2);
        requestAnimationFrame(poseDetectionFrame);
        return result
    }
    poseDetectionFrame();
}

function drawKeypoints(result, minPoseScore) {
    const ctx = document.getElementById('overlay').getContext('2d');
    result.forEach(person => {
        person.keypoints.forEach(keypoint => {
            if (keypoint.score >= minPoseScore) {
                ctx.beginPath();
                ctx.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            }
        });
    });
}

function drawPoseLines(result, minPoseScore) {
    const ctx = document.getElementById('overlay').getContext('2d');
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    result.forEach(person => {
        const keypoints = person.keypoints;
        const poseConnections = [
            { from: keypoints[5], to: keypoints[7] },
            { from: keypoints[5], to: keypoints[6] },
            { from: keypoints[7], to: keypoints[9] },
            { from: keypoints[5], to: keypoints[11] },
            { from: keypoints[11], to: keypoints[12] },
            { from: keypoints[11], to: keypoints[13] },
            { from: keypoints[13], to: keypoints[15] },
            { from: keypoints[6], to: keypoints[8] },
            { from: keypoints[6], to: keypoints[12] },
            { from: keypoints[8], to: keypoints[10] },
            { from: keypoints[12], to: keypoints[14] },
            { from: keypoints[14], to: keypoints[16] },
        ];

        poseConnections.forEach(connection => {
            const from = connection.from;
            const to = connection.to;
            if (from.score >= minPoseScore && to.score >= minPoseScore) {
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
            }
        });
    });
}


function stopVideo() {
    const video = document.getElementById("video");
    if (video && "srcObject" in video) {
        const stream = video.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
        video.srcObject = null;
    }
}