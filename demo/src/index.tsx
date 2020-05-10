import React from 'react';
import ReactDOM from 'react-dom';
import Webcam from 'react-record-webcam';
import './styles.css';

const App = () => {
  const handleStatus = (status: string) => {
    console.log({ status });
  };

  return (
    <div className="webcam__wrapper">
      <Webcam
        getStatus={handleStatus}
        statusMessages={{
          INIT: 'Starting camera ... ⚡️',
          CLOSED: 'Camera is closed ❌',
          OPEN: 'Camera is open 🎥',
          RECORDING: 'Recording ... ⏺',
          PREVIEW: 'Preview ▶️',
          ERROR: 'Something went wrong :(',
        }}
        render={(props) => {
          return (
            <div className="webcam__render-wrapper">
              <h1 className="webcam__render-status">{props.status}</h1>
              <div className="webcam__render-action-wrapper">
                <button
                  className="webcam__render-action-button"
                  disabled={props.isWebcamOn || props.isPreview}
                  onClick={props.openCamera}
                >
                  Open camera
                </button>
                <button
                  className="webcam__render-action-button"
                  disabled={!props.isPreview}
                  onClick={props.retake}
                >
                  Retake
                </button>
                <button
                  className="webcam__render-action-button"
                  disabled={
                    !props.isWebcamOn || props.isRecording || props.isPreview
                  }
                  onClick={props.start}
                >
                  Start recording
                </button>
                <button
                  className="webcam__render-action-button"
                  disabled={!props.isRecording}
                  onClick={props.stop}
                >
                  Stop recording
                </button>
                <button
                  className="webcam__render-action-button"
                  disabled={!props.isPreview}
                  onClick={props.download}
                >
                  Download
                </button>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
