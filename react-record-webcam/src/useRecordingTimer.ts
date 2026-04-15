import { useState, useEffect } from 'react';
import { STATUS, type Recording } from './useRecordingStore';

/**
 * Returns the elapsed recording time in seconds for a given recording.
 * Correctly handles pause/resume by excluding paused time.
 * Updates once per second while recording.
 *
 * @param recording The recording to track, or undefined.
 * @returns Elapsed recording time in seconds.
 */
export function useRecordingTimer(
  recording: Recording | undefined
): number {
  const [elapsed, setElapsed] = useState(0);

  const status = recording?.status;
  const startedAt = recording?.startedAt ?? null;
  const pausedAt = recording?.pausedAt ?? null;
  const totalPausedMs = recording?.totalPausedMs ?? 0;

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }

    if (status === STATUS.RECORDING) {
      const tick = () => {
        setElapsed(
          Math.floor((Date.now() - startedAt - totalPausedMs) / 1000)
        );
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }

    if (status === STATUS.PAUSED && pausedAt) {
      setElapsed(
        Math.floor((pausedAt - startedAt - totalPausedMs) / 1000)
      );
      return;
    }

    if (status === STATUS.STOPPED) {
      // Keep last elapsed value
      return;
    }

    setElapsed(0);
  }, [status, startedAt, pausedAt, totalPausedMs]);

  return elapsed;
}
