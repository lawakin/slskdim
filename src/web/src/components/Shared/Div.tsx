import type { HTMLAttributes } from 'react';

const Div = ({
  children,
  hidden,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  readonly hidden?: boolean;
}) => {
  if (hidden) return null;
  return <div {...rest}>{children}</div>;
};

export default Div;
