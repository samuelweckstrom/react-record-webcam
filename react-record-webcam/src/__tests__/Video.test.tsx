import React from 'react';
import { shallow } from 'enzyme';
import Video from '../Video';

describe('<Video />', () => {
  it('should pass props to DOM', () => {
    const props = {
      autoPlay: true,
      muted: true,
      loop: true,
      style: {},
    };
    const wrapper = shallow(<Video {...props} />);
    const actual = Object.entries(props).every(
      ([key, value]) => wrapper.props()[key] === value
    );
    const expected = true;
    expect(actual).toEqual(expected);
  });
});
