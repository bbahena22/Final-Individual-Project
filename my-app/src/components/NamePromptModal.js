import React, { useEffect, useState } from 'react';

function NamePromptModal({
  open,
  title,
  label,
  initialValue = '',
  confirmLabel = 'Save',
  cancelLabel = 'Cancel',
  onSubmit,
  onCancel,
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{label}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-indigo-500"
            placeholder={label}
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NamePromptModal;
