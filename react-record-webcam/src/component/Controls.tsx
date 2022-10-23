import React from 'react';
import { BUTTON_LABELS } from '../constants';
import type { WebcamStatus } from '../types';

type ControlsProps = {
  openCamera: () => void;
  closeCamera: () => void;
  start: () => void;
  stop: () => void;
  retake: () => void;
  download: () => void;
  getRecording: () => void;
  status: WebcamStatus;
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
    props.status !== 'OPEN' &&
    props.status !== 'RECORDING' &&
    props.status !== 'PREVIEW';
  const showCloseCamera =
    props.status !== 'CLOSED' && (props.status === 'OPEN' || 'RECORDING');
  const showStart = props.status === 'OPEN';
  const showStop = props.status === 'RECORDING';
  const showRetake = props.status === 'PREVIEW';
  const showDownload = props.status === 'PREVIEW';

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
