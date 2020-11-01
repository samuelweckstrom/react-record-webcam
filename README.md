<div align="center">
  <img style="width: 90%;"src="https://s3.eu-central-1.amazonaws.com/samuel.weckstrom.xyz/github/react-record-webcam-logo.jpg">
</div>

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

Webcam video and audio recording hook and component for React. Use hook for newer React versions, component uses classes so all React versions are supported. Works in all latest browser versions, although Safari requires MediaRecorder to be enabled in the experimental features.

[Demo](https://codesandbox.io/s/react-record-webcam-demo-zog8c)

<br>

## Install dependency
```
yarn add react-record-webcam
```
<br>

## Hook

```
import { useRecordWebcam } from 'react-record-webcam'

function RecordVideo(props) {
  const recordWebcam = useRecordWebcam();
  return (
    <div>
      <p>Camera status: {recordWebcam.status}</p>
      <button onClick={recordWebcam.open}>Open camera</button>
      <button onClick={recordWebcam.start}>Start recording</button>
      <button onClick={recordWebcam.stop}>Stop recording</button>
      <button onClick={recordWebcam.retake}>Retake recording</button>
      <button onClick={recordWebcam.download}>Download recording</button>
      <video ref={recordWebcam.webcamRef} autoPlay muted />
      <video ref={recordWebcam.previewRef} autoPlay muted loop />
    </div>
  )
}
```
Import the hook and initialize it in your function. The hook returns refs for both preview and recording video elements, functions to control recording (open, start, stop, retake, download) and camera status.

```
import { useRecordWebcam, CAMERA_STATUS } from 'react-record-webcam'
```

You can also import the `CAMERA_STATUS` constant to check for different states and toggle your UI accordingly. Check the CodeSandbox [demo](https://codesandbox.io/s/react-record-webcam-demo-zog8c?file=/src/App.tsx) for a more thorough example on how to do this.

Passing options:
```
const OPTIONS = { ... }

const recordWebcam = useRecordWebcam(OPTIONS);
```


| Option  ||
| ------------- | ------------- |
|`downloadFileName?: string`      |Set a namespace for the component CSS classes|
|`recordingLength?: number`       |Length of recording in seconds|
|`recordingLength: number`        |Set max recording length in seconds  |
|`namespace: string`              |Pass own CSS namespace|
|`options: RecorderOptions`       |Options for recording video|
|                                 |`type: video |audio`|
|                                 |`mimeType: video/mp4 | audio/webm | video/webm;codecs=vp9 | video/webm;codecs=vp8 | video/webm;codecs=h264`
|                                  |`video: { minWidth, minHeight, maxWidth, maxHeight, minAspectRatio }`


<br>


## Component

```
import { RecordWebcam } from 'react-record-webcam'

...

function RecordVideo(props) {
  return (
    <RecordWebcam />
  )
}
```
You can include the component as is and it will render controls, video and preview elements. Alternatively you can use the render prop for more control:

```
function RecordVideo(props) {
  return (
    <RecordWebcam
      render={(props: WebcamRenderProps) => {
        return (
          <div>
            <h1>Component render prop demo</h1>
            <p>Camera status: {props.status}</p>
            <div>
              <button onClick={props.openCamera}>Open camera</button>
              <button onClick={props.retake}>Retake</button>
              <button onClick={props.start}>Start recording</button>
              <button onClick={props.stop}>Stop recording</button>
              <button onClick={props.download}>Download</button>
            </div>
          </div>
        );
      }}
    />
  )
}
```

<br>

You can use the below default class names or pass your own namespace to replace the default `react-record-webcam`. 

| className |
| ------------- |
|`react-record-webcam__wrapper`
|`react-record-webcam__status`
|`react-record-webcam__video`
|`react-record-webcam__controls`
|`react-record-webcam__controls-button`


<br>

|Prop||
| ------------- | ------------- |
|`cssNamespace: string`    |Set a namespace for the component CSS classes|
|`downloadFileName: string` |Filename for video download |
|`getStatus` |Callback to get webcam status  |
|`recordingLength: number`  |Set max recording length in seconds  |
|`namespace: string`| Pass own CSS namespace|
|`options: object` |Options for recording video|
||`type: video | audio`|
||`mimeType: video/mp4 | audio/webm | video/webm;codecs=vp9 | video/webm;codecs=vp8 | video/webm;codecs=h264`
||`video: { minWidth, minHeight, maxWidth, maxHeight, minAspectRatio }`
|`controlLabels: object`|Pass custom labels to control buttons|
|| `{ CLOSE, DOWNLOAD, OPEN, RETAKE, START, STOP }`
|`render`  |Render prop that passes status and controls|
|| `isWebcamOn`|
|| `isRecording`|
|| `isPreview`|
|| `openCamera`|
|| `closeCamera`|
|| `start`|
|| `stop`|
|| `retake`|
|| `download`|
|| `status`|

