import { useEffect, useMemo, useRef, useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const quickReferences = [
  { title: "Torque Schedule", file: "/quick-references/Torque-schedule.pdf" },
  { title: "Cabinet wiring", file: "/quick-references/Cabinet-wiring-2.0.pdf" },
  {
    title: "Cabinet major components",
    file: "/quick-references/Cabinet-major-components-2.0.pdf",
  },
];

const sectionTemplate = [
  {
    id: "safety-prechecks",
    title: "Safety Prechecks",
    startPage: 1,
    endPage: 3,
    requiresSignoff: true,
  },
  {
    id: "baseframe-assembly",
    title: "Baseframe Assembly",
    startPage: 4,
    endPage: 9,
    requiresSignoff: true,
  },
  {
    id: "cabinet-assembly",
    title: "Cabinet Assembly",
    startPage: 10,
    endPage: 16,
    requiresSignoff: true,
  },
  {
    id: "wiring",
    title: "Wiring",
    startPage: 17,
    endPage: 24,
    requiresSignoff: true,
  },
  {
    id: "final-inspection",
    title: "Final Inspection",
    startPage: 25,
    endPage: 28,
    requiresSignoff: true,
  },
];

const fakeBuild = {
  buildId: "ESS-001",
  serialNumber: "SN-001",
  revision: "06.2.5",
  pdfUrl: "/assmguide1.pdf",
  currentSectionId: "safety-prechecks",
  sections: sectionTemplate.map((section, index) => ({
    ...section,
    status: index === 0 ? "available" : "locked",
    signed: false,
    signedBy: "",
    signedAt: "",
    signatureDataUrl: "",
  })),
};

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [previousScreen, setPreviousScreen] = useState("home");
  const [selectedPdf, setSelectedPdf] = useState("/assmguide1.pdf");
  const [viewerTitle, setViewerTitle] = useState("My Build");

  const [build, setBuild] = useState(fakeBuild);
  const [activeSectionId, setActiveSectionId] = useState(
    fakeBuild.currentSectionId
  );

  const [scannedUnit, setScannedUnit] = useState("");

  if (screen === "splash") {
    return <SplashScreen onDone={() => setScreen("scan")} />;
  }

  if (screen === "scan") {
    return (
      <ScanScreen
        onScan={(unitId) => {
          setScannedUnit(unitId);
          setBuild((prev) => ({
            ...prev,
            buildId: unitId,
          }));
          setScreen("unit-confirmed");
        }}
      />
    );
  }

  if (screen === "unit-confirmed") {
    return (
      <UnitConfirmedScreen
        unitId={scannedUnit}
        onContinue={() => setScreen("home")}
      />
    );
  }

  if (screen === "my-build") {
    return (
      <MyBuildScreen
        build={build}
        activeSectionId={activeSectionId}
        setActiveSectionId={setActiveSectionId}
        setBuild={setBuild}
        goBack={() => setScreen("home")}
      />
    );
  }

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
    <HomeScreen
      build={build}
      onOpenMyBuild={() => setScreen("my-build")}
      onOpenQuickReferences={() => setScreen("quick-references")}
    />
  );
}

function SplashScreen({ onDone }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const doneTimer = setTimeout(() => onDone(), 2600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#ffffff",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.8s ease",
      }}
    >
      <img
        src="/logo2.png"
        alt="Company Logo"
        style={{
          width: "40vw",
          maxWidth: 300,
          minWidth: 150,
          objectFit: "contain",
        }}
      />
    </div>
  );
}

function ScanScreen({ onScan }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8f8f8",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 700,
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 16,
          padding: 32,
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h1>Scan Build QR Code</h1>
        <p style={{ color: "#555", marginBottom: 30 }}>
          For now this is a test button. Later this will use the tablet camera.
        </p>

        <div
          style={{
            margin: "0 auto 24px",
            width: 240,
            height: 240,
            border: "2px dashed #999",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#777",
            fontSize: 18,
          }}
        >
          QR Scanner Area
        </div>

        <button style={bigButtonStyle} onClick={() => onScan("ESS-001")}>
          Simulate Scan ESS-001
        </button>
      </div>
    </div>
  );
}

function UnitConfirmedScreen({ unitId, onContinue }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8f8f8",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 700,
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 16,
          padding: 32,
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h1>Your unit is {unitId}</h1>
        <p style={{ color: "#555", marginBottom: 30 }}>
          Build has been loaded. Continue to the home screen.
        </p>

        <button style={bigButtonStyle} onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ build, onOpenMyBuild, onOpenQuickReferences }) {
  return (
    <div style={{ height: "100vh", padding: 20, boxSizing: "border-box" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: 0 }}>Assembly App</h1>
        <div
          style={{
            padding: "10px 16px",
            border: "1px solid #ddd",
            borderRadius: 10,
            background: "#fafafa",
            fontWeight: 600,
          }}
        >
          Unit: {build.buildId}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 20,
          height: "calc(100vh - 120px)",
        }}
      >
        <button style={buttonStyle} onClick={onOpenMyBuild}>
          My Build
        </button>

        <button style={buttonStyle} onClick={onOpenQuickReferences}>
          Quick References
        </button>

        <button style={buttonStyle}>Service Tickets</button>
        <button style={buttonStyle}>Help</button>
      </div>
    </div>
  );
}

function MyBuildScreen({
  build,
  activeSectionId,
  setActiveSectionId,
  setBuild,
  goBack,
}) {
  const [showSignModal, setShowSignModal] = useState(false);

  const activeSection = useMemo(
    () => build.sections.find((section) => section.id === activeSectionId),
    [build.sections, activeSectionId]
  );

  const layoutPlugin = defaultLayoutPlugin();

  const completeSectionWithSignature = ({ signerName, signatureDataUrl }) => {
    const currentIndex = build.sections.findIndex(
      (section) => section.id === activeSectionId
    );

    if (currentIndex === -1) return;

    const currentSection = build.sections[currentIndex];

    if (
      currentSection.status === "locked" ||
      currentSection.status === "completed"
    ) {
      return;
    }

    const signedAt = new Date().toLocaleString();

    const updatedSections = build.sections.map((section, index) => {
      if (index === currentIndex) {
        return {
          ...section,
          signed: true,
          signedBy: signerName,
          signedAt,
          signatureDataUrl,
          status: "completed",
        };
      }

      if (index === currentIndex + 1 && section.status === "locked") {
        return {
          ...section,
          status: "available",
        };
      }

      return section;
    });

    const nextSection = updatedSections[currentIndex + 1];

    setBuild({
      ...build,
      currentSectionId: nextSection ? nextSection.id : build.currentSectionId,
      sections: updatedSections,
    });

    if (nextSection) {
      setActiveSectionId(nextSection.id);
    }

    setShowSignModal(false);
  };

  return (
    <>
      <div
        style={{
          height: "100vh",
          padding: 16,
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 16,
        }}
      >
        <div
          style={{
            border: "1px solid #444",
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflow: "auto",
          }}
        >
          <div
            style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
          >
            <h2 style={{ margin: 0 }}>My Build</h2>
            <button style={smallButtonStyle} onClick={goBack}>
              Back
            </button>
          </div>

          <div style={infoCardStyle}>
            <div>
              <strong>Build ID:</strong> {build.buildId}
            </div>
            <div>
              <strong>Serial:</strong> {build.serialNumber}
            </div>
            <div>
              <strong>Revision:</strong> {build.revision}
            </div>
          </div>

          <div>
            <h3 style={{ marginTop: 0 }}>Sections</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {build.sections.map((section) => {
                const isActive = section.id === activeSectionId;
                const isLocked = section.status === "locked";

                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      if (!isLocked) {
                        setActiveSectionId(section.id);
                      }
                    }}
                    style={{
                      ...sectionButtonStyle,
                      opacity: isLocked ? 0.55 : 1,
                      border: isActive
                        ? "2px solid #2563eb"
                        : "1px solid #555",
                      backgroundColor:
                        section.status === "completed"
                          ? "#e8f5e9"
                          : section.status === "available"
                          ? "#fff"
                          : "#f3f4f6",
                      cursor: isLocked ? "not-allowed" : "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{section.title}</div>
                    <div style={{ fontSize: 14, marginTop: 6 }}>
                      Pages {section.startPage}-{section.endPage}
                    </div>
                    <div style={{ fontSize: 14, marginTop: 6 }}>
                      Status: {section.status}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #444",
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>
                {activeSection?.title || "No section selected"}
              </h2>
              {activeSection && (
                <div style={{ marginTop: 8, fontSize: 15 }}>
                  Pages {activeSection.startPage}-{activeSection.endPage} •
                  Status: {activeSection.status}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                style={smallButtonStyle}
                disabled={!activeSection || activeSection.status !== "available"}
                onClick={() => setShowSignModal(true)}
              >
                {activeSection?.signed ? "Signed Off" : "Tap to Sign"}
              </button>

              <button style={smallButtonStyle}>Create Service Ticket</button>
            </div>
          </div>

          <div
            style={{
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 10,
              background: "#fafafa",
              fontSize: 15,
            }}
          >
            {activeSection ? (
              <>
                <div>
                  <strong>Current section:</strong> {activeSection.title}
                </div>
                <div style={{ marginTop: 6 }}>
                  This section is linked to pages {activeSection.startPage}-
                  {activeSection.endPage} in the main assembly PDF.
                </div>
                <div style={{ marginTop: 6 }}>
                  Required signoff: {activeSection.requiresSignoff ? "Yes" : "No"}
                </div>

                {activeSection.signed && (
                  <div style={{ marginTop: 10 }}>
                    <div>
                      <strong>Signed by:</strong> {activeSection.signedBy}
                    </div>
                    <div>
                      <strong>Signed at:</strong> {activeSection.signedAt}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>Select a section to continue.</div>
            )}
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
              <Viewer fileUrl={build.pdfUrl} plugins={[layoutPlugin]} />
            </Worker>
          </div>
        </div>
      </div>

      {showSignModal && activeSection && (
        <SignatureModal
          buildId={build.buildId}
          sectionTitle={activeSection.title}
          onCancel={() => setShowSignModal(false)}
          onSave={completeSectionWithSignature}
        />
      )}
    </>
  );
}

function SignatureModal({ buildId, sectionTitle, onCancel, onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (event.touches && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(event);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (event) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(event);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (!hasDrawn) {
      alert("Please draw a signature.");
      return;
    }

    if (!signerName.trim()) {
      alert("Please enter your name.");
      return;
    }

    const signatureDataUrl = canvasRef.current.toDataURL("image/png");

    onSave({
      signerName: signerName.trim(),
      signatureDataUrl,
    });
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalCardStyle}>
        <h2 style={{ marginTop: 0 }}>Tap to Sign</h2>

        <div style={{ marginBottom: 12 }}>
          <strong>Build:</strong> {buildId}
        </div>
        <div style={{ marginBottom: 20 }}>
          <strong>Section:</strong> {sectionTitle}
        </div>

        <div style={{ marginBottom: 10, fontWeight: 600 }}>
          Draw signature below
        </div>

        <canvas
          ref={canvasRef}
          width={600}
          height={220}
          style={signatureCanvasStyle}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        <div style={{ marginTop: 12 }}>
          <button style={smallButtonStyle} onClick={clearSignature}>
            Clear Signature
          </button>
        </div>

        <div style={{ marginTop: 20 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            Name
          </label>
          <input
            type="text"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="Enter full name"
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: 14, color: "#555", fontSize: 14 }}>
          <strong>Date of signage:</strong> {new Date().toLocaleString()}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 24,
          }}
        >
          <button style={smallButtonStyle} onClick={onCancel}>
            Cancel
          </button>
          <button style={smallButtonStyle} onClick={handleSave}>
            Save Signature
          </button>
        </div>
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

const bigButtonStyle = {
  fontSize: "22px",
  padding: "18px 28px",
  borderRadius: "12px",
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

const infoCardStyle = {
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "12px",
  background: "#fafafa",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const sectionButtonStyle = {
  textAlign: "left",
  padding: "14px",
  borderRadius: "10px",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  zIndex: 1000,
};

const modalCardStyle = {
  width: "100%",
  maxWidth: 760,
  background: "#fff",
  borderRadius: 16,
  padding: 24,
  boxSizing: "border-box",
  color: "#111",
};

const signatureCanvasStyle = {
  width: "100%",
  maxWidth: "100%",
  border: "2px solid #bbb",
  borderRadius: 10,
  background: "#fff",
  touchAction: "none",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  fontSize: "16px",
  borderRadius: 8,
  border: "1px solid #bbb",
  boxSizing: "border-box",
};