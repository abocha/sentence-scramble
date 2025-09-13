import React from 'react';
import type { Word } from '../types';

interface WordButtonProps {
  word: Word;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, wordId: string) => void;
  onClick?: (wordId: string) => void;
  draggable?: boolean;
}

const WordButton: React.FC<WordButtonProps> = ({ word, onDragStart, onClick, draggable = true }) => {
  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? (e) => onDragStart(e, word.id) : undefined}
      onClick={() => onClick?.(word.id)}
      className={`px-4 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-sm select-none ${draggable ? 'cursor-pointer cursor-grab active:cursor-grabbing hover:bg-blue-100 hover:border-blue-400' : 'opacity-60 cursor-default'}`}
    >
      {word.text}
    </div>
  );
};

export default WordButton;