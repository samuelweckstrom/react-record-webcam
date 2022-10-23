<div align="center" style="width: 100%; background-color: white;">
  <img style="width: 90%;"src="https://s3.eu-central-1.amazonaws.com/samuel.weckstrom.xyz/github/react-record-webcam-logo.jpg">
</div>

<br>

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

Webcam recording hook and component for React. Works in all latest browser versions, although Safari requires MediaRecorder to be enabled in settings under experimental features.

[Demo](https://codesandbox.io/s/react-record-webcam-demo-zog8c)

<br>

## Add package

```
npm i react-record-webcam
```

<i>or</i>

```
yarn add react-record-webcam
```

## Example use for hook

```
import { useRecordWebcam } from 'react-record-webcam'

function RecordVideo(props) {
  const recordWebcam = useRecordWebcam({ frameRate: 60 });

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

Import the hook and initialize it in your function. The hook returns refs for  preview and recording video elements, functions to control recording (open, start, stop, retake, download) and camera status.

### Passing options

Hook and component accept an options object to control things like width/height etc.

`const recordWebcam = useRecordWebcam(<OPTIONS>);`

or

`<RecordWebcam options={<OPTIONS>} />`

| Options  ||
| ------------- | ------------- |
|`fileName<string>`|Filename for download|
|`recordingLength<number>`|Length of recording in seconds|
|`mimeType<enum>`|`'video/mp4'`<br>`'video/webm'`<br>`'video/webm;codecs=vp9'`<br>`'video/webm;codecs=vp8'`<br>`'video/webm;codecs=h264'`<br>`'video/x-matroska;codecs=avc1'`<br>`'video/mpeg'`
|`aspectRatio<number>`|Video aspect ratio, default is 1.7|
|`width<number>`| Video width|
|`height<number>`| Video height|
|`disableLogs<boolean>`|Disable debug logs, on by default|

Note: file extension and codec is determined from the passed `mimeType` option, so use any of the above ones that are currently supported.

<br>

## Example use for component

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
|`cssNamespace<string>`    |Set a namespace for the component CSS classes|
|`downloadFileName<string>` |File name for video download |
|`getStatus<fn:string>` |Callback to get webcam status  |
|`options` | Same options as in hook version|
|`controlLabels`|Pass custom labels to control buttons|
||`CLOSE<string \| number>`|
||`DOWNLOAD<string \| number>`|
||`OPEN<string \| number>`|
||`RETAKE<string \| number>`|
||`START<string \| number>`|
||`STOP<string \| number>`|
|`render`  |Render prop that passes status and controls|
|| `status<string>`|
|| `closeCamera<fn:void>`|
|| `download<fn:void>`|
|| `getRecording<fn:void>`|
|| `openCamera<fn:void>`|
|| `retake<fn:void>`|
|| `start<fn:void>`|
|| `stop<fn:void>`|

<br>

You can use the below default class names or pass your own namespace to replace the default `react-record-webcam`.

| className |
| ------------- |
|`react-record-webcam__wrapper`
|`react-record-webcam__status`
|`react-record-webcam__video`
|`react-record-webcam__controls`
|`react-record-webcam__controls-button`

## License

[MIT](LICENSE)
