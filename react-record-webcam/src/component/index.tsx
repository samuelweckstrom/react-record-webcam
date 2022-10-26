import React from 'react';
import { Video } from './Video';
import { Controls } from './Controls';
import { mediaRecorder } from '../mediaRecorder';
import { saveFile } from '../utils';
import { NAMESPACES, DEFAULT_OPTIONS } from '../constants';
import type { Recorder } from '../mediaRecorder';
import type { RecordOptions, WebcamStatus } from '../types';

export type WebcamRenderProps = {
  status: WebcamStatus;
  closeCamera: () => void;
  download: () => Promise<void>;
  getRecording: () => Promise<Blob | null>;
  openCamera: () => Promise<void>;
  retake: () => void;
  start: () => void;
  stop: () => void;
};

export type RecordWebcamProps = {
  cssNamespace?: string;
  downloadFileName?: string;
  options?: RecordOptions;
  getStatus?: (status: WebcamStatus) => void;
  render?: (props: WebcamRenderProps) => void;
  controlLabels?: {
    CLOSE: string | number;
    DOWNLOAD: string | number;
    OPEN: string | number;
    RETAKE: string | number;
    START: string | number;
    STOP: string | number;
  };
};

export type RecordWebcamState = {
  status: WebcamStatus;
};

export class RecordWebcam extends React.PureComponent<
  RecordWebcamProps,
  RecordWebcamState
> {
  constructor(props: RecordWebcamProps) {
    super(props);
    this.download = this.download.bind(this);
    this.getRecording = this.getRecording.bind(this);
    this.openCamera = this.openCamera.bind(this);
    this.handleError = this.handleError.bind(this);
    this.close = this.close.bind(this);
    this.retake = this.retake.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }
  state: RecordWebcamState = {
    status: 'CLOSED',
  };
  recorder!: Recorder;
  recorderOptions: RecordOptions = {
    ...DEFAULT_OPTIONS,
    ...this.props.options,
  };
  webcamRef = React.createRef<HTMLVideoElement>();
  previewRef = React.createRef<HTMLVideoElement>();

  static defaultProps = {
    cssNamespace: NAMESPACES.CSS,
  };

  options = { ...this.recorderOptions, ...this.props.options };

  componentDidUpdate(_: RecordWebcamProps, prevState: RecordWebcamState) {
    if (this.state.status !== prevState.status) {
      if (this.props.getStatus) this.props.getStatus(this.state.status);
    }
  }

  handleError(error: unknown) {
    this.setState({
      status: 'ERROR',
    });
    console.error({ error });
  }

  stopStream() {
    if (this.recorder.stream.id && this.recorder?.stopRecording) {
      this.recorder.stream.stop();
    }
  }

  close() {
    if (this.previewRef.current) {
      this.previewRef.current.removeAttribute('src');
      this.previewRef.current.load();
    }
    this.setState({ status: 'CLOSED' });
    this.stopStream();
  }

  async openCamera(): Promise<void> {
    try {
      this.setState({
        status: 'INIT',
      });
      const recorderInit = await mediaRecorder(this.options);
      this.recorder = recorderInit;
      if (this.webcamRef.current) {
        this.webcamRef.current.srcObject = recorderInit.stream;
      }
      await new Promise((resolve) => setTimeout(resolve, 1700));
      this.setState({
        status: 'OPEN',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async start(): Promise<void> {
    try {
      if (this.recorder?.startRecording) {
        await this.recorder.startRecording();
        this.setState({
          status: 'RECORDING',
        });
        if (this.props.options?.recordingLength) {
          const length = this.props.options.recordingLength * 1000;
          await new Promise((resolve) => setTimeout(resolve, length));
          await this.stop();
          this.stop();
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.recorder?.stopRecording && this.recorder?.getBlob) {
        await this.recorder.stopRecording();
        const blob = await this.recorder.getBlob();
        const preview = window.URL.createObjectURL(blob);
        if (this.previewRef.current) {
          this.previewRef.current.src = preview;
        }
        this.stopStream();
        this.setState({
          status: 'PREVIEW',
        });
        return;
      }
      throw new Error('Stop recording error!');
    } catch (error) {
      this.handleError(error);
    }
  }

  async retake(): Promise<void> {
    try {
      await this.openCamera();
    } catch (error) {
      this.handleError(error);
    }
  }

  async download(): Promise<void> {
    try {
      if (this.recorder?.getBlob) {
        const blob = await this.recorder.getBlob();
        const fileTypeFromMimeType =
          this.recorderOptions.mimeType?.split('video/')[1]?.split(';')[0] ||
          'mp4';
        const fileType =
          fileTypeFromMimeType === 'x-matroska' ? 'mkv' : fileTypeFromMimeType;
        const filename = `${this.recorderOptions.fileName}.${fileType}`;
        saveFile(filename, blob);
        return;
      }
      throw new Error('Error downloading file!');
    } catch (error) {
      this.handleError(error);
    }
  }

  async getRecording(): Promise<Blob | null> {
    try {
      if (this.recorder?.getBlob) {
        return this.recorder.getBlob();
      }
      return Promise.resolve(null);
    } catch (error) {
      this.handleError(error);
      console.error({ error });
      return Promise.reject(error);
    }
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
          {this.props?.render?.({
            openCamera: this.openCamera,
            closeCamera: this.close,
            start: this.start,
            stop: this.stop,
            retake: this.retake,
            download: this.download,
            getRecording: this.getRecording,
            status: this.state.status,
          })}
          {!this.props.render && (
            <div className={`${this.props.cssNamespace}__status`}>
              {`Status: ${this.state.status}`}
            </div>
          )}
          {!this.props.render && (
            <Controls
              closeCamera={this.close}
              cssNamespace={this.props.cssNamespace}
              download={this.download}
              getRecording={this.getRecording}
              labels={this.props.controlLabels}
              openCamera={this.openCamera}
              retake={this.retake}
              start={this.start}
              status={this.state.status}
              stop={this.stop}
            />
          )}
          <Video
            cssNamespace={this.props.cssNamespace}
            style={{
              display: `${
                this.state.status !== 'CLOSED' &&
                (this.state.status === 'OPEN' ||
                  this.state.status === 'RECORDING')
                  ? 'block'
                  : 'none'
              }`,
            }}
            autoPlay
            muted
            loop
            ref={this.webcamRef}
          />
          <Video
            cssNamespace={this.props.cssNamespace}
            style={{
              display: `${
                this.state.status !== 'CLOSED' &&
                this.state.status === 'PREVIEW'
                  ? 'block'
                  : 'none'
              }`,
            }}
            autoPlay
            muted
            loop
            ref={this.previewRef}
          />
        </div>
      </>
    );
  }
}
