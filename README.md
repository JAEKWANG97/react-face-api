# 얼굴 인식 앱

![image](https://github.com/user-attachments/assets/8bbdfde2-b23f-4634-9517-89790232869c)


이 React 애플리케이션은 `face-api.js` 라이브러리를 사용하여 웹캠을 통해 실시간으로 얼굴, 얼굴 랜드마크 및 표정을 인식합니다.

## 주요 기능

- 실시간 얼굴 인식
- 얼굴 랜드마크(눈, 코, 입 등) 인식
- 얼굴 표정(행복, 슬픔, 화남 등) 인식
- 비디오 피드에 인식 결과 오버레이

## 필요 사항

- Node.js
- npm (Node 패키지 관리자)

## 설치 방법

1. **저장소 클론**:
   ```bash
   git clone https://github.com/yourusername/facedetection-app.git
   cd facedetection-app
   ```

2. **종속성 설치**:
   ```bash
   npm install
   ```

3. **face-api.js 모델 다운로드**:
   - 다음 모델들을 다운로드하여 `public/models` 디렉터리에 넣습니다:
     - `tiny_face_detector_model`
     - `face_landmark_68_model`
     - `face_recognition_model`
     - `face_expression_model`
   - [face-api.js 모델 저장소](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)에서 모델들을 다운로드할 수 있습니다.

## 애플리케이션 실행

1. **개발 서버 시작**:
   ```bash
   npm start
   ```

2. 브라우저를 열고 `http://localhost:3000`에 접속합니다.

## 사용 방법

1. "시작" 버튼을 클릭하여 웹캠을 시작합니다.
2. 애플리케이션이 자동으로 얼굴, 랜드마크 및 표정을 실시간으로 인식하고 비디오 피드에 결과를 오버레이합니다.

## 코드 설명

### 필요한 라이브러리 가져오기

```javascript
import React, { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
```
- `React`: 메인 React 라이브러리
- `useEffect` 및 `useRef`: React 훅

### App 컴포넌트

```javascript
function App() {
  const videoRef = useRef(); // 비디오 요소를 참조하기 위한 useRef 훅
  const canvasRef = useRef(); // 캔버스 요소를 참조하기 위한 useRef 훅

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models"; // 모델이 위치한 URL 설정
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
    };
    loadModels(); // 모델 로드 함수 호출
  }, []);

  const startVideo = () => {
    navigator.getUserMedia(
      { video: {} },
      (stream) => (videoRef.current.srcObject = stream),
      (err) => console.error(err)
    );
  };

  const handleVideoPlay = () => {
    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    canvasRef.current.appendChild(canvas);

    const displaySize = {
      width: videoRef.current.width,
      height: videoRef.current.height,
    };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100);
  };

  return (
    <div>
      <video
        ref={videoRef}
        width="720"
        height="560"
        autoPlay
        muted
        onPlay={handleVideoPlay}
      />
      <div ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
      <button onClick={startVideo}>시작</button>
    </div>
  );
}

export default App;
```

### 주요 개념

1. **React 및 훅 (Hooks)**:
   - `useEffect`: 컴포넌트가 마운트될 때 또는 업데이트될 때 실행되는 부수효과를 처리합니다.
   - `useRef`: DOM 요소를 직접 참조하기 위해 사용되는 React 훅입니다.

2. **face-api.js**:
   - 얼굴 인식, 랜드마크 검출, 표정 인식을 위한 JavaScript 라이브러리입니다.
   - `loadFromUri`: 주어진 URL에서 모델을 로드합니다.
   - `detectAllFaces`: 비디오 또는 이미지에서 얼굴을 감지합니다.
   - `withFaceLandmarks`, `withFaceExpressions`: 얼굴 랜드마크 및 표정을 검출하는 메서드입니다.
   - `resizeResults`: 감지된 결과를 주어진 크기에 맞게 조정합니다.
   - `draw.drawDetections`, `draw.drawFaceLandmarks`, `draw.drawFaceExpressions`: 감지된 얼굴, 랜드마크, 표정을 캔버스에 그립니다.

3. **getUserMedia**:
   - 웹 브라우저에서 사용자의 카메라와 같은 미디어 장치에 접근할 수 있게 해주는 API입니다.
   - `navigator.getUserMedia`: 웹캠 스트림을 가져오는 메서드로, 성공 시 비디오 요소의 `srcObject`에 스트림을 설정합니다.
