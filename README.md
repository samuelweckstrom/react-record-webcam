<div align="center">
  <img alt="React Record Webcam Logo" style="width: 90%;" src="https://samuelweckstrom-github.s3.eu-central-1.amazonaws.com/react-record-webcam.svg">
</div>

<br>

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![Tests](https://github.com/samuelweckstrom/react-record-webcam/actions/workflows/ci-cd.yaml/badge.svg)](https://github.com/samuelweckstrom/react-record-webcam/actions/workflows/ci-cd.yaml)
[![npm version](https://badge.fury.io/js/react-record-webcam.svg)](https://www.npmjs.com/package/react-record-webcam)

React Record Webcam is a promise-based, zero-dependency webcam library for React, enabling the selection of video and audio inputs for single or multiple concurrent recordings with any mix of video and audio sources.

[Demo](https://samuel.weckstrom.xyz/react-record-webcam/)

[Try the example on StackBlitz](https://stackblitz.com/~/github.com/samuelweckstrom/react-record-webcam)

<br>

## Add package

```bash
npm i react-record-webcam
```

<br>

## Quick Start

To start recording, create a recording instance using `createRecording` and manage the recording process with the hook's methods:

```typescript
import { useRecordWebcam } from 'react-record-webcam'

const App = () => {
  const { createRecording, openCamera, startRecording, stopRecording, downloadRecording } = useRecordWebcam()

  const recordVideo = async () => {
    const recording = await createRecording();
    await openCamera(recording.id);
    await startRecording(recording.id);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Record for 3 seconds
    await stopRecording(recording.id);
    await downloadRecording(recording.id); // Download the recording
  };

  return <button onClick={recordVideo}>Record Video</button>;
};
```

<br>

## Usage and Examples

Each method in the hook always returns an updated instance of a recording. Pass the `id` of the recording instance to any of the methods from the hook to open camera, start, pause or stop a recording:

Heres an example of uploading the recorded blob to a back-end service:

```typescript
const { createRecording, openCamera, startRecording, stopRecording } = useRecordWebcam()


async function record() {
    const recording = await createRecording();

    await openCamera(recording.id);
    await startRecording(recording.id);
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Record for 3 seconds
    const recorded = await stopRecording(recording.id);

    // Upload the blob to a back-end
    const formData = new FormData();
    formData.append('file', recorded.blob, 'recorded.webm');

    const response = await fetch('https://your-backend-url.com/upload', {
        method: 'POST',
        body: formData,
    });
};
```

All recording instances are available in `activeRecordings`. You can for example access refs for webcam feed and recording preview in your component:

```typescript
const { activeRecordings } = useRecordWebcam()

...

  {activeRecordings.map(recording => (
    <div key={recording.id}>
      <video ref={recording.webcamRef} autoPlay />
      <video ref={recording.previewRef} autoPlay loop />
    </div>
  ))}
```

### Recording instance

| Property | Type | Description |
| --- | --- | --- |
| `id` | `string` | The ID of the recording. |
| `audioId` | `string` | The ID of the audio device. |
| `audioLabel` | `string` | The label of the audio device. |
| `blob` | `Blob` | The blob of the recording. |
| `blobChunks` | `Blob[]` | Single blob or chunks per timeslice of the recording. |
| `fileName` | `string` | The name of the file. |
| `fileType` | `string` | The type of the file. |
| `isMuted` | `boolean` | Whether the recording is muted. |
| `mimeType` | `string` | The MIME type of the recording. |
| `objectURL` | `string` \| `null` | The object URL of the recording. |
| `previewRef` | `React.RefObject<HTMLVideoElement>` | React Ref for the preview element. |
| `recorder` | `MediaRecorder` | The [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) instance of the recording. |
| `status` | `'INITIAL'` \| `'CLOSED'` \| `'OPEN'` \| `'RECORDING'` \| `'STOPPED'` \| `'ERROR'` \| `'PAUSED'` | The status of the recording. |
| `videoId` | `string` | The ID of the video device. |
| `videoLabel` | `string` | The label of the video device. |
| `webcamRef` | `React.RefObject<HTMLVideoElement>` | React Ref for the webcam element. |

<br>

## Configuring options

Pass options either when initializing the hook or at any point in your application logic using `applyOptions`.

```typescript
// At initialization
const { applyOptions, applyConstraints } = useRecordWebcam({
  options: { fileName: 'custom-name', fileType: 'webm', timeSlice: 1000 },
  mediaRecorderOptions: { mimeType: 'video/webm; codecs=vp8' },
  mediaTrackConstraints: { video: true, audio: true }
});

// Dynamically applying options
applyOptions(recording.id, { fileName: 'updated-name' }); // Update file name
applyConstraints(recording.id, { aspectRatio: 0.56 }) // Change aspect ratio to portrait
```

### List of options

| Option | property | default value|
| ------------- | ------------- | ------------- |
|`fileName`| File name |`Date.now()`|
|`fileType`| File type for download (will override inferred type from `mimeType`)  |`'webm'`|
|`timeSlice`| Recording interval | `undefined`|

<br>

Both `mediaRecorderOptions` and `mediatrackConstraints` mirror the official API. Please see on MDN for available options:

[MDN: mediaRecorderOptions](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder#options)

[MDN: mediatrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#instance_properties)

<br>

## Codec Support

A codec supported by the current browser will be detected and used for recordings.

To see all video and audio codecs supported by the browser:

```typescript
const { supportedAudioCodecs, supportedVideoCodecs } = useRecordWebcam();

console.log({ supportedAudioCodecs, supportedVideoCodecs })
```

To check the support of a specific codec:

```typescript
const { checkCodecRecordingSupport, checkVideoCodecPlaybackSupport } = useRecordWebcam()

const codec = 'video/x-matroska;codecs=avc1'
const isRecordingSupported = checkCodecRecordingSupport(codec)
const isPlayBackSupported = checkVideoCodecPlaybackSupport(codec)
```

To use a specific codec, pass this in the mediaRecorderOptions. Note that MediaRecorder uses a mimeType format for the codec: `<container>;codec=<videoCodec>,<audioCodec>`

```typescript
const codec = 'video/webm;codecs=h264'
const mediaRecorderOptions = { mimetype: codec }
const recordWebcam = useRecordWebcam({ mediaRecorderOptions })
```

For more info see the codec guide on [MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs).

<br>

## Error handling

Error messages are available in the hook. You can import the constant of all messages for error handling from the package.

```typescript
import { useRecordWebcam, ERROR_MESSAGES } from 'react-record-webcam';

const { errorMessage } = useRecordWebcam();

if (errorMessage === ERROR_MESSAGES.NO_USER_PERMISSION) {
  // Handle specific error scenario
}
```

<br>

## API Reference

| Method/Property              | Arguments                                                     | Returns                                      | Description                                                                                                       |
|------------------------------|---------------------------------------------------------------|----------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| `activeRecordings`           |                                                               | `Recording[]`                                | Array of active recordings.                                                                                       |
| `applyConstraints`           | `recordingId: string, constraints: MediaTrackConstraints`     | `Promise<Recording \| void>`                 | Applies given constraints to the camera for a specific recording.                                                 |
| `applyRecordingOptions`      | `recordingId: string`                                          | `Promise<Recording \| void>`                 | Applies recording options to a specific recording.                                                                 |
| `cancelRecording`            | `recordingId: string`                                          | `Promise<void>`                              | Cancels the current recording session.                                                                            |
| `clearAllRecordings`         |                                                               | `Promise<void>`                              | Clears all active recordings.                                                                                     |
| `clearError`                 |                                                               | `void`                                       | Function to clear the current error message.                                                                      |
| `clearPreview`               | `recordingId: string`                                          | `Promise<Recording \| void>`                 | Clears the preview of a specific recording.                                                                       |
| `closeCamera`                | `recordingId: string`                                          | `Promise<Recording \| void>`                 | Closes the camera for a specific recording.                                                                       |
| `createRecording`            | `videoId?: string, audioId?: string`                          | `Promise<Recording \| void>`                 | Creates a new recording session with specified video and audio sources.                                           |
| `devicesById`                |                                                               | `ById`                                       | Object containing devices by their ID, where `ById` is a record of `string` to `{ label: string; type: 'videoinput' \| 'audioinput'; }`. |
| `devicesByType`              |                                                               | `ByType`                                     | Object categorizing devices by their type, where `ByType` has `video` and `audio` arrays of `{ label: string; deviceId: string; }`.     |
| `download`                   | `recordingId: string`                                          | `Promise<void>`                              | Downloads a specific recording.                                                                                  |
| `errorMessage`               |                                                               | `string \| null`                             | The current error message, if any, related to recording.                                                          |
| `muteRecording`              | `recordingId: string`                                          | `Promise<Recording \| void>`                 | Mutes or unmutes the recording audio.                                                                             |
| `openCamera`                 | `recordingId: string`                                          | `Promise<Recording \| void>`                 | Opens the camera for a specific recording with optional constraints.                                              |
| `pauseRecording`             | `recordingId: string`                                          | `Promise<Recording \| void>`                 | Pauses the current recording.                                                                                     |
| `resumeRecording`            | `recordingId: string`                                          | `Promise<Recording \| void>`                 | Resumes a paused recording.                                                                                       |
| `startRecording`             | `recordingId: string`                                          | `Promise<Recording \| void>`                 | Starts a new recording session.                                                                                   |
| `stopRecording`              | `recordingId: string`                                          | `Promise<Recording \| void>`                 | Stops the current recording session.                                                                              |
|

## License

[MIT](LICENSE)

## Credits

webcam by iconfield from <a href="https://thenounproject.com/browse/icons/term/webcam/" target="_blank" title="webcam Icons">Noun Project</a> (CC BY 3.0)
