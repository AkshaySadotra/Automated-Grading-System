import React, { useRef } from 'react';
import { UploadCloud, Play, FileArchive, X } from 'lucide-react';
import './UploadInput.css';

const UploadInput = ({ onRun, isLoading, studyFile, setStudyFile, assignmentFile, setAssignmentFile }) => {
    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file && file.name.endsWith('.zip')) {
            if (type === 'study') setStudyFile(file);
            else setAssignmentFile(file);
        } else {
            alert('Please upload a .zip file');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (studyFile && assignmentFile) {
            onRun();
        }
    };

    const FileDropZone = ({ label, file, setFile, id }) => {
        const inputRef = useRef(null);

        return (
            <div
                className={`drop-zone ${file ? 'has-file' : ''}`}
                onClick={() => inputRef.current.click()}
            >
                <input
                    type="file"
                    accept=".zip"
                    style={{ display: 'none' }}
                    ref={inputRef}
                    onChange={(e) => handleFileChange(e, id)}
                />

                {file ? (
                    <div className="file-info">
                        <FileArchive size={24} className="file-icon" />
                        <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <button
                            className="remove-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="empty-zone">
                        <UploadCloud size={24} className="upload-icon" />
                        <span>Click to upload {label} (.zip)</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="input-panel">
            <div className="panel-header">
                <UploadCloud size={20} className="panel-icon" />
                <h2>Data Upload Console</h2>
            </div>

            <form onSubmit={handleSubmit} className="input-form">
                <div className="input-group">
                    <label>Study Materials</label>
                    <FileDropZone
                        label="Study Materials"
                        file={studyFile}
                        setFile={setStudyFile}
                        id="study"
                    />
                </div>

                <div className="input-group">
                    <label>Student Assignments</label>
                    <FileDropZone
                        label="Assignments"
                        file={assignmentFile}
                        setFile={setAssignmentFile}
                        id="assignment"
                    />
                </div>

                <button
                    type="submit"
                    className={`run-button ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading || !studyFile || !assignmentFile}
                >
                    {isLoading ? (
                        <span className="loader"></span>
                    ) : (
                        <>
                            <Play size={18} fill="currentColor" />
                            Upload Files
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default UploadInput;
