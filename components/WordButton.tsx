import React from 'react';
import type { Word } from '../types';

interface WordButtonProps {
  word: Word;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, wordId: string) => void;
  onClick?: (wordId: string) => void;
}

const WordButton: React.FC<WordButtonProps> = ({ word, onDragStart, onClick }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, word.id)}
      onClick={() => onClick?.(word.id)}
      className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer cursor-grab active:cursor-grabbing hover:bg-blue-100 hover:border-blue-400 transition-all duration-150 select-none"
    >
      {word.text}
    </div>
  );
};

export default WordButton;