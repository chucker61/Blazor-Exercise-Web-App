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

const exercisesWithDetails = [
    {
        exerciseName: "Squat",
        anglePointsForPosture: [4, 5, 6, 7],
        anglePointsForReps: [6, 7],
        targetMinAnglesForPosture: [30, 60, 30, 60],
        targetMaxAnglesForPosture: [30, 60, 30, 60],
        targetMinAnglesForReps: [30, 60],
        targetMaxAnglesForReps: [30, 60]
    },
    {
        exerciseName: "Push Up",
        anglePointsForPosture: [2, 3, 4, 5, 6, 7],
        anglePointsForReps: [0, 1],
        targetMinAnglesForPosture: [10, 10, 150, 150, 150, 150],
        targetMaxAnglesForPosture: [50, 50, 150, 150, 150, 150],
        targetMinAnglesForReps: [20, 20],
        targetMaxAnglesForReps: [160, 160]
    },
    {
        exerciseName: "Pull Up",
        anglePointsForPosture: [2, 3],
        anglePointsForReps: [0, 1, 2, 3],
        targetMinAnglesForPosture: [30, 60],
        targetMaxAnglesForPosture: [30, 60],
        targetMinAnglesForReps: [30, 60],
        targetMaxAnglesForReps: [30, 60]
    },
    {
        exerciseName: "Crunches",
        anglePointsForPosture: [4, 5],
        anglePointsForReps: [4, 5],
        targetMinAnglesForPosture: [30, 60],
        targetMaxAnglesForPosture: [30, 60],
        targetMinAnglesForReps: [30, 60],
        targetMaxAnglesForReps: [30, 60]
    },
];

let angles = [
    { id: 0, p1: 0, p2: 0, p3: 0, angleName: "leftElbow", angleValue: 0 },
    { id: 1, p1: 0, p2: 0, p3: 0, angleName: "rightElbow", angleValue: 0 },
    { id: 2, p1: 0, p2: 0, p3: 0, angleName: "leftShoulder", angleValue: 0 },
    { id: 3, p1: 0, p2: 0, p3: 0, angleName: "rightShoulder", angleValue: 0 },
    { id: 4, p1: 0, p2: 0, p3: 0, angleName: "leftHip", angleValue: 0 },
    { id: 5, p1: 0, p2: 0, p3: 0, angleName: "rightHip", angleValue: 0 },
    { id: 6, p1: 0, p2: 0, p3: 0, angleName: "leftKnee", angleValue: 0 },
    { id: 7, p1: 0, p2: 0, p3: 0, angleName: "rightKnee", angleValue: 0 },
]

let count = 0;
let dir = 0;


async function estimatePose(exerciseName) {
    setupCamera();
    document.getElementById("overlay").requestFullscreen().catch(console.log);
    const exercise = exercisesWithDetails.find(x => x.exerciseName === exerciseName);
    const video = document.getElementById("video");
    const canvas = document.getElementById('overlay');
    const ctx = canvas.getContext('2d');
    detector = await createDetector();

    async function createDetector() {
        return await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    }

    async function poseDetectionFrame() {
        const result = await detector.estimatePoses(video);
        if (result != null && result.length > 0) {
            const keypoints = result[0].keypoints;
            angles = [
                { id: 0, p1: keypoints[5], p2: keypoints[7], p3: keypoints[9], angleName: "leftElbow", angleValue: 0 },
                { id: 1, p1: keypoints[10], p2: keypoints[8], p3: keypoints[6], angleName: "rightElbow", angleValue: 0 },
                { id: 2, p1: keypoints[7], p2: keypoints[5], p3: keypoints[11], angleName: "leftShoulder", angleValue: 0 },
                { id: 3, p1: keypoints[12], p2: keypoints[6], p3: keypoints[8], angleName: "rightShoulder", angleValue: 0 },
                { id: 4, p1: keypoints[5], p2: keypoints[11], p3: keypoints[13], angleName: "leftHip", angleValue: 0 },
                { id: 5, p1: keypoints[6], p2: keypoints[12], p3: keypoints[14], angleName: "rightHip", angleValue: 0 },
                { id: 6, p1: keypoints[11], p2: keypoints[13], p3: keypoints[15], angleName: "leftKnee", angleValue: 0 },
                { id: 7, p1: keypoints[12], p2: keypoints[14], p3: keypoints[16], angleName: "rightKnee", angleValue: 0 },
            ]
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            drawKeypoints(keypoints, 0.2);
            drawPoseLines(keypoints, exercise, 0.2);
            findAngle(0.2);
            countReps(exercise,0.01);
            checkPosture(exercise, angles, 0.2);
        }
        requestAnimationFrame(poseDetectionFrame);
    }

    poseDetectionFrame();
}

function quitExercise() {
    count = 0;
    dir = 0;
    stopVideo();
    document.exitFullscreen();
}


function drawKeypoints(keypoints, minPoseScore) {
    const ctx = document.getElementById('overlay').getContext('2d');
    keypoints.forEach(keypoint => {
        if (keypoint.score >= minPoseScore) {
            ctx.beginPath();
            ctx.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
        }
    });
}

function drawPoseLines(keypoints, exercise, minPoseScore) {
    const ctx = document.getElementById('overlay').getContext('2d');
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

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

function findAngle(minPoseScore) {
    const ctx = document.getElementById('overlay').getContext('2d');

    angles.forEach(connection => {
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
            connection.angleValue = theta;
            ctx.font = "16px serif";
            ctx.fillText(theta, p2.x, p2.y);
        }
    });

}

function countReps(exercise, minPoseScore) {
    const ctx = document.getElementById('overlay').getContext('2d');

    exercise.anglePointsForReps.forEach((angle, index) => {
        if (angles[angle].p1.score > minPoseScore && angles[angle].p2.score > minPoseScore && angles[angle].p3.score > minPoseScore) {
            if (angles[angle].angleValue == exercise.targetMaxAnglesForReps[index]) {
                if (dir == 0) {
                    count += 0.5;
                    dir = 1;    
                }
            }
            if (angles[angle].angleValue == exercise.targetMinAnglesForReps[index]) {
                if (dir == 1) {
                    count += 0.5;
                    dir = 0;
                }
            }
            ctx.font = "24px serif";
            ctx.fillText(count.toString(), 50,50);
        }
    });
}

function checkPosture(exercise, angles, minPoseScore) {
    const ctx = document.getElementById('overlay').getContext('2d');

    exercise.anglePointsForPosture.forEach((angle, index) => {
        if (angles[angle].p1.score > minPoseScore && angles[angle].p2.score > minPoseScore && angles[angle].p3.score > minPoseScore) {
            if (angles[angle].angleValue < exercise.targetMinAnglesForPosture[index] || angles[angle].angleValue > exercise.targetMaxAnglesForPosture[index]) {
                ctx.beginPath();
                ctx.moveTo(angles[angle].p1.x, angles[angle].p1.y);
                ctx.lineTo(angles[angle].p2.x, angles[angle].p2.y);
                ctx.moveTo(angles[angle].p2.x, angles[angle].p2.y);
                ctx.lineTo(angles[angle].p3.x, angles[angle].p3.y);
                ctx.strokeStyle = 'red';
                ctx.stroke();
            }
            else {
                ctx.beginPath();
                ctx.moveTo(angles[angle].p1.x, angles[angle].p1.y);
                ctx.lineTo(angles[angle].p2.x, angles[angle].p2.y);
                ctx.moveTo(angles[angle].p2.x, angles[angle].p2.y);
                ctx.lineTo(angles[angle].p3.x, angles[angle].p3.y);
                ctx.strokeStyle = 'green';
                ctx.stroke();
            }
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
