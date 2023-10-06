import { useEffect, useState } from 'react';
import { useRecording } from './useRecording';

type ByIdDevice = {
  label: string;
  type: 'videoinput' | 'audioinput';
};

type ById = Record<string, ByIdDevice>;

async function byId(devices: MediaDeviceInfo[]): Promise<ById> {
  return devices.reduce<ById>(
    (result, { deviceId, kind, label }: MediaDeviceInfo) => {
      if (kind === 'videoinput' || kind === 'audioinput') {
        result[deviceId] = {
          label,
          type: kind,
        };
      }
      return result;
    },
    {}
  );
}

type ByLabelDevice = {
  label: string;
  deviceId: string;
};

type ByType = {
  video: ByLabelDevice[];
  audio: ByLabelDevice[];
};

async function byType(devices: MediaDeviceInfo[]): Promise<ByType> {
  return devices.reduce<ByType>(
    (result, { deviceId, kind, label }: MediaDeviceInfo) => {
      if (kind === 'videoinput') {
        result.video.push({ label, deviceId });
      }
      if (kind === 'audioinput') {
        result.audio.push({ label, deviceId });
      }
      return result;
    },
    {
      video: [],
      audio: [],
    }
  );
}

async function getUserPermission(): Promise<MediaDeviceInfo[]> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    return mediaDevices;
  } catch (error) {
    throw new Error('getUserPermission');
  }
}

type InitialDevice = {
  deviceId: string;
  label: string;
};

type InitialDevices = {
  video: InitialDevice | null;
  audio: InitialDevice | null;
};

export function useDeviceInitialization(): {
  devicesByType: ByType;
  devicesById: ById;
  initialDevices: InitialDevices;
} {
  const { handleError } = useRecording();
  const [devicesByType, setDevicesByType] = useState<ByType>({
    video: [],
    audio: [],
  });
  const [devicesById, setDevicesById] = useState<ById>({});
  const [initialDevices, setInitialDevices] = useState<InitialDevices>({
    video: null,
    audio: null,
  });

  useEffect(() => {
    const initializeDevices = async () => {
      try {
        const mediaDevices = await getUserPermission();
        const [allById, allByType] = await Promise.all([
          byId(mediaDevices),
          byType(mediaDevices),
        ]);
        setDevicesById(allById);
        setDevicesByType(allByType);
        setInitialDevices({
          video: {
            deviceId: allByType.video[0].deviceId,
            label: allByType.video[0].label,
          },
          audio: {
            deviceId: allByType.audio[0].deviceId,
            label: allByType.audio[0].deviceId,
          },
        });
      } catch (error) {
        handleError('initializeDevices', error);
      }
    };

    initializeDevices();
  }, []);

  return { devicesByType, devicesById, initialDevices };
}
