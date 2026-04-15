# react-record-webcam

[![npm](https://img.shields.io/npm/v/react-record-webcam)](https://www.npmjs.com/package/react-record-webcam)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-record-webcam)](https://bundlephobia.com/package/react-record-webcam)
[![license](https://img.shields.io/npm/l/react-record-webcam)](./LICENSE)

React hook for webcam and audio recording with multi-device support, quality presets, screenshot capture, recording timer, and full TypeScript types. Zero dependencies beyond React.

## Features

- **Multi-device** &mdash; record from multiple webcams and microphones simultaneously
- **Quality presets** &mdash; `low`, `medium`, `high`, `hd` with sensible defaults
- **Recording timer** &mdash; `useRecordingTimer` hook with pause-aware elapsed time
- **Screenshot capture** &mdash; grab a PNG frame from any live camera
- **Audio-only mode** &mdash; record audio without video
- **Pause / resume / mute** &mdash; full recording lifecycle control
- **Max duration** &mdash; auto-stop recording after a time limit
- **Device hot-plug** &mdash; device list updates when hardware is connected or removed
- **Permissions API** &mdash; `cameraPermission` state without triggering the browser prompt
- **Progressive upload** &mdash; `onDataAvailable` callback streams chunks in real-time
- **Status callbacks** &mdash; `onStatusChange` fires on every state transition
- **Structured errors** &mdash; typed `error` object with `code`, `message`, and `recordingId`
- **Next.js ready** &mdash; ships with `"use client"` directive
- **ESM + CJS** &mdash; dual-format build with full TypeScript declarations
- **Tiny** &mdash; zero runtime dependencies

## Install

```bash
npm install react-record-webcam
```

## Quick start

```tsx
import { useRecordWebcam } from 'react-record-webcam';

function App() {
  const {
    activeRecordings,
    createRecording,
    openCamera,
    startRecording,
    stopRecording,
    download,
  } = useRecordWebcam();

  const record = async () => {
    const recording = await createRecording();
    if (!recording) return;
    await openCamera(recording.id);
    await startRecording(recording.id);
  };

  return (
    <div>
      <button onClick={record}>Record</button>
      {activeRecordings.map((recording) => (
        <div key={recording.id}>
          <video ref={recording.webcamRef} autoPlay muted playsInline />
          <video ref={recording.previewRef} autoPlay loop playsInline />
          <button onClick={() => stopRecording(recording.id)}>Stop</button>
          <button onClick={() => download(recording.id)}>Download</button>
        </div>
      ))}
    </div>
  );
}
```

## Quality presets

Skip manual configuration with built-in presets:

```tsx
const recorder = useRecordWebcam({ quality: 'high' });
```

| Preset   | Resolution | Video bitrate | Audio bitrate |
| -------- | ---------- | ------------- | ------------- |
| `low`    | 640x480    | 500 kbps      | 64 kbps       |
| `medium` | 1280x720   | 1.5 Mbps      | 128 kbps      |
| `high`   | 1920x1080  | 3 Mbps        | 192 kbps      |
| `hd`     | 3840x2160  | 8 Mbps        | 256 kbps      |

## Recording timer

```tsx
import { useRecordWebcam, useRecordingTimer } from 'react-record-webcam';

function RecordingView({ recording }) {
  const elapsed = useRecordingTimer(recording);

  return (
    <div>
      <p>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</p>
      <video ref={recording.webcamRef} autoPlay muted playsInline />
    </div>
  );
}
```

The timer correctly pauses when the recording is paused and resumes from the correct offset.

## Audio-only recording

```tsx
const recording = await createRecording(undefined, undefined, { audioOnly: true });
await openCamera(recording.id);
await startRecording(recording.id);
```

## Screenshot capture

```tsx
const blob = await captureScreenshot(recording.id);
// blob is a PNG image you can upload or display
```

## Progressive upload

Stream recording chunks to a server in real-time:

```tsx
const recorder = useRecordWebcam({
  options: { timeSlice: 1000 },
  onDataAvailable: (recordingId, chunk) => {
    fetch('/api/upload', { method: 'POST', body: chunk });
  },
});
```

## Auto-stop with max duration

```tsx
const recorder = useRecordWebcam({
  options: { maxDuration: 30000 }, // 30 seconds
});
```

## Status change callback

```tsx
const recorder = useRecordWebcam({
  onStatusChange: (recordingId, oldStatus, newStatus) => {
    console.log(`${recordingId}: ${oldStatus} -> ${newStatus}`);
  },
});
```

## API

### `useRecordWebcam(args?)`

Main hook. All arguments are optional.

| Argument                 | Type                        | Description                                              |
| ------------------------ | --------------------------- | -------------------------------------------------------- |
| `mediaTrackConstraints`  | `MediaTrackConstraints`     | Video track constraints (e.g. `width`, `height`, `frameRate`). These are `MediaTrackConstraints` — **not** `MediaStreamConstraints`. Do not pass `video: true` or `audio: true` here; video and audio are always enabled by default. Use `createRecording(videoId, audioId, { audioOnly: true })` to record audio-only. |
| `mediaRecorderOptions`   | `MediaRecorderOptions`      | Options for the `MediaRecorder` constructor               |
| `options.fileName`       | `string`                    | Output file name (default: timestamp)                    |
| `options.fileType`       | `string`                    | Output file extension (default: `webm`)                  |
| `options.timeSlice`      | `number`                    | Chunk interval in ms for `MediaRecorder.start()`         |
| `options.maxDuration`    | `number`                    | Auto-stop after this many ms                             |
| `quality`                | `QualityPreset`             | `'low'` \| `'medium'` \| `'high'` \| `'hd'`             |
| `onStatusChange`         | `(id, old, new) => void`   | Called on every status transition                        |
| `onDataAvailable`        | `(id, chunk) => void`       | Called when a data chunk is available                    |

### Return value

| Property              | Type                                       | Description                                   |
| --------------------- | ------------------------------------------ | --------------------------------------------- |
| `activeRecordings`    | `Recording[]`                              | All current recordings                        |
| `cameraPermission`    | `CameraPermission`                         | `'prompt'` \| `'granted'` \| `'denied'` \| `'unknown'` |
| `devicesByType`       | `{ video, audio }`                         | Available devices grouped by type             |
| `devicesById`         | `Record<string, { label, type }>`          | Devices keyed by ID                           |
| `error`               | `RecordingError \| null`                   | Structured error with `code` and `message`    |
| `errorMessage`        | `string \| null`                           | Error message string (backward compat)        |
| `createRecording`     | `(videoId?, audioId?, opts?) => Promise`    | Create a new recording session                |
| `openCamera`          | `(id) => Promise`                          | Open the camera stream                        |
| `closeCamera`         | `(id) => Promise`                          | Close the camera stream                       |
| `startRecording`      | `(id) => Promise`                          | Start recording                               |
| `stopRecording`       | `(id) => Promise`                          | Stop recording                                |
| `pauseRecording`      | `(id) => Promise`                          | Pause recording                               |
| `resumeRecording`     | `(id) => Promise`                          | Resume recording                              |
| `muteRecording`       | `(id) => Promise`                          | Toggle audio mute                             |
| `cancelRecording`     | `(id) => Promise`                          | Cancel and remove a recording                 |
| `captureScreenshot`   | `(id) => Promise<Blob \| void>`            | Capture a PNG screenshot from the webcam      |
| `download`            | `(id) => Promise`                          | Download the recording                        |
| `getBlob`             | `(id) => Blob \| undefined`               | Get the recording's Blob directly             |
| `clearPreview`        | `(id) => Promise`                          | Clear the preview and reset                   |
| `clearAllRecordings`  | `() => Promise`                            | Clear all recordings                          |
| `clearError`          | `() => void`                               | Dismiss the current error                     |
| `applyConstraints`    | `(id, constraints) => Promise`             | Apply new constraints to a live camera        |
| `applyRecordingOptions` | `(id) => Promise`                        | Apply current options to a recording          |

### `useRecordingTimer(recording?)`

Returns the elapsed recording time in seconds. Handles pause/resume correctly.

```tsx
const elapsed = useRecordingTimer(recording); // number (seconds)
```

### `Recording`

| Field          | Type                       | Description                              |
| -------------- | -------------------------- | ---------------------------------------- |
| `id`           | `string`                   | Unique recording identifier              |
| `status`       | `Status`                   | Current status                           |
| `audioOnly`    | `boolean`                  | Whether this is audio-only               |
| `webcamRef`    | `RefObject`                | Attach to a `<video>` for live preview   |
| `previewRef`   | `RefObject`                | Attach to a `<video>` for playback       |
| `blob`         | `Blob \| undefined`        | The recorded blob (after stop)           |
| `objectURL`    | `string \| null`           | Object URL for the blob                  |
| `startedAt`    | `number \| null`           | Timestamp when recording started         |
| `pausedAt`     | `number \| null`           | Timestamp when recording was paused      |
| `totalPausedMs`| `number`                   | Total milliseconds spent paused          |
| `isMuted`      | `boolean`                  | Whether audio is muted                   |
| `recorder`     | `MediaRecorder \| null`    | The underlying MediaRecorder             |

### `Status`

`'INITIAL'` | `'OPEN'` | `'RECORDING'` | `'PAUSED'` | `'STOPPED'` | `'CLOSED'` | `'ERROR'`

## Migrating from v1

v2 is backward compatible for most users. Breaking changes:

- **Minimum React version is now 18.0** (was 16.3). The store was rewritten to use `useSyncExternalStore`.
- `createRecording` accepts an optional third argument `{ audioOnly: boolean }`.
- New fields on `Recording` (`audioOnly`, `startedAt`, `pausedAt`, `totalPausedMs`) have safe defaults.
- New return values (`error`, `cameraPermission`, `captureScreenshot`, `getBlob`) are additive.

## Browser support

Requires browsers with `MediaRecorder` and `getUserMedia` support. All modern browsers (Chrome, Firefox, Edge, Safari 14.1+).

## License

MIT
