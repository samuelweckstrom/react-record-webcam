import React from 'react';
import ReactDOM from 'react-dom';
import { RecordWebcam, useRecordWebcam } from 'react-record-webcam';
import './styles.css';

const OPTIONS = {
  fileName: 'test-filename',
  fileType: 'mp4',
  width: 1920,
  height: 1080,
} as const;

function App() {
  const recordWebcam = useRecordWebcam(OPTIONS);

  const getRecordingFile = async () => {
    const blob = recordWebcam.getRecording();
    console.log({ blob });
  };

  const getBlob = async (blob: Blob | null) => {
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
      <div className="demo-section">
        <RecordWebcam
          options={OPTIONS}
          render={(renderProps) => (
            <div>
              <h1>Component render prop demo</h1>
              <p>Camera status: {renderProps.status}</p>
              <div>
                <button
                  disabled={
                    renderProps.status === 'OPEN' ||
                    renderProps.status === 'RECORDING' ||
                    renderProps.status === 'PREVIEW'
                  }
                  onClick={renderProps.openCamera}
                >
                  Open camera
                </button>
                <button
                  disabled={renderProps.status === 'CLOSED'}
                  onClick={renderProps.closeCamera}
                >
                  Close camera
                </button>

                <button
                  disabled={
                    renderProps.status === 'CLOSED' ||
                    renderProps.status === 'RECORDING' ||
                    renderProps.status === 'PREVIEW'
                  }
                  onClick={renderProps.start}
                >
                  Start recording
                </button>
                <button
                  disabled={renderProps.status !== 'RECORDING'}
                  onClick={renderProps.stop}
                >
                  Stop recording
                </button>
                <button
                  disabled={renderProps.status !== 'PREVIEW'}
                  onClick={renderProps.retake}
                >
                  Retake
                </button>
                <button
                  disabled={renderProps.status !== 'PREVIEW'}
                  onClick={renderProps.download}
                >
                  Download
                </button>
                <button
                  disabled={renderProps.status !== 'PREVIEW'}
                  onClick={async () => {
                    const blob = await renderProps.getRecording();
                    getBlob(blob);
                  }}
                >
                  Get blob
                </button>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
