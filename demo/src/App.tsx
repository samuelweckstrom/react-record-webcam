import React from 'react';
import { useRecordWebcam } from 'react-record-webcam';
import './styles.css';

export function App() {
  const {
    activeRecordings,
    cancelRecording,
    clearPreview,
    closeCamera,
    createRecording,
    devicesByType,
    devicesById,
    download,
    muteRecording,
    openCamera,
    pauseRecording,
    resumeRecording,
    startRecording,
    stopRecording,
  } = useRecordWebcam();

  const [videoDeviceId, setVideoDeviceId] = React.useState<string>('');
  const [audioDeviceId, setAudioDeviceId] = React.useState<string>('');

  const handleSelect = async (event: any) => {
    const { deviceid: deviceId } =
      event.target.options[event.target.selectedIndex].dataset;
    if (devicesById[deviceId].type === 'videoinput') {
      setVideoDeviceId(deviceId);
    }
    if (devicesById[deviceId].type === 'audioinput') {
      setAudioDeviceId(deviceId);
    }
  };

  const quickDemo = async () => {
    try {
      const recording = await createRecording();
      if (!recording) return;
      await openCamera(recording.id);
      await startRecording(recording.id);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await stopRecording(recording.id);
      await closeCamera(recording.id);
    } catch (error) {
      console.log({ error });
    }
  };

  const start = async () => {
    const recording = await createRecording(videoDeviceId, audioDeviceId);
    if (recording) await openCamera(recording.id);
  };

  return (
    <div>
      <div className="input">
        <div>
          <h4>Select video input</h4>
          <select className="input-select" onChange={handleSelect}>
            {devicesByType?.video?.map((device) => (
              <option key={device.deviceId} data-deviceid={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h4>Select audio input</h4>
          <select className="input-select" onChange={handleSelect}>
            {devicesByType?.audio?.map((device) => (
              <option key={device.deviceId} data-deviceid={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="input-start">
        <button onClick={quickDemo}>Record 3s video</button>
        <button onClick={start}>Open camera</button>
      </div>
      <div className="devices">
        {activeRecordings?.map((recording: Recording) => (
          <div className="device" key={recording.id}>
            <p>Live</p>
            <div className="device-list">
              <small>Status: {recording.status}</small>
              <small>Video: {recording.videoLabel}</small>
              <small>Audio: {recording.audioLabel}</small>
            </div>
            <video ref={recording.webcamRef} loop autoPlay playsInline />
            <div className="controls">
              <button
                disabled={
                  recording.status === 'RECORDING' ||
                  recording.status === 'PAUSED'
                }
                onClick={() => startRecording(recording.id)}
              >
                Record
              </button>
              <button
                disabled={
                  recording.status !== 'RECORDING' &&
                  recording.status !== 'PAUSED'
                }
                onClick={() =>
                  recording.status === 'PAUSED'
                    ? resumeRecording(recording.id)
                    : pauseRecording(recording.id)
                }
              >
                {recording.status === 'PAUSED' ? 'Resume' : 'Pause'}
              </button>
              <button
                className={recording.isMuted ? 'selected' : ''}
                onClick={() => muteRecording(recording.id)}
              >
                Mute
              </button>
              <button
                disabled={recording.status !== 'RECORDING'}
                onClick={() => stopRecording(recording.id)}
              >
                Stop
              </button>
              <button onClick={() => cancelRecording(recording.id)}>
                Cancel
              </button>
            </div>
            <div className="preview">
              <p>Preview</p>
              <video ref={recording.previewRef} autoPlay loop playsInline />
              <div className="controls">
                <button onClick={() => download(recording.id)}>Download</button>
                <button onClick={() => clearPreview(recording.id)}>
                  Clear preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
