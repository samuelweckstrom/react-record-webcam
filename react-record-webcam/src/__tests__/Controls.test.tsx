import React from 'react';
import { shallow } from 'enzyme';
import Controls from '../Controls';

const defaultProps = {
  closeCamera: jest.fn(),
  cssNamespace: 'test-namespace',
  download: jest.fn(),
  labels: {
    CLOSE: '❌',
    DOWNLOAD: '⬇️',
    OPEN: '📷',
    RETAKE: '🔄',
    START: '⏺',
    STOP: '⏹',
  },
  openCamera: jest.fn(),
  retake: jest.fn(),
  showCloseCamera: false,
  showDownload: false,
  showOpenCamera: false,
  showRetake: false,
  showStart: false,
  showStop: false,
  start: jest.fn(),
  stop: jest.fn(),
};

describe('<Controls />', () => {
  it('should show open camera button', () => {
    const props = { ...defaultProps, showOpenCamera: true };
    const wrapper = shallow(<Controls {...props} />);
    const actual = wrapper.find('button').text();
    const expected = props.labels.OPEN;
    expect(actual).toEqual(expected);
  });

  it('should show start recording button', () => {
    const props = { ...defaultProps, showStart: true };
    const wrapper = shallow(<Controls {...props} />);
    const actual = wrapper.find('button').text();
    const expected = props.labels.START;
    expect(actual).toEqual(expected);
  });

  it('should show stop recording button', () => {
    const props = {
      ...defaultProps,
      showStop: true,
    };
    const wrapper = shallow(<Controls {...props} />);
    const actual = wrapper.find('button').text();
    const expected = props.labels.STOP;
    expect(actual).toEqual(expected);
  });

  it('should show retake recording button', () => {
    const props = { ...defaultProps, showRetake: true };
    const wrapper = shallow(<Controls {...props} />);
    const actual = wrapper.findWhere((elem) => {
      return elem.type() === 'button' && elem.text() === props.labels.RETAKE;
    }).length;
    const expected = 1;
    expect(actual).toEqual(expected);
  });

  it('should show download recording button', () => {
    const props = { ...defaultProps, showDownload: true };
    const wrapper = shallow(<Controls {...props} />);
    const actual = wrapper.findWhere((elem) => {
      return elem.type() === 'button' && elem.text() === props.labels.DOWNLOAD;
    }).length;
    const expected = 1;
    expect(actual).toEqual(expected);
  });
});
