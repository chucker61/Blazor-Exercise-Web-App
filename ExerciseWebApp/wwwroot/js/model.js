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


function getFullScreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
}

function toggleFullScreen() {

    if (getFullScreenElement()) {
        document.exitFullscreen();
    } else {
        document.getElementById("overlay").requestFullscreen().catch(console.log);
    }
}


const keypointsByExerciseName = [
    { exerciseName: "Squat", pcsForValidation: [3, 5, 8, 10], pcsForCount: [10,11], angle: [30, 60] },
    { exerciseName: "Push Up", pcsForValidation: [1, 2, 3, 4], pcsForCount: [1, 2], angle: [30, 60] },
    { exerciseName: "Pull Up", pcsForValidation: [1, 2, 3, 4], pcsForCount: [1, 2], angle: [30, 60] },
    { exerciseName:"Crunches", pcsForValidation: [1, 2, 3, 4], pcsForCount: [1, 2], angle: [30, 60] },
];


async function estimatePose(exerciseName) {
    setupCamera();
    document.getElementById("overlay").requestFullscreen().catch(console.log);
    const exercise = keypointsByExerciseName.find(x => x.exerciseName === exerciseName);
    const video = document.getElementById("video");
    const canvas = document.getElementById('overlay');
    const ctx = canvas.getContext('2d');
    detector = await createDetector(); 

    async function createDetector() {
        return await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    }

    async function poseDetectionFrame() {
        const result = await detector.estimatePoses(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (result != null && result.length > 0) {
            drawKeypoints(result[0], 0.2);
            drawPoseLines(result[0], exercise, 0.2);
            findAngle(result[0], 0.2);
        }
        requestAnimationFrame(poseDetectionFrame);
        return result;
    }

    poseDetectionFrame();

    
}

function quitExercise() {   
    stopVideo();
    document.exitFullscreen();
}


function drawKeypoints(result, minPoseScore) {
    const ctx = document.getElementById('overlay').getContext('2d');
    result.keypoints.forEach(keypoint => {
        if (keypoint.score >= minPoseScore) {
            ctx.beginPath();
            ctx.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
        }
    });
}

function drawPoseLines(result, exercise, minPoseScore) {
    const ctx = document.getElementById('overlay').getContext('2d');
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    const keypoints = result.keypoints;
    const poseConnections = [
        { id: 0, from: keypoints[5], to: keypoints[7] }, //sol omuzdan sol dirseğe
        { id: 1, from: keypoints[5], to: keypoints[6] }, // sol omuzdan sağ omuza
        { id: 2, from: keypoints[7], to: keypoints[9] }, //sol dirsekten sol el bileğine
        { id: 3, from: keypoints[5], to: keypoints[11] }, // sol omuzdan sol kalçaya
        { id: 4, from: keypoints[11], to: keypoints[12] }, //sol kalçadan sağ kalçaya
        { id: 5, from: keypoints[11], to: keypoints[13] }, //sol kolçadan sol dize
        { id: 6, from: keypoints[13], to: keypoints[15] }, //sol dizden sol ayak bileğine
        { id: 7, from: keypoints[6], to: keypoints[8] }, //sağ omuzdan sağ dirseğe
        { id: 8, from: keypoints[6], to: keypoints[12] }, //sağ omuzdan sağ kalçaya
        { id: 9, from: keypoints[8], to: keypoints[10] }, //sağ dirsekten sağ el bileğine
        { id: 10, from: keypoints[12], to: keypoints[14] }, //sağ kalçadan sağ dize
        { id: 11, from: keypoints[14], to: keypoints[16] }, //sağ dizden sağ ayak bileğine
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
}

function findAngle(result, minPoseScore) {
    const ctx = document.getElementById('overlay').getContext('2d');
    const keypoints = result.keypoints;
    const poseConnections = [
        { p1: keypoints[5], p2: keypoints[7], p3: keypoints[9] }, //sol dirsek açısı
        { p1: keypoints[10], p2: keypoints[8], p3: keypoints[6] }, // sağ dirsek açısı
        { p1: keypoints[7], p2: keypoints[5], p3: keypoints[11] }, //sol omuz açısı
        { p1: keypoints[12], p2: keypoints[6], p3: keypoints[8] }, // sağ omuz açısı
        { p1: keypoints[5], p2: keypoints[11], p3: keypoints[13] }, //sol kalça açısı
        { p1: keypoints[6], p2: keypoints[12], p3: keypoints[14] }, //sağ kalça açısı
        { p1: keypoints[11], p2: keypoints[13], p3: keypoints[15] }, //sol diz açısı
        { p1: keypoints[12], p2: keypoints[14], p3: keypoints[16] }, //sağ diz açısı
    ];

    poseConnections.forEach(connection => {
        const p1 = connection.p1;
        const p2 = connection.p2;
        const p3 = connection.p3;
        if (p1.score >= minPoseScore && p2.score >= minPoseScore && p3.score >= minPoseScore) {
            let theta = Math.atan2(p3.y - p2.y, p3.x - p2.x) -
                Math.atan2(p1.y - p2.y, p1.x - p2.x)
            theta = Math.ceil(theta * 180 / Math.PI);
            if (theta < 0)
                theta += 360;
            if (theta > 180)
                theta = 360 - theta;
            ctx.font = "16px serif";
            ctx.fillText(theta, p2.x, p2.y);
        }
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