export const saveFile = (filename: string, blob: Blob) => {
  if (window.navigator.msSaveOrOpenBlob !== undefined) {
    window.navigator.msSaveBlob(blob, filename);
    return;
  }
  const elem = window.document.createElement('a');
  elem.style.display = 'none';
  elem.href = window.URL.createObjectURL(blob);
  elem.download = filename;
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
};
