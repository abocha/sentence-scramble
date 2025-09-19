import React from 'react';

import Button from '../Button';

interface TeacherInstructionsCardProps {
  instructionsTemplate: string;
  onTemplateChange: (value: string) => void;
  showInstructionsEditor: boolean;
  onToggleEditor: () => void;
  instructionsPreview: string;
  isUsingDefaultTemplate: boolean;
  onResetTemplate: () => void;
}

const TeacherInstructionsCard: React.FC<TeacherInstructionsCardProps> = ({
  instructionsTemplate,
  onTemplateChange,
  showInstructionsEditor,
  onToggleEditor,
  instructionsPreview,
  isUsingDefaultTemplate,
  onResetTemplate,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Student instructions</h3>
          <p className="text-sm text-gray-500 mt-1">These instructions are included when you copy and share the assignment.</p>
        </div>
        <Button
          onClick={onToggleEditor}
          variant="tertiary"
          className="sm:w-auto"
        >
          {showInstructionsEditor ? 'Hide customization' : 'Customize instructions'}
        </Button>
      </div>

      {showInstructionsEditor ? (
        <div className="mt-4 space-y-3">
          <label htmlFor="instructions-template" className="block text-sm font-medium text-gray-700">Instructions template</label>
          <p className="text-sm text-gray-500">
            Use placeholders like <code>{'{{title}}'}</code>, <code>{'{{link}}'}</code>, <code>{'{{attempts}}'}</code>, and <code>{'{{date}}'}</code> to auto-fill details.
          </p>
          <textarea
            id="instructions-template"
            rows={6}
            value={instructionsTemplate}
            onChange={(event) => onTemplateChange(event.target.value)}
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onResetTemplate}
              variant="neutral"
              className="sm:w-auto"
              disabled={isUsingDefaultTemplate}
            >
              Reset to default
            </Button>
          </div>
          <div className="bg-white border border-gray-200 rounded-md p-3 overflow-hidden">
            <h4 className="text-sm font-semibold text-gray-700">Preview</h4>
            <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700">{instructionsPreview}</pre>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-gray-600">
            {isUsingDefaultTemplate
              ? 'Using the default instructions. You can customize them if needed.'
              : 'Using your saved custom instructions.'}
          </p>
          <div className="mt-2 bg-gray-50 border border-dashed border-gray-300 rounded-md p-3 overflow-hidden">
            <pre className="whitespace-pre-wrap break-words text-xs text-gray-600">{instructionsPreview}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherInstructionsCard;
