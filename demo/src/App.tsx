import { useState, useCallback } from 'react';
import {
  useRecordWebcam,
  useRecordingTimer,
  QUALITY_PRESETS,
  type Recording,
  type QualityPreset,
  STATUS,
} from 'react-record-webcam';

type InstanceConfig = {
  mirror: boolean;
};

type OptionsState = {
  fileName: string;
  fileType: string;
  timeSlice: number;
  maxDuration: number;
  width: number;
  height: number;
  aspectRatio: number;
  audioBitsPerSecond: number;
  videoBitsPerSecond: number;
};

const DEFAULT_OPTIONS: OptionsState = {
  fileName: '',
  fileType: 'webm',
  timeSlice: 0,
  maxDuration: 0,
  width: 1280,
  height: 720,
  aspectRatio: 1.7,
  audioBitsPerSecond: 128000,
  videoBitsPerSecond: 2500000,
};

export function App() {
  const [opts, setOpts] = useState<OptionsState>(DEFAULT_OPTIONS);
  const [quality, setQuality] = useState<QualityPreset | ''>('');
  const [mirrorPreview, setMirrorPreview] = useState(true);
  const [audioOnly, setAudioOnly] = useState(false);
  const [videoDeviceId, setVideoDeviceId] = useState('');
  const [audioDeviceId, setAudioDeviceId] = useState('');

  // Per-instance config snapshotted at "Open camera" time
  const [instanceConfigs, setInstanceConfigs] = useState<Record<string, InstanceConfig>>({});

  const {
    activeRecordings,
    cameraPermission,
    cancelRecording,
    captureScreenshot,
    clearAllRecordings,
    clearError,
    clearPreview,
    closeCamera,
    createRecording,
    devicesById,
    devicesByType,
    download,
    error,
    getBlob,
    muteRecording,
    openCamera,
    pauseRecording,
    resumeRecording,
    startRecording,
    stopRecording,
  } = useRecordWebcam({
    quality: quality || undefined,
    mediaTrackConstraints: quality
      ? undefined
      : {
          width: opts.width,
          height: opts.height,
          aspectRatio: opts.aspectRatio,
        },
    mediaRecorderOptions: quality
      ? undefined
      : {
          audioBitsPerSecond: opts.audioBitsPerSecond,
          videoBitsPerSecond: opts.videoBitsPerSecond,
        },
    options: {
      fileName: opts.fileName || undefined,
      fileType: opts.fileType || undefined,
      timeSlice: opts.timeSlice || undefined,
      maxDuration: opts.maxDuration || undefined,
    },
  });

  const handleCreate = useCallback(async () => {
    const recording = await createRecording(
      videoDeviceId || undefined,
      audioDeviceId || undefined,
      { audioOnly }
    );
    if (!recording) return;

    // Snapshot the current UI settings into this instance
    setInstanceConfigs((prev) => ({
      ...prev,
      [recording.id]: { mirror: mirrorPreview },
    }));

    await openCamera(recording.id);
  }, [videoDeviceId, audioDeviceId, audioOnly, mirrorPreview, createRecording, openCamera]);

  const handleRemove = useCallback(
    async (id: string) => {
      await cancelRecording(id);
      setInstanceConfigs((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [cancelRecording]
  );

  const handleClearAll = useCallback(async () => {
    await clearAllRecordings();
    setInstanceConfigs({});
  }, [clearAllRecordings]);

  const handleScreenshot = useCallback(
    async (recordingId: string) => {
      const mirror = instanceConfigs[recordingId]?.mirror ?? false;
      const blob = await captureScreenshot(recordingId, { mirror });
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screenshot-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [captureScreenshot, instanceConfigs]
  );

  const handleOption = useCallback(
    (key: keyof OptionsState, value: string) => {
      setOpts((prev) => ({
        ...prev,
        [key]:
          key === 'fileName' || key === 'fileType' ? value : Number(value),
      }));
    },
    []
  );

  const statusColor = (status: string) => {
    switch (status) {
      case STATUS.RECORDING:
        return 'text-red-500';
      case STATUS.PAUSED:
        return 'text-amber-400';
      case STATUS.OPEN:
        return 'text-emerald-400';
      case STATUS.STOPPED:
        return 'text-sky-400';
      case STATUS.ERROR:
        return 'text-red-400';
      default:
        return 'text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-zinc-200">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              react-record-webcam
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Webcam &amp; audio recording hook for React
            </p>
          </div>
          <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-500">
            Permission: {cameraPermission}
          </span>
        </header>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span>
              {error.code !== error.message && (
                <span className="mr-2 rounded bg-red-500/20 px-1.5 py-0.5 font-mono text-xs text-red-400">
                  {error.code}
                </span>
              )}
              {error.message}
            </span>
            <button
              onClick={clearError}
              className="ml-4 cursor-pointer rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/20"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* New recording configuration panel */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-zinc-200">New recording</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Configure settings below, then click{' '}
                <span className="text-zinc-300">
                  {audioOnly ? 'Start audio' : 'Open camera'}
                </span>{' '}
                to create an instance with these settings.
              </p>
            </div>
            {activeRecordings.length > 0 && (
              <button
                onClick={handleClearAll}
                className="h-8 cursor-pointer rounded-lg border border-zinc-700 px-3 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Device + quality row */}
          <div className="flex flex-wrap items-end gap-3">
            <FieldLabel label="Video device">
              <select
                value={videoDeviceId}
                onChange={(e) => setVideoDeviceId(e.target.value)}
                disabled={audioOnly}
                className="h-9 min-w-[160px] rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 outline-none disabled:opacity-40 focus:border-zinc-500"
              >
                <option value="">Default</option>
                {devicesByType?.video.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
            </FieldLabel>

            <FieldLabel label="Audio device">
              <select
                value={audioDeviceId}
                onChange={(e) => setAudioDeviceId(e.target.value)}
                className="h-9 min-w-[160px] rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 outline-none focus:border-zinc-500"
              >
                <option value="">Default</option>
                {devicesByType?.audio.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
            </FieldLabel>

            <FieldLabel label="Quality preset">
              <select
                value={quality}
                onChange={(e) => {
                  const q = e.target.value as QualityPreset | '';
                  setQuality(q);
                  if (q) {
                    const p = QUALITY_PRESETS[q];
                    setOpts((prev) => ({
                      ...prev,
                      width: p.width,
                      height: p.height,
                      aspectRatio: +(p.width / p.height).toFixed(2),
                      videoBitsPerSecond: p.videoBitsPerSecond,
                      audioBitsPerSecond: p.audioBitsPerSecond,
                    }));
                  }
                }}
                className="h-9 w-[110px] rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200 outline-none focus:border-zinc-500"
              >
                <option value="">Custom</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="hd">HD (4K)</option>
              </select>
            </FieldLabel>

            <div className="flex items-end gap-2">
              <Toggle
                label="Audio only"
                checked={audioOnly}
                onChange={setAudioOnly}
              />
              <Toggle
                label="Mirror preview"
                checked={mirrorPreview}
                onChange={setMirrorPreview}
              />
            </div>

            <button
              onClick={handleCreate}
              className="h-9 cursor-pointer rounded-lg bg-white px-5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200 ml-auto"
            >
              {audioOnly ? '+ Start audio' : '+ Open camera'}
            </button>
          </div>

          {/* Advanced options — always visible */}
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-5 sm:grid-cols-3 lg:grid-cols-4">
            <OptionField
              label="File name"
              value={opts.fileName}
              onChange={(v) => handleOption('fileName', v)}
              placeholder="auto (timestamp)"
            />
            <OptionField
              label="File type"
              value={opts.fileType}
              onChange={(v) => handleOption('fileType', v)}
              type="select"
              selectOptions={['webm', 'mp4', 'ogg']}
            />
            <OptionField
              label="Width (px)"
              value={String(opts.width)}
              onChange={(v) => handleOption('width', v)}
              type="number"
              disabled={!!quality}
            />
            <OptionField
              label="Height (px)"
              value={String(opts.height)}
              onChange={(v) => handleOption('height', v)}
              type="number"
              disabled={!!quality}
            />
            <OptionField
              label="Aspect ratio"
              value={String(opts.aspectRatio)}
              onChange={(v) => handleOption('aspectRatio', v)}
              type="number"
              step="0.1"
              disabled={!!quality}
            />
            <OptionField
              label="Max duration (ms)"
              value={String(opts.maxDuration)}
              onChange={(v) => handleOption('maxDuration', v)}
              type="number"
              placeholder="0 = unlimited"
            />
            <OptionField
              label="Time slice (ms)"
              value={String(opts.timeSlice)}
              onChange={(v) => handleOption('timeSlice', v)}
              type="number"
              placeholder="0 = single blob"
            />
            <OptionField
              label="Audio bitrate (bps)"
              value={String(opts.audioBitsPerSecond)}
              onChange={(v) => handleOption('audioBitsPerSecond', v)}
              type="number"
              step="1000"
              disabled={!!quality}
            />
            <OptionField
              label="Video bitrate (bps)"
              value={String(opts.videoBitsPerSecond)}
              onChange={(v) => handleOption('videoBitsPerSecond', v)}
              type="number"
              step="100000"
              disabled={!!quality}
            />
          </div>
        </div>

        {/* Recordings grid */}
        {activeRecordings.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-800 text-sm text-zinc-600">
            Configure settings above and click &ldquo;{audioOnly ? 'Start audio' : 'Open camera'}&rdquo; to begin
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {activeRecordings.map((recording) => (
              <RecordingCard
                key={recording.id}
                recording={recording}
                mirror={instanceConfigs[recording.id]?.mirror ?? false}
                statusColor={statusColor}
                onStart={startRecording}
                onStop={stopRecording}
                onPause={pauseRecording}
                onResume={resumeRecording}
                onMute={muteRecording}
                onClose={closeCamera}
                onCancel={handleRemove}
                onDownload={download}
                onClearPreview={clearPreview}
                onScreenshot={handleScreenshot}
                onGetBlob={getBlob}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Recording Card ─── */

function RecordingCard({
  recording,
  mirror,
  statusColor,
  onStart,
  onStop,
  onPause,
  onResume,
  onMute,
  onClose,
  onCancel,
  onDownload,
  onClearPreview,
  onScreenshot,
  onGetBlob,
}: {
  recording: Recording;
  mirror: boolean;
  statusColor: (s: string) => string;
  onStart: (id: string) => Promise<Recording | void>;
  onStop: (id: string) => Promise<Recording | void>;
  onPause: (id: string) => Promise<Recording | void>;
  onResume: (id: string) => Promise<Recording | void>;
  onMute: (id: string) => Promise<Recording | void>;
  onClose: (id: string) => Promise<Recording | void>;
  onCancel: (id: string) => Promise<void>;
  onDownload: (id: string) => Promise<void>;
  onClearPreview: (id: string) => Promise<Recording | void>;
  onScreenshot: (id: string) => Promise<void>;
  onGetBlob: (id: string) => Blob | undefined;
}) {
  const elapsed = useRecordingTimer(recording);

  const s = recording.status;
  const isRecording = s === STATUS.RECORDING;
  const isPaused = s === STATUS.PAUSED;
  const isStopped = s === STATUS.STOPPED;
  const hasPreview = recording.previewRef.current?.src?.startsWith('blob:');

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const blobInfo = isStopped ? onGetBlob(recording.id) : undefined;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
      {/* Live feed */}
      {recording.audioOnly ? (
        <div className="flex aspect-video items-center justify-center bg-zinc-950 text-zinc-600">
          <div className="text-center">
            <div className="mb-2 text-3xl">
              {isRecording ? (
                <span className="inline-block h-4 w-4 animate-pulse rounded-full bg-red-500" />
              ) : (
                <span className="text-zinc-700">&#9835;</span>
              )}
            </div>
            <p className="text-xs">Audio only</p>
          </div>
        </div>
      ) : (
        <div className="relative aspect-video bg-black">
          <video
            ref={recording.webcamRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover${mirror ? ' -scale-x-100' : ''}`}
          />
          {/* Badge overlay */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium backdrop-blur-sm ${statusColor(s)}`}
            >
              {isRecording && (
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
              )}
              {s}
            </span>
            {recording.isMuted && (
              <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs text-amber-400 backdrop-blur-sm">
                MUTED
              </span>
            )}
            {mirror && (
              <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs text-zinc-400 backdrop-blur-sm">
                MIRRORED
              </span>
            )}
          </div>
          {/* Timer */}
          {(isRecording || isPaused) && (
            <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 font-mono text-xs text-white backdrop-blur-sm">
              {formatTime(elapsed)}
            </div>
          )}
        </div>
      )}

      {/* Info row */}
      <div className="border-b border-zinc-800 px-4 py-2.5">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="truncate">
            {recording.audioOnly
              ? 'Audio only'
              : recording.videoLabel || 'Camera'}
          </span>
          <span className="truncate">{recording.audioLabel || 'Mic'}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-1.5 px-4 py-3">
        {!isRecording && !isPaused && !isStopped && (
          <ActionBtn onClick={() => onStart(recording.id)}>Record</ActionBtn>
        )}
        {isRecording && (
          <>
            <ActionBtn onClick={() => onPause(recording.id)}>Pause</ActionBtn>
            <ActionBtn onClick={() => onStop(recording.id)} variant="danger">
              Stop
            </ActionBtn>
          </>
        )}
        {isPaused && (
          <>
            <ActionBtn onClick={() => onResume(recording.id)}>
              Resume
            </ActionBtn>
            <ActionBtn onClick={() => onStop(recording.id)} variant="danger">
              Stop
            </ActionBtn>
          </>
        )}
        {(isRecording || isPaused) && (
          <ActionBtn
            onClick={() => onMute(recording.id)}
            variant={recording.isMuted ? 'warning' : 'default'}
          >
            {recording.isMuted ? 'Unmute' : 'Mute'}
          </ActionBtn>
        )}
        {!recording.audioOnly && !isRecording && !isPaused && (
          <ActionBtn onClick={() => onScreenshot(recording.id)}>
            Screenshot
          </ActionBtn>
        )}
        <ActionBtn onClick={() => onClose(recording.id)} variant="subtle">
          Close
        </ActionBtn>
        <ActionBtn onClick={() => onCancel(recording.id)} variant="subtle">
          Remove
        </ActionBtn>
      </div>

      {/* Preview */}
      {(isStopped || hasPreview) && (
        <div className="border-t border-zinc-800">
          {!recording.audioOnly && (
            <div className="aspect-video bg-black">
              <video
                ref={recording.previewRef}
                src={recording.objectURL || undefined}
                autoPlay
                loop
                playsInline
                controls
                className="h-full w-full object-cover"
              />
            </div>
          )}
          {blobInfo && (
            <div className="border-b border-zinc-800 px-4 py-2 text-xs text-zinc-500">
              {(blobInfo.size / 1024).toFixed(1)} KB &middot;{' '}
              {blobInfo.type || recording.mimeType}
            </div>
          )}
          <div className="flex gap-1.5 px-4 py-3">
            <ActionBtn onClick={() => onDownload(recording.id)}>
              Download
            </ActionBtn>
            <ActionBtn
              onClick={() => onClearPreview(recording.id)}
              variant="subtle"
            >
              Clear
            </ActionBtn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Small UI components ─── */

function ActionBtn({
  children,
  onClick,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'warning' | 'subtle';
}) {
  const base =
    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer';
  const styles = {
    default: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700',
    danger: 'bg-red-500/15 text-red-400 hover:bg-red-500/25',
    warning: 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25',
    subtle: 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300',
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 px-3 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-white"
      />
      {label}
    </label>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
      {label}
      {children}
    </label>
  );
}

function OptionField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  step,
  selectOptions,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: 'text' | 'number' | 'select';
  placeholder?: string;
  step?: string;
  selectOptions?: string[];
  disabled?: boolean;
}) {
  const inputClass = `h-8 rounded-lg border border-zinc-700 bg-zinc-800 px-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-500 disabled:opacity-40`;
  return (
    <label className="flex flex-col gap-1.5 text-xs text-zinc-400">
      {label}
      {type === 'select' && selectOptions ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={inputClass}
        >
          {selectOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          disabled={disabled}
          className={inputClass}
        />
      )}
    </label>
  );
}
