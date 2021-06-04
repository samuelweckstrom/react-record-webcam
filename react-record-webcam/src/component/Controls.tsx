import React from 'react';
import { BUTTON_LABELS, CAMERA_STATUS } from '../constants';

type ControlsProps = {
  openCamera(): void;
  closeCamera(): void;
  start(): void;
  stop(): void;
  retake(): void;
  download(): void;
  getRecording(): void;
  status: keyof typeof CAMERA_STATUS;
  cssNamespace?: string;
  labels?: {
    CLOSE: string | number;
    DOWNLOAD: string | number;
    OPEN: string | number;
    RETAKE: string | number;
    START: string | number;
    STOP: string | number;
  };
};

export const Controls = (props: ControlsProps): React.ReactElement => {
  const showOpenCamera =
    props.status !== CAMERA_STATUS.OPEN &&
    props.status !== CAMERA_STATUS.RECORDING &&
    props.status !== CAMERA_STATUS.PREVIEW;
  const showCloseCamera =
    props.status !== CAMERA_STATUS.CLOSED &&
    (props.status === CAMERA_STATUS.OPEN || CAMERA_STATUS.RECORDING);
  const showStart = props.status === CAMERA_STATUS.OPEN;
  const showStop = props.status === CAMERA_STATUS.RECORDING;
  const showRetake = props.status === CAMERA_STATUS.PREVIEW;
  const showDownload = props.status === CAMERA_STATUS.PREVIEW;

  return (
    <>
      <style>
        {`
          .${props.cssNamespace}__controls {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-orient: horizontal;
            -webkit-box-direction: normal;
            -ms-flex-flow: row nowrap;
                    flex-flow: row nowrap;
          }
        `}
      </style>
      <div className={`${props.cssNamespace}__controls`}>
        {showOpenCamera && (
          <button
            className={`${props.cssNamespace}__controls-button`}
            onClick={props.openCamera}
          >
            {props.labels?.OPEN || BUTTON_LABELS.OPEN}
          </button>
        )}
        {showCloseCamera && (
          <button
            className={`${props.cssNamespace}__controls-button`}
            onClick={props.closeCamera}
          >
            {props.labels?.CLOSE || BUTTON_LABELS.CLOSE}
          </button>
        )}
        {showStart && (
          <button
            className={`${props.cssNamespace}__controls-button`}
            onClick={props.start}
          >
            {props.labels?.START || BUTTON_LABELS.START}
          </button>
        )}
        {showStop && (
          <button
            className={`${props.cssNamespace}__controls-button`}
            onClick={props.stop}
          >
            {props.labels?.STOP || BUTTON_LABELS.STOP}
          </button>
        )}
        {showRetake && (
          <button
            className={`${props.cssNamespace}__controls-button`}
            onClick={props.retake}
          >
            {props.labels?.RETAKE || BUTTON_LABELS.RETAKE}
          </button>
        )}
        {showDownload && (
          <button
            className={`${props.cssNamespace}__controls-button`}
            onClick={props.download}
          >
            {props.labels?.DOWNLOAD || BUTTON_LABELS.DOWNLOAD}
          </button>
        )}
      </div>
    </>
  );
};
