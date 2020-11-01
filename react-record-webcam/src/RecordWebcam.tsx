import React from 'react';
import Video from './Video';
import Controls from './Controls';
import record from './record';
import {
  RecorderOptions,
  Recorder,
  CAMERA_STATUS,
  BUTTON_LABELS,
  NAMESPACES,
} from './types';
import { saveFile } from './utils';

const RECORDER_OPTIONS: RecorderOptions = Object.freeze({
  type: 'video',
  mimeType: 'video/mp4',
  video: {
    minWidth: 1280,
    minHeight: 720,
    maxWidth: 1920,
    maxHeight: 1080,
    minAspectRatio: 1.77,
  },
});

const initialState = Object.freeze({
  isPreview: false,
  isWebcamOn: false,
  isRecording: false,
  status: CAMERA_STATUS.CLOSED,
});

type RenderControlsArgs = {
  isWebcamOn: boolean;
  isRecording: boolean;
  isPreview: boolean;
  openCamera: () => void;
  closeCamera: () => void;
  start: () => void;
  stop: () => void;
  retake: () => void;
  download: () => void;
  status: string;
};

type RecordWebcamProps = {
  cssNamespace?: string;
  downloadFileName?: string;
  getStatus?(status: string): void;
  options?: RecorderOptions;
  recordingLength?: number;
  render?({}: RenderControlsArgs): void;
  controlLabels?: {
    CLOSE: string | BUTTON_LABELS.CLOSE;
    DOWNLOAD: string | BUTTON_LABELS.DOWNLOAD;
    OPEN: string | BUTTON_LABELS.OPEN;
    RETAKE: string | BUTTON_LABELS.RETAKE;
    START: string | BUTTON_LABELS.START;
    STOP: string | BUTTON_LABELS.STOP;
  };
};

type RecordWebcamState = {
  isPreview: boolean;
  isWebcamOn: boolean;
  isRecording: boolean;
  status: string;
};

export class RecordWebcam extends React.PureComponent<
  RecordWebcamProps,
  RecordWebcamState
> {
  constructor(props: RecordWebcamProps) {
    super(props);
    this.closeCamera = this.closeCamera.bind(this);
    this.download = this.download.bind(this);
    this.handleOpenCamera = this.handleOpenCamera.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleCloseCamera = this.handleCloseCamera.bind(this);
    this.handleRetakeRecording = this.handleRetakeRecording.bind(this);
    this.handleStartRecording = this.handleStartRecording.bind(this);
    this.handleStopRecording = this.handleStopRecording.bind(this);
    this.openCamera = this.openCamera.bind(this);
  }
  state = {
    ...initialState,
  };
  recorder!: Recorder;
  recorderOptions = {
    ...RECORDER_OPTIONS,
    ...this.props.options,
  };
  webcamRef = React.createRef<HTMLVideoElement>();
  previewRef = React.createRef<HTMLVideoElement>();

  static defaultProps = {
    cssNamespace: NAMESPACES.CSS,
  };

  componentDidUpdate(
    prevProps: RecordWebcamProps,
    prevState: RecordWebcamState
  ) {
    if (this.state.status !== prevState.status) {
      if (this.props.getStatus) this.props.getStatus(this.state.status);
    }
  }

  async openCamera(): Promise<void> {
    const recorder = await record(this.recorderOptions);
    this.recorder = recorder;
    if (this.webcamRef.current) {
      this.webcamRef.current.srcObject = recorder.stream;
    }
    await new Promise((resolve) => setTimeout(resolve, 1700));
  }

  closeCamera() {
    if (this.recorder.stream.id) this.recorder.stream.stop();
  }

  handleCloseCamera() {
    if (this.previewRef.current) {
      this.previewRef.current.removeAttribute('src');
      this.previewRef.current.load();
    }
    this.setState({ ...initialState });
    this.closeCamera();
  }

  async handleOpenCamera(): Promise<void> {
    try {
      this.setState({
        ...initialState,
        isWebcamOn: true,
        status: CAMERA_STATUS.INIT,
      });
      await this.openCamera();
      this.setState({
        status: CAMERA_STATUS.OPEN,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async handleStartRecording(): Promise<void> {
    try {
      await this.recorder.startRecording();
      this.setState({
        ...initialState,
        isRecording: true,
        isWebcamOn: true,
        status: CAMERA_STATUS.RECORDING,
      });
      if (this.props.recordingLength) {
        const length = this.props.recordingLength * 1000;
        await new Promise((resolve) => setTimeout(resolve, length));
        await this.handleStopRecording();
        this.closeCamera();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async handleStopRecording(): Promise<void> {
    try {
      await this.recorder.stopRecording();
      const blob = await this.recorder.getBlob();
      const preview = window.URL.createObjectURL(blob);
      if (this.previewRef.current) {
        this.previewRef.current.src = preview;
      }
      this.closeCamera();
      this.setState({
        ...initialState,
        isWebcamOn: false,
        isPreview: true,
        status: CAMERA_STATUS.PREVIEW,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async handleRetakeRecording(): Promise<void> {
    try {
      await this.handleOpenCamera();
    } catch (error) {
      this.handleError(error);
    }
  }

  async download(): Promise<void> {
    try {
      const blob = await this.recorder.getBlob();
      const filename = this.props.downloadFileName
        ? `${this.props.downloadFileName}.mp4`
        : `${new Date().getTime()}.mp4`;
      saveFile(filename, blob);
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error: Error) {
    this.setState({
      ...initialState,
      status: CAMERA_STATUS.ERROR,
    });
    console.error({ error });
  }

  render() {
    return (
      <>
        <style>
          {`
            .${this.props.cssNamespace}__wrapper {
              display: -webkit-box;
              display: -ms-flexbox;
              display: flex;
              -webkit-box-orient: vertical;
              -webkit-box-direction: normal;
              -ms-flex-flow: column nowrap;
                      flex-flow: column nowrap;
              -webkit-box-pack: justify;
              -ms-flex-pack: justify;
                      justify-content: space-between;
            }
            .${this.props.cssNamespace}__status {
              margin: 1rem 0;
            }
          `}
        </style>
        <div className={`${this.props.cssNamespace}__wrapper`}>
          <Video
            cssNamespace={this.props.cssNamespace}
            style={{ display: `${this.state.isWebcamOn ? 'block' : 'none'}` }}
            autoPlay
            muted
            loop
            ref={this.webcamRef}
          />
          <Video
            cssNamespace={this.props.cssNamespace}
            style={{ display: `${this.state.isPreview ? 'block' : 'none'}` }}
            autoPlay
            muted
            loop
            ref={this.previewRef}
          />
          {this.props.render &&
            this.props.render({
              isWebcamOn: this.state.isWebcamOn,
              isRecording: this.state.isRecording,
              isPreview: this.state.isPreview,
              openCamera: this.handleOpenCamera,
              closeCamera: this.handleCloseCamera,
              start: this.handleStartRecording,
              stop: this.handleStopRecording,
              retake: this.handleRetakeRecording,
              download: this.download,
              status: this.state.status,
            })}
          {!this.props.render && (
            <div className={`${this.props.cssNamespace}__status`}>
              {`Status: ${this.state.status}`}
            </div>
          )}
          {!this.props.render && (
            <Controls
              cssNamespace={this.props.cssNamespace}
              openCamera={this.handleOpenCamera}
              closeCamera={this.handleCloseCamera}
              start={this.handleStartRecording}
              stop={this.handleStopRecording}
              retake={this.handleRetakeRecording}
              download={this.download}
              labels={this.props.controlLabels}
              showOpenCamera={
                !this.state.isWebcamOn &&
                !this.state.isRecording &&
                !this.state.isPreview
              }
              showCloseCamera={this.state.isWebcamOn}
              showStart={
                this.state.isWebcamOn &&
                !this.state.isRecording &&
                !this.state.isPreview
              }
              showStop={this.state.isRecording}
              showRetake={this.state.isPreview}
              showDownload={this.state.isPreview}
            />
          )}
        </div>
      </>
    );
  }
}
