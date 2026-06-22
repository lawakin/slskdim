import type { ReactNode } from 'react';

const Switch = ({
  children,
  ...rest
}: {
  readonly children?: ReactNode;
  readonly [key: string]: ReactNode;
}) => {
  const values = Object.values(rest);

  for (const value of values) {
    if (value) return value as React.JSX.Element;
  }

  return children as React.JSX.Element;
};

export default Switch;
