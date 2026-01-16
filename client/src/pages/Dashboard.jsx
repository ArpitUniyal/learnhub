import { useEffect, useState } from "react";
import api from "../api/axios";
import PdfUpload from "../components/pdf/PdfUpload";
import PdfList from "../components/pdf/PdfList";

export default function Dashboard() {
  const [pdfs, setPdfs] = useState([]); // ALWAYS ARRAY
  const [loading, setLoading] = useState(true);

  const fetchPdfs = async () => {
    try {
      setLoading(true);

      // ✅ EXACT BACKEND ROUTE
      const res = await api.get("/pdf");

      // Backend returns ARRAY
      setPdfs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setPdfs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  return (
    <>
      <PdfUpload onUploadSuccess={fetchPdfs} />

      {loading && <p>Loading PDFs...</p>}

      {!loading && (
        <PdfList pdfs={pdfs} onDelete={fetchPdfs} />
      )}
    </>
  );
}
