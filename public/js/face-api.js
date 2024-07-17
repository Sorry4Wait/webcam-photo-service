const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const countdown = document.getElementById('countdown');
const message = document.getElementById('message');
const context = canvas.getContext('2d');
const snap = document.getElementById('snap');
const socket = io();

let countdownInterval;

let mediaStream = null;
let faceDetected = false;

async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
}

async function detectFace() {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
    return detections.length > 0;
}


// Function to open web camera
async function openCamera() {
    if (!mediaStream) {
        await loadModels().then(startVideo);

        // Запускаем распознавание лиц автоматически каждые 5 секунд
        setInterval(detectFaceAndTakePhoto, 250);
    }
}

async function detectFaceAndTakePhoto() {
    const hasFace = await detectFace();
    if (hasFace && !faceDetected) {
        faceDetected = true;
        showMessage('Не двигайтесь!');
        startCountdown(3, takePhoto); // Начинаем новый обратный отсчет с 3 секунд при обнаружении лица
    } else if (!hasFace && faceDetected) {
        faceDetected = false;
        if(!mediaStream) return;
        countdown.style.display = 'none';
        showMessage('Лицо не обнаружено, попробуйте снова.');
        clearInterval(countdownInterval); // Останавливаем обратный отсчет, если лицо не обнаружено
    }
}
// Function to close web camera
function closeCamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
        video.style.display = 'none';
    }
}
async function startVideo() {
    navigator.mediaDevices.getUserMedia({
        video: {
            width: {
                min: 1280,
                ideal: 1920,
                max: 2560,
            },
            height: {
                min: 720,
                ideal: 1080,
                max: 1440
            },
            facingMode: 'user'
        }
    })
        .then((stream) => {
            mediaStream = stream;
            video.style.display = 'block';
            video.srcObject = stream;
        })
        .catch((err) => {
            console.error("Error accessing webcam: ", err);
        });
}

// Handle message from client
window.addEventListener('message', async (event) => {
    if (event.data === 'openCamera') {
       await openCamera();
    } else if (event.data === 'closeCamera') {
        closeCamera();
    }
});

// Handle snap button
// snap.addEventListener('click', async () => {
//     const hasFace = await detectFace();
//     if (hasFace) {
//         showMessage('Не двигайтесь!');
//         startCountdown(3, takePhoto); // Начинаем обратный отсчет с 3 секунд
//     } else {
//         showMessage('Лицо не обнаружено, попробуйте снова.');
//     }
// });
function startCountdown(seconds, callback) {
    clearInterval(countdownInterval);
    countdown.style.display = 'block';
    countdown.textContent = seconds;
    countdown.style.opacity = '1';

    countdownInterval = setInterval(() => {
        seconds -= 1;
        if (seconds >= 0) {
            countdown.textContent = seconds === 0 ? 'Снимаем...' : seconds;
        } else {
            clearInterval(countdownInterval);
            countdown.style.opacity = '0';
            setTimeout(() => {
                countdown.style.display = 'none';
            }, 300); // Плавно скрываем элемент после завершения отсчета
            callback();
        }
    }, 1000);
}
function showMessage(msg) {
    message.textContent = msg;
    message.style.display = 'block';
    message.style.opacity = '1';
    setTimeout(() => {
        message.style.opacity = '0';
        setTimeout(() => {
            message.style.display = 'none';
        }, 300); // Плавно скрываем элемент после завершения отображения сообщения
    }, 3000); // Показываем сообщение на 3 секунды
}
function takePhoto() {
    context.drawImage(video, 0, 0, 640, 480);
    const dataURL = canvas.toDataURL('image/png');
    socket.emit('photo', dataURL);
}

// Handle click to get photo
// video.addEventListener('click', () => {
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const dataURL = canvas.toDataURL('image/png');
//     socket.emit('photo', dataURL);
// });

// Take photo from server
socket.on('photoResponse', (data) => {
    // Send photo to client from postMessage
    window.parent.postMessage({type: 'photo', photo_from_camera: data}, '*');
    closeCamera(); // Close web camera after get photo from server
});