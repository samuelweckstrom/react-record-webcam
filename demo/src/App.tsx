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
        <button onClick={recordWebcam.muteAudio}>
          {recordWebcam.isMuted ? 'Unmute' : 'Mute'}
        </button>
        <p>Camera webcamStatus: {recordWebcam.webcamStatus}</p>
        <div>
          <button
            disabled={
              recordWebcam.webcamStatus === 'OPEN' ||
              recordWebcam.webcamStatus === 'RECORDING' ||
              recordWebcam.webcamStatus === 'RECORDED'
            }
            onClick={recordWebcam.open}
          >
            Open camera
          </button>
          {!(
            recordWebcam.webcamStatus === 'NO_CAMERA' ||
            recordWebcam.webcamStatus === 'ERROR' ||
            recordWebcam.webcamStatus === 'CLOSED'
          ) && (
            <>
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
                  recordWebcam.webcamStatus === 'RECORDED'
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
              {recordWebcam.webcamStatus === 'RECORDED' && (
                <>
                  <button onClick={recordWebcam.retake}>Retake</button>
                  <button onClick={recordWebcam.download}>Download</button>
                  <button onClick={getRecordingFile}>Get recording</button>
                </>
              )}
            </>
          )}
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
              recordWebcam.webcamStatus === 'RECORDED' ? 'block' : 'none'
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
