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
const options = { fileName: string, fileType: string, mimeType: string }
const { ... } = useRecordWebcam(options)

// or

const { applyOptions } = useRecordWebcam() // import utility
applyOptions(recording.id: string, options) // add to your application logic


```
| Option | default value|
| ------------- | ------------- |
|`fileName`| `timestamp`|
|`fileType`| `webm`|
|`mimeType`| `video/webm;codecs=vp9`|

If you want to use a specific video/audio codec you can pass this in the `mimeType`. For example:

`'video/webm;codecs=vp9'`<br>`'video/webm;codecs=vp8'`<br>`'video/webm;codecs=h264'`<br>`'video/x-matroska;codecs=avc1'`

Please [check](https://caniuse.com/?search=video%20format) that the browser supports the selected codec.

<br>

## Passing recorder options

Pass recorder options when initializing the hook.

```typescript
const recorderOptions: { audioBitsPerSecond: number, videoBitsPerSecond: number }
const { ... } = useRecordWebcam(recorderOptions)
```
Link to MDN for [supported MediaOptions](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder).

<br>

## Passing recording constraints

```typescript
const constraints: { aspectRatio: number, height: number, width: number }
const { ... } = useRecordWebcam(constraints)

// or

const { applyConstraints } = useRecordWebcam() // import utility
applyConstraints(recording.id: string, constraints) // add to your application logic

```
Link to MDN for [supported MediaConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#instance_properties).

<br>

## Full API

| Method                                                                                                            | Description                                                                           |
|-------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| `activeRecordings`                                                                            | Array of currently active recordings.                                        |
| `applyConstraints(recordingId, constraints): Promise<Recording>`            | Apply constraints to a recording session. See [passing recording constraints](#passing-recording-constraints).                                    |
| `applyRecordingOptions(recordingId, options) Promise<Recording>`                                                                             |Apply options to a recording. See [passing options](#passing-options). |
| `cancelRecording(recordingId): Promise<void>`                                                             | Cancels and deletes a specified recording session.                                     |
| `clearAllRecordings()`                                                                                      | Clears all the active recordings and resets them.                                      |
| `clearPreview(recordingId): Promise<Recording>`                                                   | Clears the preview of a specific recording.                                            |
| `closeCamera(recordingId): Promise<Recording>`                                                    | Closes the camera of a specified recording session.                                    |
| `createRecording(videoId?, audioId?): Promise<Recording>`                                  | Creates a new recording session with specified video and audio IDs. If none are give the system defaults are used.                    |
| `devicesById`                                                                                           | Available input devices by their device ID.                                            |
| `devicesByType`                                                                                         | Available input devices based on their type (audio, video).             |
| `download(recordingId): Promise<void>`                                                                    | Downloads the specified recording as a file.                                           |
| `errorMessage`                                                                                          | Returns the last error message, if any, from the hook's operations.                    |
| `muteRecording(recordingId): Promise<Recording>`                                                  | Toggles mute on or off for a specified recording session.                              |
| `openCamera(recordingId): Promise<Recording>`                                                      | Opens the camera for a specified recording session, preparing it for recording.        |
| `pauseRecording(recordingId): Promise<Recording>`                                                 | Pauses an ongoing recording session.                                                   |
| `resumeRecording(recordingId): Promise<Recording>`                                                | Resumes a paused recording session.                                                    |
| `startRecording(recordingId): Promise<Recording>`                                                 | Starts a new recording for the specified session.                                      |
| `stopRecording(recordingId): Promise<Recording>`                                                  | Stops an ongoing recording session and finalizes the recording.                        |


## License

[MIT](LICENSE)


## Credits

webcam by iconfield from <a href="https://thenounproject.com/browse/icons/term/webcam/" target="_blank" title="webcam Icons">Noun Project</a> (CC BY 3.0)
