import { useState } from "react";
import api from "../../api/axios";
import Header from "../Header";



export default function PdfUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("pdf", file);

      await api.post("/pdf/upload", formData);

      setFile(null);
      setError("");
      onUploadSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header />

    <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-1">
        Upload Study Material
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Upload a PDF to generate notes, flashcards, formulas, and quizzes.
      </p>

      {error && (
        <p className="text-red-400 mb-3">{error}</p>
      )}

      {/*<div className="flex items-center gap-4">*/}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <input
  type="file"
  accept="application/pdf"
  onChange={(e) => setFile(e.target.files[0])}
  className="text-sm text-gray-300
             file:mr-4 file:py-2 file:px-4
             file:rounded-md file:border
             file:border-white/20
             file:bg-white/10
             file:text-white
             hover:file:bg-white/20
             transition"
/>


        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`px-6 py-2 rounded-md font-medium transition
            ${
              loading || !file
                ? "bg-blue-500/40 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
    </>
  );
}
