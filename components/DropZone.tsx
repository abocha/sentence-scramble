import React, { useState, useRef, useEffect } from "react";
import type { Word } from "../types";
import WordButton from "./WordButton";
import DropIndicator from "./DropIndicator";

interface TouchDragData {
  wordId: string;
  sourceZoneId: string;
}

let touchDragData: TouchDragData | null = null;

interface DropZoneProps {
  id: string;
  words: Word[];
  title: string;
  onDrop: (wordId: string, sourceZoneId: string, index?: number) => void;
  onWordClick?: (wordId: string) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  isSentenceZone?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({
  id,
  words,
  title,
  onDrop,
  onWordClick,
  isDragging,
  setIsDragging,
  isSentenceZone = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    wordId: string,
  ) => {
    e.dataTransfer.setData("wordId", wordId);
    e.dataTransfer.setData("sourceZoneId", id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDragOver(false);
    setDropIndex(null);
  };

  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    wordId: string,
  ) => {
    touchDragData = { wordId, sourceZoneId: id };
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleTouchEnd = () => {};

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);

    if (isSentenceZone) {
      const container = containerRef.current;
      if (!container) return;

      const draggableElements = [
        ...container.querySelectorAll('[draggable="true"]'),
      ] as HTMLElement[];
      let closest = { distance: Number.POSITIVE_INFINITY, index: words.length };

      draggableElements.forEach((child, index) => {
        const box = child.getBoundingClientRect();
        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.hypot(dx, dy);
        if (distance < closest.distance) {
          closest = {
            distance,
            index: e.clientX < centerX ? index : index + 1,
          };
        }
      });

      setDropIndex(closest.index);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
    setDropIndex(null);
  };

  const handleDropEvent = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const wordId = e.dataTransfer.getData("wordId");
    const sourceZoneId = e.dataTransfer.getData("sourceZoneId");
    if (wordId && sourceZoneId) {
      onDrop(wordId, sourceZoneId, dropIndex ?? undefined);
    }
    setIsDragOver(false);
    setIsDragging(false);
    setDropIndex(null);
  };

  useEffect(() => {
    const handleWindowTouchMove = (e: TouchEvent) => {
      if (!touchDragData) return;
      const touch = e.touches[0];
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const within =
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom;

      if (within) {
        setIsDragOver(true);
        if (isSentenceZone) {
          const draggableElements = [
            ...container.querySelectorAll('[draggable="true"]'),
          ] as HTMLElement[];
          let closest = { distance: Number.POSITIVE_INFINITY, index: words.length };

          draggableElements.forEach((child, index) => {
            const box = child.getBoundingClientRect();
            const centerX = box.left + box.width / 2;
            const centerY = box.top + box.height / 2;
            const dx = touch.clientX - centerX;
            const dy = touch.clientY - centerY;
            const distance = Math.hypot(dx, dy);
            if (distance < closest.distance) {
              closest = {
                distance,
                index: touch.clientX < centerX ? index : index + 1,
              };
            }
          });

          setDropIndex(closest.index);
        }
      } else {
        setIsDragOver(false);
        setDropIndex(null);
      }
    };

    const handleWindowTouchEnd = (e: TouchEvent) => {
      if (!touchDragData) return;
      const touch = e.changedTouches[0];
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const within =
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom;

      if (within) {
        const { wordId, sourceZoneId } = touchDragData;
        onDrop(
          wordId,
          sourceZoneId,
          isSentenceZone ? dropIndex ?? undefined : undefined,
        );
        setIsDragging(false);
        touchDragData = null;
      } else {
        setTimeout(() => {
          if (touchDragData) {
            setIsDragging(false);
            touchDragData = null;
          }
        }, 0);
      }

      setIsDragOver(false);
      setDropIndex(null);
    };

    window.addEventListener("touchmove", handleWindowTouchMove, { passive: false });
    window.addEventListener("touchend", handleWindowTouchEnd);

    return () => {
      window.removeEventListener("touchmove", handleWindowTouchMove);
      window.removeEventListener("touchend", handleWindowTouchEnd);
    };
  }, [isSentenceZone, onDrop, words, dropIndex, setIsDragging]);

  const baseClasses =
    "w-full min-h-[100px] p-4 rounded-lg border-2 border-dashed transition-all duration-200";
  const stateClasses =
    isDragOver && !isSentenceZone
      ? "border-blue-500 bg-blue-50"
      : "border-gray-300";
  const emptyClasses =
    words.length === 0 && isSentenceZone
      ? "flex items-center justify-center text-gray-400"
      : "flex flex-wrap gap-3 items-center";

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-700">{title}</h3>
      <div
        id={id}
        ref={containerRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropEvent}
        onDragEnd={handleDragEnd}
        className={`${baseClasses} ${stateClasses} ${emptyClasses}`}
      >
        {words.length === 0 && isSentenceZone ? (
          isDragOver ? (
            <DropIndicator />
          ) : (
            <span className="italic">Drop words here...</span>
          )
        ) : (
          words.map((word, index) => (
            <React.Fragment key={word.id}>
              {isSentenceZone && isDragOver && dropIndex === index && (
                <DropIndicator />
              )}
              <WordButton
                word={word}
                onDragStart={handleDragStart}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={onWordClick}
              />
            </React.Fragment>
          ))
        )}
        {isSentenceZone &&
          isDragOver &&
          dropIndex === words.length &&
          words.length > 0 && <DropIndicator />}
      </div>
    </div>
  );
};

export default DropZone;
