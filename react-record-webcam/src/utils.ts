import { Recording } from './recording';

export function handleError(
  functionName: string,
  error: Error,
  recording?: Recording
) {
  console.error(`@${functionName}: `, error);
  if (recording) {
    recording.status = 'ERROR';
  }
  throw error;
}
