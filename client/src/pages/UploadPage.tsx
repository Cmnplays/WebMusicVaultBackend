import React, { useState } from "react";
import axios from "axios";

const MAX_FILES = 3;

const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    if (selectedFiles.length > MAX_FILES) {
      alert(`You can upload a maximum of ${MAX_FILES} files.`);
      // Reset input to prevent selection of too many files
      e.target.value = "";
      setFiles(null);
      return;
    }

    setFiles(selectedFiles);
    setMessage(null);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setMessage("Please select audio files to upload.");
      return;
    }

    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("songs", file);
    }

    try {
      setUploading(true);
      setMessage(null);

      await axios.post("/api/v1/songs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / (event.total ?? 1));
          setProgress(percent);
        },
      });

      setMessage("🎉 Upload successful!");
      setFiles(null);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      setMessage(
        axiosError.response?.data?.message || "❌ Upload failed. Try again."
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 min-h-screen flex flex-col justify-center bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
        Upload Songs
      </h2>

      <label
        htmlFor="file-upload"
        className="block mb-5 cursor-pointer rounded-lg border-2 border-dashed border-blue-400 p-6 text-center hover:border-blue-600 transition-colors"
      >
        <input
          id="file-upload"
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <svg
          className="mx-auto mb-3 h-10 w-10 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m-4-4l4-4 4 4"
          />
        </svg>
        <span className="text-blue-600 font-medium text-sm">
          Tap here to select up to {MAX_FILES} audio files
        </span>
      </label>

      {files && files.length > 0 && (
        <div className="mb-4 max-h-32 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50 text-gray-800 text-sm">
          <strong className="block mb-1">
            Selected files ({files.length}):
          </strong>
          <ul className="space-y-1">
            {Array.from(files).map((file) => (
              <li key={file.name} className="truncate" title={file.name}>
                {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
              </li>
            ))}
          </ul>
        </div>
      )}

      {uploading && (
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 font-medium text-sm">
            Uploading... {progress}%
          </label>
          <progress
            value={progress}
            max={100}
            className="w-full h-3 rounded bg-blue-100 overflow-hidden"
          />
        </div>
      )}

      {message && (
        <div
          className={`mb-4 p-3 rounded text-center text-sm ${
            message.startsWith("❌")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
          role="alert"
        >
          {message}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || !files || files.length === 0}
        className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
          uploading || !files || files.length === 0
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </main>
  );
};

export default UploadPage;
