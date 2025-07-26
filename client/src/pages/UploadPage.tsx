import axios from "axios";
import React, { useRef, useState } from "react";

const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileClick = () => {
    inputRef.current?.click();
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMsg(null);
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (files.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("songs", file));

    setIsUploading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/song/upload",
        formData
      );
      setSuccessMsg("Upload successful!");
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      console.log("Server response:", response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 409) {
          setError("Upload failed: File already exists.");
        } else {
          setError(
            `Upload failed: ${err.response.data?.message || "Unknown error"}`
          );
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 border rounded-lg bg-white shadow-md">
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="flex flex-col gap-4"
      >
        <div
          onClick={handleFileClick}
          className="border-2 border-dashed border-gray-400 rounded-md p-6 cursor-pointer text-center text-gray-600 hover:border-purple-600 transition-colors"
        >
          {files.length > 0 ? (
            <div className="space-y-1">
              <p className="font-semibold text-gray-800">Selected files:</p>
              <ul className="text-sm text-gray-700 max-h-32 overflow-auto">
                {files.map((file, idx) => (
                  <li key={idx} className="truncate" title={file.name}>
                    {file.name}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gray-500">
                Click to change files
              </p>
            </div>
          ) : (
            <>
              <p className="text-lg font-semibold">
                Click here to select files
              </p>
              <p className="text-xs text-gray-400">
                (or drag and drop files here)
              </p>
            </>
          )}
          <input
            type="file"
            name="songs"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={handleFilesChange}
            ref={inputRef}
          />
        </div>

        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
        {successMsg && (
          <p className="text-green-600 text-sm font-medium">{successMsg}</p>
        )}

        <button
          type="submit"
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default UploadPage;
