let isFaceDetection = true; // Flag to indicate whether face detection is enabled

function openCvReady() {
    cv['onRuntimeInitialized'] = () => {
        let video = document.getElementById("cam_input"); 
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err) {
            console.log("An error occurred! " + err);
        });
        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        let gray = new cv.Mat();
        let cap = new cv.VideoCapture(cam_input);
        let faces = new cv.RectVector();
        let faceClassifier = new cv.CascadeClassifier();
        let utils = new Utils('errorMessage');
        let faceCascadeFile = 'haarcascade_frontalface_default.xml'; 
        utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
            faceClassifier.load(faceCascadeFile); 
        });
        
        const FPS = 24;

        function processVideo() {
            let begin = Date.now();
            cap.read(src);
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);

            
            try {
                faceClassifier.detectMultiScale(gray, faces, 1.1, 3, 0);
                /* console.log(faces.size()); */
            } catch (err) {
                console.log(err);
            }
            for (let i = 0; i < faces.size(); ++i) {
                let face = faces.get(i);
                let point1 = new cv.Point(face.x, face.y);
                let point2 = new cv.Point(face.x + face.width, face.y + face.height);
                cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);
            } 
            if (faces.size() === 0) {
                cv.putText(dst, "Please look at the camera", { x: 50, y: 50 }, cv.FONT_HERSHEY_SIMPLEX, 1.0, [0, 0, 255, 255], 2);
            }
            

            cv.imshow("canvas_output", dst);

            let delay = 1000 / FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        }
        setTimeout(processVideo, 0);
    };
}
