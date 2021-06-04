import React from 'react';

type VideoProps = {
  autoPlay: boolean;
  cssNamespace?: string;
  muted: boolean;
  loop: boolean;
  style: React.CSSProperties;
  ref: React.RefObject<HTMLVideoElement>;
};

export const Video = React.forwardRef<HTMLVideoElement, VideoProps>(
  (
    { autoPlay, cssNamespace, muted, loop, style },
    ref: React.Ref<HTMLVideoElement>
  ): React.ReactElement<HTMLVideoElement> => (
    <video
      style={style}
      className={`${cssNamespace}__video`}
      autoPlay={autoPlay}
      muted={muted}
      ref={ref}
      loop={loop}
    />
  )
);
