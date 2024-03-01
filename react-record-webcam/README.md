<div align="center">
  <img alt="React Record Webcam Logo" style="width: 90%;" src="https://samuelweckstrom-github.s3.eu-central-1.amazonaws.com/react-record-webcam.svg">
</div>

<br>

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![Tests](https://github.com/samuelweckstrom/react-record-webcam/actions/workflows/tests.yaml/badge.svg)](https://github.com/samuelweckstrom/react-record-webcam/actions/workflows/tests.yaml)
[![npm version](https://badge.fury.io/js/react-record-webcam.svg)](https://www.npmjs.com/package/react-record-webcam)

Promise based zero dependency webcam library for React. Select video and audio input for one or multiple concurrent recordings using any mix of video and audio source.

[DEMO](https://codesandbox.io/p/sandbox/festive-mccarthy-zhkh83)

Note version 1.0 is a complete rewrite so you will need to make some changes if updating.

<br>

## Add package

```
npm i react-record-webcam
```


<br>

## Usage

```javascript
// record a 3s. video

import { useRecordWebcam } from 'react-record-webcam'

...

  const {
    activeRecordings,
    createRecording,
    openCamera,
    startRecording,
    stopRecording,
  } = useRecordWebcam()

  const example = async () => {
    try {
      const recording = await createRecording();
      if (!recording) return;
      await openCamera(recording.id);
      await startRecording(recording.id);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await stopRecording(recording.id);
    } catch (error) {
      console.error({ error });
    }
  };

  return (
    <div>
      <button onClick={example}>Start</button>
      {activeRecordings.map(recording => (
        <div key={recording.id}>
          <video ref={recording.webcamRef} autoPlay muted />
          <video ref={recording.previewRef} autoPlay muted loop />
        </div>
      ))}
    </div>
  )

...

```

Check the CodeSandbox links for [above demo](https://codesandbox.io/p/sandbox/lingering-haze-sm6jxw) and one with more [features](https://codesandbox.io/p/sandbox/festive-mccarthy-zhkh83).

<br>

## Passing options

Pass options either when initializing the hook or at any point in your application logic using `applyOptions`.

```typescript
const options = { ... }
const mediaRecorderOptions = { ... }
const mediaTrackConstraints =  { ... }

const { ... } = useRecordWebcam({ 
  options, 
  mediaRecorderOptions, 
  mediaTrackConstraints
})

// or

const { applyOptions } = useRecordWebcam() // use utility
applyOptions(recording.id: string, options: Options) // add to your application logic


```
| Option | property | default value|
| ------------- | ------------- | ------------- |
|`fileName`|  |`Date.now()`|
|`fileType`| File type for download (will override inferred type from `mimeType`)  |`'webm'`|
|`timeSlice`| Recording interval | `undefined`|

<br>

Both `mediaRecorderOptions` and `mediatrackConstraints` mirror the official API. Please see on MDN for available options:

[MDN: mediaRecorderOptions](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder#options)

[MDN: mediatrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#instance_properties)


### Codec Support

The default codec is set to `video/webm;codecs=vp9`. If you prefer to use another one, you can check the compatibility for playback and recording with the following utilities:

```typescript
const { checkCodecRecordingSupport, checkVideoCodecPlaybackSupport } = useRecordWebcam()

...
const codec = 'video/x-matroska;codecs=avc1'
const isRecordingSupported = checkCodecRecordingSupport(codec)
const isPlayBackSupported = checkVideoCodecPlaybackSupport(codec)
...
```

To use a specific codec, pass this in the mediaRecorderOptions:

```typescript
const codec = 'video/webm;codecs=h264'
const mediaRecorderOptions = { mimetype: codec }
const recordWebcam = useRecordWebcam({ mediaRecorderOptions })
```


For more info see the codec guide on [MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Video_codecs).

## Error handling

Current error message is passed from the hook, along with a object of error states which you can use for checks. 

```typescript
import { useRecordWebcam, ERROR_MESSAGES } from 'react-record-webcam'

const { errorMessage } = useRecordWebcam()

...
const isUserPermissionDenied = errorMessage === ERROR_MESSAGES.NO_USER_PERMISSION;
...
```


<br>

## Full API

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
