import React from 'react';
import { shallow, mount } from 'enzyme';
import Recorder from '../index';

describe('<Recorder />', () => {
  it('should render two forward ref components', () => {
    const wrapper = shallow(<Recorder />);
    const actual = wrapper.find('ForwardRef').length;
    const expected = 2;
    expect(actual).toEqual(expected);
  });

  it('should toggle CSS { display: block; } for <Video /> when webcam is on', () => {
    const wrapper = shallow(<Recorder />);
    wrapper.setState({ isWebcamOn: true });
    const actual = wrapper.find('ForwardRef').get(0).props.style;
    const expected = { display: 'block' };
    expect(actual).toEqual(expected);
  });

  it('should render <Controls />', () => {
    const props = {
      showStatus: false,
      videoLength: 3,
    };
    const wrapper = shallow(<Recorder {...props} />);
    const actual = wrapper.find('Controls').length;
    const expected = 1;
    expect(actual).toEqual(expected);
  });
});
