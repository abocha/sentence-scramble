import React from 'react';

interface TrashIconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

const TrashIcon: React.FC<TrashIconProps> = ({ title = 'Delete', ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={title ? undefined : true}
    role={title ? 'img' : 'presentation'}
    {...props}
  >
    {title ? <title>{title}</title> : null}
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
  </svg>
);

export default TrashIcon;
