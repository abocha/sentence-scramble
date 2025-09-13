import React from 'react';

interface HeaderProps {
  title?: string;
  version?: number;
}

const Header: React.FC<HeaderProps> = ({ title, version }) => {
  return (
    <header className="w-full max-w-4xl mx-auto flex flex-col justify-center items-center text-center">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
        Sentence <span className="text-blue-600">Scramble</span>
      </h1>
      {title && (
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mt-2">
          {title}
          {version && <span className="text-sm font-normal text-gray-500 ml-2">(v{version})</span>}
        </h2>
      )}
    </header>
  );
};

export default Header;
