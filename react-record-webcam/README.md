<div align="center" style="width: 100%; background-color: white;">
  <img style="width: 90%;"src="https://s3.eu-central-1.amazonaws.com/samuel.weckstrom.xyz/github/react-record-webcam-logo.jpg">
</div>

<br>

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

Webcam recording hook and component for React. Works in all latest browser versions, although Safari requires MediaRecorder to be enabled in the experimental features.

[Demo](https://codesandbox.io/s/react-record-webcam-demo-zog8c)

<br>

## Add package
```
npm i react-record-webcam
```
<i>Or</i>
```
yarn add react-record-webcam
```


## Use hook

```
import { useRecordWebcam } from 'react-record-webcam'

function RecordVideo(props) {
  const recordWebcam = useRecordWebcam();

  const saveFile = async () => {
    const blob = await recordWebcam.getRecording();
    ...
  };

  return (
    <div>
      <p>Camera status: {recordWebcam.status}</p>
      <button onClick={recordWebcam.open}>Open camera</button>
      <button onClick={recordWebcam.start}>Start recording</button>
      <button onClick={recordWebcam.stop}>Stop recording</button>
      <button onClick={recordWebcam.retake}>Retake recording</button>
      <button onClick={recordWebcam.download}>Download recording</button>
      <button onClick={saveFile}>Save file to server</button>
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


| Options  ||
| ------------- | ------------- |
|`filename: string`              |Filename for download|
|`recordingLength: number`       |Length of recording in seconds|
|`fileType: 'mp4'` \| `'webm'`|File container for download. Will also set mimeType. |
|`aspectRatio: number`|Video aspect ratio, default is 1.77|
|`codec: object`|`{ audio: 'aac' \| 'opus', video: 'av1' \| 'avc' \| 'vp8' }`|
|`width: number`| Video width|
|`height: number`| Video height|
|`disableLogs: boolean`|Disable status logs from console|


<br>


## Use component

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

|Props||
| ------------- | ------------- |
|`cssNamespace: string`    |Set a namespace for the component CSS classes|
|`downloadFileName: string` |Filename for video download |
|`getStatus: () => string` |Callback to get webcam status  |
|`recordingLength: number`  |Set max recording length in seconds  |
|`namespace: string`| Pass own CSS namespace|
|`options: object` |Options for recording video|
||`fileType: 'mp4' \| 'webm'`|
||`width: number`|
||`height: number`|
||`aspectRatio: number`|
||`codec: { audio: 'aac' \| 'opus', video: 'av1' \| 'avc' \| 'vp8' }`|
||`disableLogs: boolean`|
|`controlLabels: object`|Pass custom labels to control buttons|
||`CLOSE: string \| number`|
||`DOWNLOAD: string \| number`|
||`OPEN: string \| number`|
||`RETAKE: string \| number`|
||`START: string \| number`|
||`STOP: string \| number`|
|`render`  |Render prop that passes status and controls|
|| `openCamera: () => void`|
|| `closeCamera: () => void`|
|| `start: () => void`|
|| `stop: () => void`|
|| `retake: () => void`|
|| `download: () => void`|
|| `getRecording: () => void`|
|| `status: string`|

<br>

You can use the below default class names or pass your own namespace to replace the default `react-record-webcam`. 

| className |
| ------------- |
|`react-record-webcam__wrapper`
|`react-record-webcam__status`
|`react-record-webcam__video`
|`react-record-webcam__controls`
|`react-record-webcam__controls-button`