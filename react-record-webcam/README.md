<div align="center">
  <img style="width: 90%;"src="https://s3.eu-central-1.amazonaws.com/samuel.weckstrom.xyz/github/react-record-webcam-logo.jpg">
</div>

[![Build Status](https://travis-ci.org/samuelweckstrom/react-record-webcam.svg?branch=master)](https://travis-ci.org/samuelweckstrom/react-record-webcam)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

Webcam video and audio recording component for React. Uses classes so all React versions are supported. Works in all latest browser versions, although Safari requires MediaRecorder to be enabled in the experimental features.

[Demo](https://codesandbox.io/s/react-record-webcam-demo-zog8c?file=/src/App.tsx)

## How to

### Install

```
yarn add react-record-webcam
```

### Use

```
import Webcam from 'react-record-webcam'

...

<Webcam />
```

### Styling

You can use the below default class names or pass your own namespace to replace the default `react-record-webcam`. 

| className |
| ------------- |
|`react-record-webcam__wrapper`
|`react-record-webcam__status`
|`react-record-webcam__video`
|`react-record-webcam__controls`
|`react-record-webcam__controls-button`

### Props

| Prop  | Example |
| ------------- | ------------- |
| `cssNamespace: string`    |Set a namespace for the component CSS classes|
|`downloadFileName: string` |Filename for video download |
|`getStatus` |Callback to get webcam status  |
|`recordingLength: number`  |Set max recording length in seconds  |
|`namespace: string`| Pass own CSS namespace|
|`options: object` |Options for recording video|
||`type: video | audio`|
||`mimeType: video/mp4 | audio/webm | video/webm;codecs=vp9 | video/webm;codecs=vp8 | video/webm;codecs=h264`
||`video: { minWidth, minHeight, maxWidth, maxHeight, minAspectRatio }`
|`statusMessages: object` |Pass own status messages to recorder|
||`{ INIT, CLOSED, OPEN, RECORDING, PREVIEW, ERROR }`
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

