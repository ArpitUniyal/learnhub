import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function PdfList({ pdfs = [], onDelete }) {
  const navigate = useNavigate();

  const handleDelete = async (e, pdfId) => {
    e.stopPropagation();

    try {
      await api.delete(`/pdf/${pdfId}`);
      onDelete();
    } catch (err) {
      console.error("Failed to delete PDF", err);
    }
  };

  if (!pdfs.length) {
    return <p>No PDFs uploaded yet.</p>;
  }

  return (
    <div className="pdf-list">
      {pdfs.map((pdf) => {
        // ✅ SAFE NAME RESOLUTION
        const fileName =
  pdf.original_name ||   // ✅ REAL uploaded name (Unit V (1).pdf)
  pdf.file_name ||       // fallback (server filename)
  "Untitled PDF";



        // ✅ SAFE SIZE RESOLUTION
        const rawSize =
          pdf.size ??
          pdf.file_size ??
          pdf.filesize ??
          0;

        const sizeKB =
          typeof rawSize === "number" && rawSize > 0
            ? (rawSize / 1024).toFixed(1)
            : "0.0";

        return (
          <div
            key={pdf.id}
            className="pdf-card"
            onClick={() => navigate(`/pdf/${pdf.id}`)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              marginBottom: "12px",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            <div>
              <h4
  style={{
    color: "#4f8cff",
    fontWeight: 500,
    margin: 0,
    cursor: "pointer",
    textDecoration: "none",
  }}
  onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
  onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
>
  {fileName}
</h4>

              <p style={{ margin: "6px 0 0", opacity: 0.7 }}>
                {sizeKB} KB
              </p>
            </div>

            <button
              className="delete-btn"
              onClick={(e) => handleDelete(e, pdf.id)}
              style={{ color: "#ff4d4f" }}
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}
