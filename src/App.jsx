import { useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const quickReferences = [
  { title: "Torque Schedule", file: "/quick-references/Torque-schedule.pdf" },
  { title: "Cabinet wiring", file: "/quick-references/Cabinet-wiring-2.0.pdf" },
  { title: "Cabinet major components", file: "/quick-references/Cabinet-major-components-2.0.pdf" },
];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [previousScreen, setPreviousScreen] = useState("home");
  const [selectedPdf, setSelectedPdf] = useState("/assmguide1.pdf");
  const [viewerTitle, setViewerTitle] = useState("My Build");

  if (screen === "pdf-viewer") {
    return (
      <PdfViewerScreen
        title={viewerTitle}
        fileUrl={selectedPdf}
        goBack={() => setScreen(previousScreen)}
      />
    );
  }

  if (screen === "quick-references") {
    return (
      <QuickReferencesScreen
        goHome={() => setScreen("home")}
        onOpenPdf={(title, file) => {
          setViewerTitle(title);
          setSelectedPdf(file);
          setPreviousScreen("quick-references");
          setScreen("pdf-viewer");
        }}
      />
    );
  }

  return (
    <div style={{ height: "100vh", padding: 20, boxSizing: "border-box" }}>
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>Assembly App</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 20,
          height: "calc(100vh - 120px)",
        }}
      >
        <button
          style={buttonStyle}
          onClick={() => {
            setViewerTitle("My Build");
            setSelectedPdf("/assmguide1.pdf");
            setPreviousScreen("home");
            setScreen("pdf-viewer");
          }}
        >
          My Build
        </button>

        <button
          style={buttonStyle}
          onClick={() => setScreen("quick-references")}
        >
          Quick References
        </button>

        <button style={buttonStyle}>Service Tickets</button>
        <button style={buttonStyle}>Help</button>
      </div>
    </div>
  );
}

function QuickReferencesScreen({ goHome, onOpenPdf }) {
  return (
    <div
      style={{
        height: "100vh",
        padding: 20,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>Quick References</h1>
        <button style={smallButtonStyle} onClick={goHome}>
          Back
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        {quickReferences.map((ref) => (
          <button
            key={ref.file}
            style={cardButtonStyle}
            onClick={() => onOpenPdf(ref.title, ref.file)}
          >
            {ref.title}
          </button>
        ))}
      </div>
    </div>
  );
}

function PdfViewerScreen({ title, fileUrl, goBack }) {
  const layoutPlugin = defaultLayoutPlugin();

  return (
    <div
      style={{
        height: "100vh",
        padding: 16,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>{title}</h1>
        <button style={smallButtonStyle} onClick={goBack}>
          Back
        </button>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          border: "1px solid #444",
          borderRadius: 12,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <Viewer fileUrl={fileUrl} plugins={[layoutPlugin]} />
        </Worker>
      </div>
    </div>
  );
}

const buttonStyle = {
  fontSize: "24px",
  padding: "40px",
  borderRadius: "10px",
  cursor: "pointer",
};

const smallButtonStyle = {
  fontSize: "16px",
  padding: "12px 18px",
  borderRadius: "8px",
  cursor: "pointer",
};

const cardButtonStyle = {
  fontSize: "20px",
  padding: "30px",
  minHeight: "120px",
  borderRadius: "12px",
  cursor: "pointer",
  textAlign: "center",
};