import React, { memo, useRef } from 'react';
import { FaDownload, FaUpload } from 'react-icons/fa';

const DataTools = memo(({ onExport, onImport }) => {
  const fileInputRef = useRef(null);

  const importFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onImport(String(reader.result || ''));
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="d-flex flex-wrap gap-2 mb-4">
      <button type="button" className="btn btn-outline-secondary" onClick={onExport}>
        <FaDownload aria-hidden="true" /> Export CSV
      </button>
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => fileInputRef.current?.click()}
      >
        <FaUpload aria-hidden="true" /> Import CSV
      </button>
      <input
        ref={fileInputRef}
        aria-label="Import CSV"
        className="visually-hidden"
        type="file"
        accept=".csv,text/csv"
        onChange={importFile}
      />
    </div>
  );
});

export default DataTools;
