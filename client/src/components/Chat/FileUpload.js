import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileText, File, AlertCircle, CheckCircle } from 'lucide-react';

const FileUpload = ({ onUpload, onClose }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      status: 'pending',
      progress: 0
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    
    // Simulate file upload process
    for (let i = 0; i < uploadedFiles.length; i++) {
      const fileObj = uploadedFiles[i];
      
      // Update status to processing
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, status: 'processing' } : f
      ));

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Update status to completed
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, status: 'completed', progress: 100 } : f
      ));
    }

    setIsUploading(false);
    
    // Call onUpload with the files
    const files = uploadedFiles.map(f => f.file);
    onUpload(files);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FileText className="w-4 h-4 text-dark-400" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <FileText className="w-4 h-4 text-dark-400" />;
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-400" />;
      case 'doc':
      case 'docx':
        return <File className="w-5 h-5 text-blue-400" />;
      case 'txt':
        return <FileText className="w-5 h-5 text-green-400" />;
      default:
        return <File className="w-5 h-5 text-dark-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-dark-800 border border-dark-600 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Upload Documents for RAG</h2>
          <button
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragActive
              ? 'border-neon-blue bg-neon-blue/10'
              : 'border-dark-600 hover:border-dark-500'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-dark-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-dark-400">
            or click to select files
          </p>
          <p className="text-sm text-dark-500 mt-2">
            Supports PDF, DOC, DOCX, TXT (max 10MB each)
          </p>
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-white font-medium mb-3">Selected Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map((fileObj) => (
                <motion.div
                  key={fileObj.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3 p-3 bg-dark-700 rounded-lg"
                >
                  {getFileIcon(fileObj.file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {fileObj.file.name}
                    </p>
                    <p className="text-dark-400 text-xs">
                      {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(fileObj.status)}
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="p-1 text-dark-400 hover:text-red-400 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-dark-400 hover:text-white transition-colors duration-200"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={uploadedFiles.length === 0 || isUploading}
            className="px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-purple text-white rounded-lg hover:shadow-neon transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Processing...' : 'Upload & Process'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FileUpload;
