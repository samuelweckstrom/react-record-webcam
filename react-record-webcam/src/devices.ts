import { useCallback, useEffect, useState } from 'react';
import { handleError } from './utils';

export type ByIdDevice = {
  label: string;
  type: string;
};

export type ById = Record<string, ByIdDevice>;

export const byId = async (devices: MediaDeviceInfo[]): Promise<ById> => {
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
};

export type ByLabelDevice = {
  label: string;
  deviceId: string;
};

export type ByType = {
  video: ByLabelDevice[];
  audio: ByLabelDevice[];
};

export const byType = async (devices: MediaDeviceInfo[]): Promise<ByType> => {
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
};

export const getUserPermission = async (): Promise<MediaDeviceInfo[]> => {
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
    console.error('@getUserPermission: ', { error });
    throw error;
  }
};

export const useDeviceInitialization = () => {
  const [devicesByType, setDevicesByType] = useState<ByType>();
  const [devicesById, setDevicesById] = useState<ById>({});

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
      } catch (error) {
        handleError('initializeDevices', error);
      }
    };

    initializeDevices();
  }, []);

  return { devicesByType, devicesById };
};

type SelectedDevice = {
  videoId: string | null;
  audioId: string | null;
};

export const useDeviceSelection = (devicesById: ById) => {
  const [selectedDevices, setSelectedDevices] = useState<SelectedDevice>({
    videoId: null,
    audioId: null,
  });

  const setInput = useCallback(
    (deviceId: string) => {
      try {
        const devices = { ...selectedDevices };
        if (devicesById?.[deviceId].type === 'videoinput') {
          devices.videoId = deviceId;
        }
        if (devicesById?.[deviceId].type === 'audioinput') {
          devices.audioId = deviceId;
        }
        setSelectedDevices(devices);
      } catch (error) {
        handleError('setInput', error);
      }
    },
    [devicesById, selectedDevices]
  );

  return { selectedDevices, setInput };
};
