import React from "react";
import type { Word } from "../types";

interface WordButtonProps {
  word: Word;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, wordId: string) => void;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>, wordId: string) => void;
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
  onClick?: (wordId: string) => void;
}

const WordButton: React.FC<WordButtonProps> = ({
  word,
  onDragStart,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onClick,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, word.id)}
      onTouchStart={(e) => onTouchStart(e, word.id)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={() => onClick?.(word.id)}
      className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer cursor-grab active:cursor-grabbing hover:bg-blue-100 hover:border-blue-400 transition-all duration-150 select-none touch-none"
    >
      {word.text}
    </div>
  );
};

export default WordButton;
