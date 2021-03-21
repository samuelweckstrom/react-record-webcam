import React from 'react';
import { BUTTON_LABELS, NAMESPACES } from './types';

type ControlsProps = {
  cssNamespace?: string | NAMESPACES.CSS;
  openCamera(): void;
  closeCamera(): void;
  start(): void;
  stop(): void;
  retake(): void;
  download(): void;
  getRecording(): void;
  showOpenCamera: boolean;
  showCloseCamera: boolean;
  showStart: boolean;
  showStop: boolean;
  showRetake: boolean;
  showDownload: boolean;
  labels?: {
    CLOSE: string | BUTTON_LABELS.CLOSE;
    DOWNLOAD: string | BUTTON_LABELS.DOWNLOAD;
    OPEN: string | BUTTON_LABELS.OPEN;
    RETAKE: string | BUTTON_LABELS.RETAKE;
    START: string | BUTTON_LABELS.START;
    STOP: string | BUTTON_LABELS.STOP;
  };
};

const Controls: React.SFC<ControlsProps> = ({
  closeCamera,
  cssNamespace,
  download,
  labels,
  openCamera,
  retake,
  showCloseCamera,
  showDownload,
  showOpenCamera,
  showRetake,
  showStart,
  showStop,
  start,
  stop,
}): React.ReactElement => {
  return (
    <>
      <style>
        {`
          .${cssNamespace}__controls {
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
      <div className={`${cssNamespace}__controls`}>
        {showOpenCamera && (
          <button
            className={`${cssNamespace}__controls-button`}
            onClick={openCamera}
          >
            {labels?.OPEN || BUTTON_LABELS.OPEN}
          </button>
        )}
        {showCloseCamera && (
          <button
            className={`${cssNamespace}__controls-button`}
            onClick={closeCamera}
          >
            {labels?.CLOSE || BUTTON_LABELS.CLOSE}
          </button>
        )}
        {showStart && (
          <button
            className={`${cssNamespace}__controls-button`}
            onClick={start}
          >
            {labels?.START || BUTTON_LABELS.START}
          </button>
        )}
        {showStop && (
          <button className={`${cssNamespace}__controls-button`} onClick={stop}>
            {labels?.STOP || BUTTON_LABELS.STOP}
          </button>
        )}
        {showRetake && (
          <button
            className={`${cssNamespace}__controls-button`}
            onClick={retake}
          >
            {labels?.RETAKE || BUTTON_LABELS.RETAKE}
          </button>
        )}
        {showDownload && (
          <button
            className={`${cssNamespace}__controls-button`}
            onClick={download}
          >
            {labels?.DOWNLOAD || BUTTON_LABELS.DOWNLOAD}
          </button>
        )}
      </div>
    </>
  );
};

export default Controls;
