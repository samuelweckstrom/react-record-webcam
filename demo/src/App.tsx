import React from 'react';
import { RecordWebcam, useRecordWebcam } from 'react-record-webcam';
import './styles.css';

const OPTIONS = {
  fileName: 'test-filename',
  mimeType: 'video/x-matroska;codecs=avc1',
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
        <h1>Hooks demo</h1>
        <p>Camera status: {recordWebcam.status}</p>
        <div>
          <button
            disabled={
              recordWebcam.status === 'OPEN' ||
              recordWebcam.status === 'RECORDING' ||
              recordWebcam.status === 'PREVIEW'
            }
            onClick={recordWebcam.open}
          >
            Open camera
          </button>
          <button
            disabled={recordWebcam.status === 'CLOSED'}
            onClick={recordWebcam.close}
          >
            Close camera
          </button>
          <button
            disabled={
              recordWebcam.status === 'CLOSED' ||
              recordWebcam.status === 'RECORDING' ||
              recordWebcam.status === 'PREVIEW'
            }
            onClick={recordWebcam.start}
          >
            Start recording
          </button>
          <button
            disabled={recordWebcam.status !== 'RECORDING'}
            onClick={recordWebcam.stop}
          >
            Stop recording
          </button>
          <button
            disabled={recordWebcam.status !== 'PREVIEW'}
            onClick={recordWebcam.retake}
          >
            Retake
          </button>
          <button
            disabled={recordWebcam.status !== 'PREVIEW'}
            onClick={recordWebcam.download}
          >
            Download
          </button>
          <button
            disabled={recordWebcam.status !== 'PREVIEW'}
            onClick={getRecordingFile}
          >
            Get recording
          </button>
        </div>
        <video
          ref={recordWebcam.webcamRef}
          style={{
            display: `${
              recordWebcam.status === 'OPEN' ||
              recordWebcam.status === 'RECORDING'
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
            display: `${recordWebcam.status === 'PREVIEW' ? 'block' : 'none'}`,
          }}
          autoPlay
          muted
          loop
        />
      </div>
      <div className="demo-section">
        <h1>Component demo</h1>
        <RecordWebcam options={OPTIONS} />
      </div>
    </div>
  );
}
