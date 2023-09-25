import React from 'react';
import { useRecordWebcam } from 'react-record-webcam';
import './styles.css';

const OPTIONS = {
  fileName: 'test-filename',
  width: 1920,
  height: 1080,
  disableLogs: true,
} as const;

export function App() {
  const recordWebcam = useRecordWebcam(OPTIONS);

  const getRecordingFile = async () => {
    const blob = await recordWebcam.getRecording();
    console.log({ blob });
  };

  return (
    <div>
      <div className="demo-section">
        <h1>Demo</h1>
        <p>Camera webcamStatus: {recordWebcam.webcamStatus}</p>
        <div>
          <button
            disabled={
              recordWebcam.webcamStatus === 'OPEN' ||
              recordWebcam.webcamStatus === 'RECORDING' ||
              recordWebcam.webcamStatus === 'PREVIEW'
            }
            onClick={recordWebcam.open}
          >
            Open camera
          </button>
          <button
            disabled={recordWebcam.webcamStatus === 'CLOSED'}
            onClick={recordWebcam.close}
          >
            Close camera
          </button>
          <button
            disabled={
              recordWebcam.webcamStatus === 'CLOSED' ||
              recordWebcam.webcamStatus === 'RECORDING' ||
              recordWebcam.webcamStatus === 'PREVIEW'
            }
            onClick={recordWebcam.start}
          >
            Start recording
          </button>
          <button
            disabled={recordWebcam.webcamStatus !== 'RECORDING'}
            onClick={recordWebcam.stop}
          >
            Stop recording
          </button>
          <button
            disabled={recordWebcam.webcamStatus !== 'PREVIEW'}
            onClick={recordWebcam.retake}
          >
            Retake
          </button>
          <button
            disabled={recordWebcam.webcamStatus !== 'PREVIEW'}
            onClick={recordWebcam.download}
          >
            Download
          </button>
          <button
            disabled={recordWebcam.webcamStatus !== 'PREVIEW'}
            onClick={getRecordingFile}
          >
            Get recording
          </button>
        </div>
        <video
          ref={recordWebcam.webcamRef}
          style={{
            display: `${
              recordWebcam.webcamStatus === 'OPEN' ||
              recordWebcam.webcamStatus === 'RECORDING'
                ? 'block'
                : 'none'
            }`,
          }}
          autoPlay
          muted
        />
        <video
          ref={recordWebcam.previewRef}
          style={{
            display: `${
              recordWebcam.webcamStatus === 'PREVIEW' ? 'block' : 'none'
            }`,
          }}
          autoPlay
          muted
          loop
        />
      </div>
    </div>
  );
}
