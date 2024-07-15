// React와 useEffect, useRef 훅을 import
import React, { useEffect, useRef } from "react";
// face-api.js 라이브러리 전체를 import
import * as faceapi from "face-api.js";

// App 컴포넌트 정의
function App() {
  // 비디오 요소를 참조하기 위한 useRef 훅 사용
  const videoRef = useRef();
  // 캔버스 요소를 참조하기 위한 useRef 훅 사용
  const canvasRef = useRef();

  // 컴포넌트가 마운트될 때 실행되는 useEffect 훅
  useEffect(() => {
    // 모델을 로드하는 비동기 함수 정의
    const loadModels = async () => {
      // 모델이 위치한 URL 설정
      const MODEL_URL = "/models";
      // face-api.js의 여러 모델들을 비동기로 로드
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
    };
    // 모델 로드 함수 호출
    loadModels();
  }, []);

  // 비디오 스트림을 시작하는 함수 정의
  const startVideo = () => {
    // 사용자의 웹캠 스트림을 가져오는 함수 호출
    navigator.getUserMedia(
      { video: {} }, // 비디오 옵션 설정
      (stream) => (videoRef.current.srcObject = stream), // 성공 시 스트림을 비디오 요소에 설정
      (err) => console.error(err) // 오류 발생 시 로그 출력
    );
  };

  // 비디오 재생이 시작될 때 호출되는 함수 정의
  const handleVideoPlay = () => {
    // 비디오 요소로부터 캔버스 생성
    const canvas = faceapi.createCanvasFromMedia(videoRef.current);
    // 캔버스를 캔버스 참조 요소에 추가
    canvasRef.current.appendChild(canvas);

    // 비디오 요소의 크기를 가져와서 저장
    const displaySize = {
      width: videoRef.current.width,
      height: videoRef.current.height,
    };
    // 캔버스의 크기를 비디오 요소의 크기와 일치시키기
    faceapi.matchDimensions(canvas, displaySize);

    // 주기적으로 얼굴을 감지하는 인터벌 설정
    setInterval(async () => {
      // 비디오에서 얼굴, 랜드마크, 감정을 감지
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      // 감지된 결과를 비디오 크기에 맞게 조정
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      // 캔버스를 지우고 감지 결과를 다시 그리기
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100); // 100밀리초마다 반복
  };

  // JSX 반환
  return (
    <div>
      {/* 비디오 요소 설정 */}
      <video
        ref={videoRef} // 비디오 요소를 참조하기 위한 ref 설정
        width="720" // 비디오의 너비 설정
        height="560" // 비디오의 높이 설정
        autoPlay // 비디오 자동 재생
        muted // 비디오 음소거
        onPlay={handleVideoPlay} // 비디오 재생 시 handleVideoPlay 함수 호출
      />
      {/* 캔버스 요소 설정 */}
      <div ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
      {/* 비디오 시작 버튼 */}
      <button onClick={startVideo}>시작</button>
    </div>
  );
}

// App 컴포넌트를 기본 내보내기
export default App;
