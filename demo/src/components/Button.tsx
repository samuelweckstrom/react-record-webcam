import React from 'react';

type ButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  toggled?: boolean;
  inverted?: boolean;
  disabled?: boolean;
  className?: string;
};

export function Button(props: ButtonProps) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      className={`
        rounded-lg
        px-2
        disabled:opacity-50
        ${props.inverted ? 'text-white' : 'text-black'}
        ${
          props.toggled
            ? 'bg-red-500'
            : props.inverted
            ? 'bg-gray-800'
            : 'bg-white'
        }
      ${props.className ? props.className : ''}`}
    >
      {props.children}
    </button>
  );
}
