import React from 'react';

type SelectProps = {
  items: { label: string; deviceId: string }[];
  dataset: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
};

export function Select(props: SelectProps) {
  return (
    <select
      className="input p2 text-black px-2 rounded-lg ml-2"
      onChange={props.onChange}
    >
      {props.items.map((item) => {
        const dataAttr = {
          [`data-${props.dataset}`]: item.deviceId,
        };
        return (
          <option key={item.deviceId} value={item.deviceId} {...dataAttr}>
            {item.label}
          </option>
        );
      })}
    </select>
  );
}
