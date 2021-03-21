import React from 'react';
import ReactDOM from 'react-dom';
import {
  RecordWebcam,
  useRecordWebcam,
  CAMERA_STATUS,
} from 'react-record-webcam';
import type { WebcamRenderProps, RecordWebcamHook } from 'react-record-webcam';
import './styles.css';

const App = () => {
  const recordWebcam: RecordWebcamHook = useRecordWebcam();

  const getRecordingFileHooks = async () => {
    const blob = await recordWebcam.getRecording();
    console.log({ blob });
  };

  const getRecordingFileRenderProp = async (blob: Blob | undefined) => {
    console.log({ blob });
  };

  return (
    <div>
      <div className="demo-section">
        <h1>Component demo</h1>
        <RecordWebcam />
      </div>
      <div className="demo-section">
        <RecordWebcam
          render={(props: WebcamRenderProps) => {
            return (
              <div>
                <h1>Component render prop demo</h1>
                <p>Camera status: {props.status}</p>
                <div>
                  <button
                    disabled={props.isWebcamOn || props.isPreview}
                    onClick={props.openCamera}
                  >
                    Open camera
                  </button>
                  <button
                    disabled={!props.isWebcamOn || props.isPreview}
                    onClick={props.closeCamera}
                  >
                    Close camera
                  </button>

                  <button
                    disabled={
                      !props.isWebcamOn || props.isRecording || props.isPreview
                    }
                    onClick={props.start}
                  >
                    Start recording
                  </button>
                  <button disabled={!props.isRecording} onClick={props.stop}>
                    Stop recording
                  </button>
                  <button disabled={!props.isPreview} onClick={props.retake}>
                    Retake
                  </button>
                  <button disabled={!props.isPreview} onClick={props.download}>
                    Download
                  </button>
                  <button
                    onClick={async () => {
                      const blob = await props.getRecording();
                      getRecordingFileRenderProp(blob);
                    }}
                  >
                    Get recording blob
                  </button>
                </div>
              </div>
            );
          }}
        />
      </div>
      <div className="demo-section">
        <h1>Hooks demo</h1>
        <p>Camera status: {recordWebcam.status}</p>
        <div>
          <button
            disabled={
              recordWebcam.status === CAMERA_STATUS.OPEN ||
              recordWebcam.status === CAMERA_STATUS.RECORDING ||
              recordWebcam.status === CAMERA_STATUS.PREVIEW
            }
            onClick={recordWebcam.open}
          >
            Open camera
          </button>
          <button
            disabled={
              recordWebcam.status === CAMERA_STATUS.CLOSED ||
              recordWebcam.status === CAMERA_STATUS.PREVIEW
            }
            onClick={recordWebcam.close}
          >
            Close camera
          </button>
          <button
            disabled={
              recordWebcam.status === CAMERA_STATUS.CLOSED ||
              recordWebcam.status === CAMERA_STATUS.RECORDING ||
              recordWebcam.status === CAMERA_STATUS.PREVIEW
            }
            onClick={recordWebcam.start}
          >
            Start recording
          </button>
          <button
            disabled={recordWebcam.status !== CAMERA_STATUS.RECORDING}
            onClick={recordWebcam.stop}
          >
            Stop recording
          </button>
          <button
            disabled={recordWebcam.status !== CAMERA_STATUS.PREVIEW}
            onClick={recordWebcam.retake}
          >
            Retake
          </button>
          <button
            disabled={recordWebcam.status !== CAMERA_STATUS.PREVIEW}
            onClick={recordWebcam.download}
          >
            Download
          </button>
          <button onClick={getRecordingFileHooks}>Get recording</button>
        </div>

        <video
          ref={recordWebcam.webcamRef}
          style={{
            display: `${
              recordWebcam.status === CAMERA_STATUS.OPEN ||
              recordWebcam.status === CAMERA_STATUS.RECORDING
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
              recordWebcam.status === CAMERA_STATUS.PREVIEW ? 'block' : 'none'
            }`,
          }}
          autoPlay
          muted
          loop
        />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
