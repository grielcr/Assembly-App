import { useEffect, useMemo, useRef, useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { supabase } from "./supabaseClient";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const quickReferences = [
  { title: "Torque Schedule", file: "/quick-references/Torque-schedule.pdf" },
  { title: "Cabinet wiring", file: "/quick-references/Cabinet-wiring-2.0.pdf" },
  {
    title: "Cabinet major components",
    file: "/quick-references/Cabinet-major-components-2.0.pdf",
  },
];

const floorplanAssets = {
  floorplan: "/dummy_floorplan_north.svg",
};

const floorSlotLayout = {
  "bay-33": { left: "21.2%", top: "81.5%", width: 50, height: 92 },
  "bay-34": { left: "26%", top: "81.5%", width: 50, height: 92 },
  "bay-35": { left: "30.5%", top: "81.5%", width: 50, height: 92 },
  "bay-38": { left: "45.5%", top: "81.5%", width: 50, height: 92 },
  "bay-39": { left: "50%", top: "81.5%", width: 50, height: 92 },
  "bay-40": { left: "54.5%", top: "81.5%", width: 50, height: 92 },
  "bay-41": { left: "59.5%", top: "81.5%", width: 50, height: 92 },
  "bay-42": { left: "64%", top: "81.5%", width: 50, height: 92 },
  "bay-43": { left: "68.5%", top: "81.5%", width: 50, height: 92 },
  "bay-44": { left: "73.3%", top: "81.5%", width: 50, height: 92 },
  "bay-45": { left: "78%", top: "81.5%", width: 50, height: 92 },

  "floor-A": { left: "30%", top: "24%", width: 92, height: 50 },
  "floor-B": { left: "30%", top: "32%", width: 92, height: 50 },
  "floor-C": { left: "30%", top: "40%", width: 92, height: 50 },
  "floor-D": { left: "30%", top: "48%", width: 92, height: 50 },
  "floor-E": { left: "30%", top: "56%", width: 92, height: 50 },
  "floor-F": { left: "30%", top: "64%", width: 92, height: 50 },
  "floor-G": { left: "50%", top: "40%", width: 92, height: 50 },
  "floor-H": { left: "61%", top: "40%", width: 92, height: 50 },
  "floor-I": { left: "50%", top: "64%", width: 92, height: 50 },
  "floor-J": { left: "61%", top: "64%", width: 92, height: 50 },
  "floor-K": { left: "83.2%", top: "40%", width: 50, height: 92 },
  "floor-L": { left: "83.2%", top: "60%", width: 50, height: 92 },
};

const sectionTemplate = [
  {
    id: "precaution",
    title: "Precaution",
    startPage: 1,
    endPage: 5,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "",
  },
  {
    id: "preface",
    title: "Preface",
    startPage: 6,
    endPage: 14,
    assemblerSignaturesRequired: 0,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "",
  },
  {
    id: "bottom-conduits-1-of-3",
    title: "Bottom Conduits 1/3",
    startPage: 15,
    endPage: 29,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "",
  },
  {
    id: "bottom-conduits-2-of-3",
    title: "Bottom Conduits 2/3",
    startPage: 31,
    endPage: 32,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "",
  },
  {
    id: "stitch-plate-torque-1-of-2",
    title: "Stitch Plate Torque 1/2",
    startPage: 33,
    endPage: 34,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 1,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Torque section",
  },
  {
    id: "bottom-conduits-3-of-3",
    title: "Bottom Conduits 3/3",
    startPage: 35,
    endPage: 39,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "",
  },
  {
    id: "stitch-plate-torque-2-of-2",
    title: "Stitch Plate Torque 2/2",
    startPage: 40,
    endPage: 41,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 1,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Torque section",
  },
  {
    id: "preflip-electrical-components",
    title: "Preflip Electrical Components",
    startPage: 42,
    endPage: 43,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: ["FA-QC-CHK-001"],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Operator inspection required at end",
  },
  {
    id: "flip-baseframe",
    title: "Flip Baseframe",
    startPage: 44,
    endPage: 45,
    assemblerSignaturesRequired: 0,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "",
  },
  {
    id: "dlo-cables-and-electrical-misc",
    title: "DLO Cables and Electrical Misc",
    startPage: 46,
    endPage: 53,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: ["PR-QC-PRE-001"],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Operator inspection required at end",
  },
  {
    id: "inverter-mounting-and-torques",
    title: "Inverter Mounting and Torques",
    startPage: 54,
    endPage: 60,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 1,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Torque section",
  },
  {
    id: "secure-dlo-to-inverters",
    title: "Secure DLO to Inverters",
    startPage: 61,
    endPage: 66,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: ["TV-EL-VER-001"],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Operator inspection required at end",
  },
  {
    id: "inverter-room-enclosure-1-of-2",
    title: "Inverter Room Enclosure 1/2",
    startPage: 67,
    endPage: 82,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "",
  },
  {
    id: "battery-rack-prep",
    title: "Battery Rack Prep",
    startPage: 83,
    endPage: 91,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 1,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Operator signoff required",
  },
  {
    id: "control-cabinet-lift",
    title: "Control Cabinet Lift",
    startPage: 92,
    endPage: 93,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "",
  },
  {
    id: "inverter-room-enclosure-2-of-2",
    title: "Inverter Room Enclosure 2/2",
    startPage: 94,
    endPage: 98,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: true,
    canSkipToHere: false,
    notes: "Assembler may skip ahead after this section",
  },
  {
    id: "secure-control-cabinet",
    title: "Secure Control Cabinet",
    startPage: 99,
    endPage: 99,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 1,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Torque section",
  },
  {
    id: "battery-room-enclosure",
    title: "Battery Room Enclosure",
    startPage: 100,
    endPage: 111,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: ["FA-EN-CHK-001"],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Operator inspection required at end",
  },
  {
    id: "secure-battery-rack",
    title: "Secure Battery Rack",
    startPage: 112,
    endPage: 113,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 1,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Torque section",
  },
  {
    id: "torque-ground-cable-on-ground-bus",
    title: "Torque Ground Cable on Ground Bus",
    startPage: 114,
    endPage: 115,
    assemblerSignaturesRequired: 2,
    operatorSignaturesRequired: 2,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Four total signatures; verify exact breakdown later",
  },
  {
    id: "dc-hipot",
    title: "DC Hipot",
    startPage: 116,
    endPage: 116,
    assemblerSignaturesRequired: 0,
    operatorSignaturesRequired: 0,
    endForms: ["DC-HIPOT"],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Operator-only test form",
  },
  {
    id: "secure-dlo-cable-to-quadruple-barrel-mechanical-lugs",
    title: "Secure DLO Cable to Quadruple Barrel Mechanical Lugs",
    startPage: 117,
    endPage: 119,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "",
  },
  {
    id: "conduits-inverter-room",
    title: "Conduits Inverter Room",
    startPage: 126,
    endPage: 139,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: true,
    notes: "Assembler may skip to this section",
  },
  {
    id: "conduit-battery-room",
    title: "Conduit Battery Room",
    startPage: 140,
    endPage: 158,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: ["FA-EL-CHK-001"],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Operator inspection required at end",
  },
  {
    id: "wiring",
    title: "Wiring",
    startPage: 159,
    endPage: 199,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: ["FA-EL-CHK-002"],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Operator inspection required at end",
  },
  {
    id: "load-center",
    title: "Load Center",
    startPage: 200,
    endPage: 212,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: ["AC-HIPOT"],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "AC Hipot at end of section",
  },
  {
    id: "device-wiring",
    title: "Device Wiring",
    startPage: 213,
    endPage: 217,
    assemblerSignaturesRequired: 0,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "",
  },
  {
    id: "facp-section",
    title: "FACP Section",
    startPage: 218,
    endPage: 244,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: ["FA-EL-CHK-003"],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Operator inspection required at end",
  },
  {
    id: "battery-rack-electrical-wiring",
    title: "Battery Rack Electrical Wiring",
    startPage: 245,
    endPage: 273,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "",
  },
  {
    id: "ia-assembly-for-inverter-assembly",
    title: "IA Assembly for Inverter Assembly",
    startPage: 274,
    endPage: 287,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: ["SH-QC-CHK-001"],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Operator inspection required at end; rename later if needed",
  },
  {
    id: "control-cabinet-miscellaneous-wiring",
    title: "Control Cabinet Miscellaneous Wiring",
    startPage: 288,
    endPage: 309,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: ["FA-EL-WIR-001"],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "Operator inspection required at end",
  },
  {
    id: "final-assembly",
    title: "Final Assembly",
    startPage: 310,
    endPage: 320,
    assemblerSignaturesRequired: 1,
    operatorSignaturesRequired: 0,
    endForms: [],
    canSkipFromHere: false,
    canSkipToHere: false,
    notes: "",
  },
];

function makeRuntimeSections() {
  return sectionTemplate.map((section, index) => ({
    ...section,
    status: index === 0 ? "available" : "locked",
    assemblerSignaturesCompleted: 0,
    operatorSignaturesCompleted: 0,
    completedForms: [],
    signed: false,
    signedBy: "",
    signedAt: "",
    signatureDataUrl: "",
    outOfSequenceApproved: false,
  }));
}

const fakeBuild = {
  buildId: "ESS-001",
  serialNumber: "SN-001",
  revision: "06.2.5",
  pdfUrl: "/assmguide1.pdf",
  currentSectionId: sectionTemplate[0].id,
  sections: makeRuntimeSections(),
};

export default function App() {
  const pathname = window.location.pathname.toLowerCase();
  const isOperatorRoute = pathname.startsWith("/operator");
  const isAssemblerRoute =
    pathname.startsWith("/assembler") || pathname === "/" || pathname === "";

  const [screen, setScreen] = useState("splash");
  const [previousScreen, setPreviousScreen] = useState("home");
  const [selectedPdf, setSelectedPdf] = useState("/assmguide1.pdf");
  const [viewerTitle, setViewerTitle] = useState("My Build");

  const [operatorScreen, setOperatorScreen] = useState("home");

  const [build, setBuild] = useState(fakeBuild);
  const [activeSectionId, setActiveSectionId] = useState(
    fakeBuild.currentSectionId
  );
  const [scannedUnit, setScannedUnit] = useState("");

    async function loadOrCreateBuild(unitId, options = {}) {
    const { preserveActiveSection = false } = options;

    try {
      const { data, error } = await supabase
        .from("builds")
        .select("*")
        .eq("build_id", unitId)
        .maybeSingle();

      if (error) {
        console.error("Error loading build:", error);
        return;
      }

      if (data) {
        const loadedBuild = {
          buildId: data.build_id,
          serialNumber: data.serial_number || unitId,
          revision: data.revision || "06.2.5",
          pdfUrl: "/assmguide1.pdf",
          currentSectionId: data.current_section_id || sectionTemplate[0].id,
          sections:
            Array.isArray(data.sections_json) && data.sections_json.length > 0
              ? data.sections_json
              : makeRuntimeSections(),
        };

        setBuild(loadedBuild);
        setActiveSectionId((prev) => {
          if (
            preserveActiveSection &&
            loadedBuild.sections.some((section) => section.id === prev)
          ) {
            return prev;
          }
          return loadedBuild.currentSectionId;
        });
        return;
      }

      const newBuild = {
        ...fakeBuild,
        buildId: unitId,
        serialNumber: unitId,
        sections: makeRuntimeSections(),
      };

      const { error: insertError } = await supabase.from("builds").insert({
        build_id: newBuild.buildId,
        serial_number: newBuild.serialNumber,
        revision: newBuild.revision,
        current_section_id: newBuild.currentSectionId,
        sections_json: newBuild.sections,
      });

      if (insertError) {
        console.error("Error creating build:", insertError);
        return;
      }

      setBuild(newBuild);
      setActiveSectionId(newBuild.currentSectionId);
    } catch (err) {
      console.error("Unexpected build load/create error:", err);
    }
  }

  async function saveBuildToSupabase(updatedBuild) {
    try {
      const { error } = await supabase
        .from("builds")
        .update({
          serial_number: updatedBuild.serialNumber,
          revision: updatedBuild.revision,
          current_section_id: updatedBuild.currentSectionId,
          sections_json: updatedBuild.sections,
          updated_at: new Date().toISOString(),
        })
        .eq("build_id", updatedBuild.buildId);

      if (error) {
        console.error("Error saving build:", error);
      }
    } catch (err) {
      console.error("Unexpected save error:", err);
    }
  }

  async function createSectionChangeRequest(request) {
    try {
      const { error } = await supabase.from("section_change_requests").insert({
        build_id: request.buildId,
        serial_number: request.serialNumber,
        from_section_id: request.fromSectionId,
        from_section_title: request.fromSectionTitle,
        requested_section_id: request.requestedSectionId,
        requested_section_title: request.requestedSectionTitle,
        reason: request.reason,
        requested_by: request.requestedBy || "Assembler",
        status: "pending",
      });

      if (error) {
        console.error("Error creating section change request:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Unexpected section change request error:", err);
      return false;
    }
  }

  async function fetchSectionChangeRequests(buildId = null) {
    try {
      let query = supabase
        .from("section_change_requests")
        .select("*")
        .order("requested_at", { ascending: false });

      if (buildId) {
        query = query.eq("build_id", buildId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching section change requests:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Unexpected request fetch error:", err);
      return [];
    }
  }

  async function updateSectionChangeRequestStatus(
    ticketId,
    status,
    reviewNotes = "",
    reviewedBy = "Operator"
  ) {
    try {
      const { error } = await supabase
        .from("section_change_requests")
        .update({
          status,
          review_notes: reviewNotes || null,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", ticketId);

      if (error) {
        console.error("Error updating request status:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Unexpected request update error:", err);
      return false;
    }
  }

  async function approveSectionChangeRequest(ticket) {
    try {
      const { data, error } = await supabase
        .from("builds")
        .select("*")
        .eq("build_id", ticket.build_id)
        .single();

      if (error) {
        console.error("Error loading build for approval:", error);
        return false;
      }

      const sections = Array.isArray(data.sections_json) ? data.sections_json : [];

      const updatedSections = sections.map((section) => {
  if (section.id === ticket.requested_section_id) {
    return {
      ...section,
      status: section.status === "completed" ? "completed" : "available",
      outOfSequenceApproved: true,
    };
  }
  return section;
});

      const { error: buildUpdateError } = await supabase
        .from("builds")
        .update({
          sections_json: updatedSections,
          updated_at: new Date().toISOString(),
        })
        .eq("build_id", ticket.build_id);

      if (buildUpdateError) {
        console.error("Error unlocking requested section:", buildUpdateError);
        return false;
      }

      const ok = await updateSectionChangeRequestStatus(
        ticket.id,
        "approved",
        "Approved by operator."
      );

      return ok;
    } catch (err) {
      console.error("Unexpected approval error:", err);
      return false;
    }
  }

  async function fetchFloorSlots() {
    try {
      const { data, error } = await supabase
        .from("floor_slots")
        .select("*")
        .order("slot_type", { ascending: true })
        .order("label", { ascending: true });

      if (error) {
        console.error("Error fetching floor slots:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Unexpected floor slot fetch error:", err);
      return [];
    }
  }

  async function assignBuildToSlot(slotId, buildId) {
    try {
      const { error } = await supabase
        .from("floor_slots")
        .update({
          build_id: buildId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("slot_id", slotId);

      if (error) {
        console.error("Error assigning build to slot:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Unexpected slot assignment error:", err);
      return false;
    }
  }

  useEffect(() => {
    if (!isAssemblerRoute) return;
    if (!build?.buildId) return;
    if (screen !== "my-build" && screen !== "service-tickets") return;

    const channel = supabase
      .channel(`assembler-live-${build.buildId}-${screen}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "section_change_requests",
          filter: `build_id=eq.${build.buildId}`,
        },
        async () => {
          await loadOrCreateBuild(build.buildId, {
            preserveActiveSection: true,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "builds",
          filter: `build_id=eq.${build.buildId}`,
        },
        async () => {
          await loadOrCreateBuild(build.buildId, {
            preserveActiveSection: true,
          });
        }
      )
      .subscribe((status) => {
        console.log("Assembler realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAssemblerRoute, build?.buildId, screen]);

  if (isOperatorRoute) {
    if (operatorScreen === "my-build") {
      return (
        <FloorplanScreen
          goBack={() => setOperatorScreen("home")}
          fetchFloorSlots={fetchFloorSlots}
          assignBuildToSlot={assignBuildToSlot}
        />
      );
    }

    if (operatorScreen === "quick-references") {
      return (
        <QuickReferencesScreen
          goHome={() => setOperatorScreen("home")}
          onOpenPdf={(title, file) => {
            setViewerTitle(title);
            setSelectedPdf(file);
            setPreviousScreen("operator-quick-references");
            setOperatorScreen("pdf-viewer");
          }}
        />
      );
    }

    if (operatorScreen === "service-tickets") {
      return (
        <OperatorTicketsScreen
          fetchSectionChangeRequests={fetchSectionChangeRequests}
          updateSectionChangeRequestStatus={updateSectionChangeRequestStatus}
          approveSectionChangeRequest={approveSectionChangeRequest}
          goBack={() => setOperatorScreen("home")}
        />
      );
    }

    if (operatorScreen === "pdf-viewer") {
      return (
        <PdfViewerScreen
          title={viewerTitle}
          fileUrl={selectedPdf}
          goBack={() => setOperatorScreen("quick-references")}
        />
      );
    }

    return (
      <OperatorHomeScreen
        onOpenMyBuild={() => setOperatorScreen("my-build")}
        onOpenQuickReferences={() => setOperatorScreen("quick-references")}
        onOpenServiceTickets={() => setOperatorScreen("service-tickets")}
      />
    );
  }

  if (isAssemblerRoute) {
    if (screen === "splash") {
      return <SplashScreen onDone={() => setScreen("scan")} />;
    }

    if (screen === "scan") {
      return (
        <ScanScreen
          onScan={(unitId) => {
            setScannedUnit(unitId);
            loadOrCreateBuild(unitId);
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
          saveBuildToSupabase={saveBuildToSupabase}
          createSectionChangeRequest={createSectionChangeRequest}
          goBack={() => setScreen("home")}
        />
      );
    }

    if (screen === "service-tickets") {
      return (
        <ServiceTicketsScreen
          build={build}
          fetchSectionChangeRequests={fetchSectionChangeRequests}
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
        onOpenServiceTickets={() => setScreen("service-tickets")}
      />
    );
  }

  return (
    <div style={{ padding: 40 }}>
      Route not recognized. Use <strong>/assembler</strong> or{" "}
      <strong>/operator</strong>.
    </div>
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

        <button style={bigButtonStyle} onClick={() => onScan("ESS-003")}>
          Simulate Scan ESS-003
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

function HomeScreen({
  build,
  onOpenMyBuild,
  onOpenQuickReferences,
  onOpenServiceTickets,
}) {
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

        <button style={buttonStyle} onClick={onOpenServiceTickets}>
          Service Tickets
        </button>

        <button style={buttonStyle}>Help</button>
      </div>
    </div>
  );
}

function OperatorHomeScreen({
  onOpenMyBuild,
  onOpenQuickReferences,
  onOpenServiceTickets,
}) {
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
        <h1 style={{ margin: 0 }}>Operator App</h1>
        <div
          style={{
            padding: "10px 16px",
            border: "1px solid #ddd",
            borderRadius: 10,
            background: "#fafafa",
            fontWeight: 600,
          }}
        >
          Floor Control
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
          Production Floor
        </button>

        <button style={buttonStyle} onClick={onOpenQuickReferences}>
          Quick References
        </button>

        <button style={buttonStyle} onClick={onOpenServiceTickets}>
          Service Tickets
        </button>

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
  saveBuildToSupabase,
  createSectionChangeRequest,
  goBack,
}) {
  const [showSignModal, setShowSignModal] = useState(false);
  const [showSectionRequestModal, setShowSectionRequestModal] = useState(false);

  const activeSection = useMemo(
    () => build.sections.find((section) => section.id === activeSectionId),
    [build.sections, activeSectionId]
  );

  const completeSectionWithSignature = ({ signerName, signatureDataUrl }) => {
    const currentIndex = build.sections.findIndex(
      (section) => section.id === activeSectionId
    );

    if (currentIndex === -1) return;

    const currentSection = build.sections[currentIndex];
    if (currentSection.status === "locked" && !currentSection.outOfSequenceApproved)
  return;

    const signedAt = new Date().toLocaleString();

    const updatedSections = build.sections.map((section, index) => {
      if (index !== currentIndex) return section;

      const nextAssemblerCount =
        (section.assemblerSignaturesCompleted || 0) + 1;

      const assemblerDone =
        nextAssemblerCount >= (section.assemblerSignaturesRequired || 0);

      const operatorDone =
        (section.operatorSignaturesCompleted || 0) >=
        (section.operatorSignaturesRequired || 0);

      const formsDone =
        (section.endForms || []).length === 0 ||
        (section.completedForms || []).length >= (section.endForms || []).length;

      const isComplete = assemblerDone && operatorDone && formsDone;

      return {
        ...section,
        assemblerSignaturesCompleted: nextAssemblerCount,
        signed: true,
        signedBy: signerName,
        signedAt,
        signatureDataUrl,
        status: isComplete ? "completed" : "available",
      };
    });

    const currentUpdatedSection = updatedSections[currentIndex];
    const isNowComplete = currentUpdatedSection.status === "completed";

    const finalSections = updatedSections.map((section, index) => {
      if (
        isNowComplete &&
        index === currentIndex + 1 &&
        section.status === "locked"
      ) {
        return {
          ...section,
          status: "available",
        };
      }
      return section;
    });

    const nextSection = isNowComplete ? finalSections[currentIndex + 1] : null;

    const updatedBuild = {
      ...build,
      currentSectionId: nextSection ? nextSection.id : build.currentSectionId,
      sections: finalSections,
    };

    setBuild(updatedBuild);
    saveBuildToSupabase(updatedBuild);

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
          overflow: "hidden",
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
            overflowY: "auto",
            position: "sticky",
            top: 16,
            alignSelf: "start",
            height: "calc(100vh - 32px)",
            boxSizing: "border-box",
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
                const isLocked =
  section.status === "locked" && !section.outOfSequenceApproved;

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
                      border: isActive ? "2px solid #2563eb" : "1px solid #555",
                      backgroundColor:
                        section.status === "completed"
                          ? "#e8f5e9"
                          : section.status === "available"
                          ? "#ffffff"
                          : "#f3f4f6",
                      color:
                        section.status === "locked"
                          ? "#6b7280"
                          : "#111827",
                      cursor: isLocked ? "not-allowed" : "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#111827" }}>
                      {section.title}
                    </div>
                    <div
                      style={{ fontSize: 14, marginTop: 6, color: "#374151" }}
                    >
                      Pages {section.startPage}-{section.endPage}
                    </div>
                    <div
                      style={{ fontSize: 14, marginTop: 6, color: "#374151" }}
                    >
                      Status: {section.status}
                    </div>
                    <div
                      style={{ fontSize: 14, marginTop: 6, color: "#374151" }}
                    >
                      Assembler: {section.assemblerSignaturesCompleted || 0}/
                      {section.assemblerSignaturesRequired || 0}
                    </div>
                    <div
                      style={{ fontSize: 14, marginTop: 6, color: "#374151" }}
                    >
                      Operator: {section.operatorSignaturesCompleted || 0}/
                      {section.operatorSignaturesRequired || 0}
                    </div>
                    <div
                      style={{ fontSize: 14, marginTop: 6, color: "#374151" }}
                    >
                      Forms:{" "}
                      {(section.completedForms || []).length}/
                      {(section.endForms || []).length}
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
            gap: 16,
            overflowY: "auto",
            position: "sticky",
            top: 16,
            alignSelf: "start",
            height: "calc(100vh - 32px)",
            boxSizing: "border-box",
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
                disabled={
  !activeSection ||
  (activeSection.status !== "available" && !activeSection.outOfSequenceApproved)
}
                onClick={() => setShowSignModal(true)}
              >
                {activeSection
                  ? `Assembler Sign (${activeSection.assemblerSignaturesCompleted || 0}/${activeSection.assemblerSignaturesRequired || 0})`
                  : "Tap to Sign"}
              </button>

              <button
                style={smallButtonStyle}
                onClick={() => setShowSectionRequestModal(true)}
              >
                Request Out-of-Sequence Work
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
                  Assembler signatures required:{" "}
                  {activeSection.assemblerSignaturesRequired || 0}
                </div>
                <div style={{ marginTop: 6 }}>
                  Operator signatures required:{" "}
                  {activeSection.operatorSignaturesRequired || 0}
                </div>
                <div style={{ marginTop: 6 }}>
                  End forms:{" "}
                  {(activeSection.endForms || []).length > 0
                    ? activeSection.endForms.join(", ")
                    : "None"}
                </div>
                <div style={{ marginTop: 6 }}>
                  Notes: {activeSection.notes || "None"}
                </div>
                <div style={{ marginTop: 6 }}>
                  Can skip from here: {activeSection.canSkipFromHere ? "Yes" : "No"}
                </div>
                <div style={{ marginTop: 6 }}>
                  Can skip to here: {activeSection.canSkipToHere ? "Yes" : "No"}
                </div>

                {activeSection.signed && (
                  <div style={{ marginTop: 10 }}>
                    <div>
                      <strong>Last assembler signature by:</strong>{" "}
                      {activeSection.signedBy}
                    </div>
                    <div>
                      <strong>Last assembler signature at:</strong>{" "}
                      {activeSection.signedAt}
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
            {activeSection && (
              <SectionPdfViewer
                fileUrl={build.pdfUrl}
                startPage={activeSection.startPage}
                endPage={activeSection.endPage}
              />
            )}
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

      {showSectionRequestModal && activeSection && (
        <SectionChangeRequestModal
          build={build}
          currentSection={activeSection}
          onCancel={() => setShowSectionRequestModal(false)}
          onSubmit={async (requestPayload) => {
            const ok = await createSectionChangeRequest(requestPayload);
            if (ok) {
              alert("Request submitted.");
              setShowSectionRequestModal(false);
            } else {
              alert("Could not submit request.");
            }
          }}
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

function SectionChangeRequestModal({
  build,
  currentSection,
  onCancel,
  onSubmit,
}) {
  const [requestedSectionId, setRequestedSectionId] = useState("");
  const [reason, setReason] = useState("");
  const [requestedBy, setRequestedBy] = useState("");

  const availableTargets = build.sections.filter(
    (section) => section.id !== currentSection.id
  );

  const requestedSection = availableTargets.find(
    (section) => section.id === requestedSectionId
  );

  const handleSubmit = async () => {
    if (!requestedSectionId) {
      alert("Please choose a section.");
      return;
    }

    if (!reason.trim()) {
      alert("Please enter a reason.");
      return;
    }

    await onSubmit({
      buildId: build.buildId,
      serialNumber: build.serialNumber,
      fromSectionId: currentSection.id,
      fromSectionTitle: currentSection.title,
      requestedSectionId: requestedSection.id,
      requestedSectionTitle: requestedSection.title,
      reason: reason.trim(),
      requestedBy: requestedBy.trim(),
    });
  };

  return (
    <div style={modalOverlayStyle}>
      <div
        style={{
          ...modalCardStyle,
          maxWidth: 1100,
          maxHeight: "90vh",
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          gap: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            overflowY: "auto",
            paddingRight: 8,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Request Out-of-Sequence Work</h2>

          <div style={{ marginBottom: 12 }}>
            <strong>Build:</strong> {build.buildId}
          </div>

          <div style={{ marginBottom: 20 }}>
            <strong>Current section:</strong> {currentSection.title}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Requested section
            </label>
            <select
              value={requestedSectionId}
              onChange={(e) => setRequestedSectionId(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select a section</option>
              {availableTargets.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title} (Pages {section.startPage}-{section.endPage})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Requested by
            </label>
            <input
              type="text"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              placeholder="Assembler name"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Example: Need to retighten wall frame before continuing."
              style={{
                ...inputStyle,
                minHeight: 120,
                resize: "vertical",
              }}
            />
          </div>

          {requestedSection && (
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12,
                background: "#fafafa",
                marginBottom: 16,
              }}
            >
              <div>
                <strong>Previewing:</strong> {requestedSection.title}
              </div>
              <div style={{ marginTop: 6 }}>
                Pages {requestedSection.startPage}-{requestedSection.endPage}
              </div>
            </div>
          )}

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
            <button style={smallButtonStyle} onClick={handleSubmit}>
              Submit Request
            </button>
          </div>
        </div>

        <div
          style={{
            minWidth: 0,
            minHeight: 0,
            border: "1px solid #ddd",
            borderRadius: 12,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {requestedSection ? (
            <SectionPdfViewer
              fileUrl={build.pdfUrl}
              startPage={requestedSection.startPage}
              endPage={requestedSection.endPage}
            />
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
                padding: 20,
                textAlign: "center",
              }}
            >
              Select a section to preview its pages here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceTicketsScreen({ build, fetchSectionChangeRequests, goBack }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadTickets() {
    setLoading(true);
    const data = await fetchSectionChangeRequests(build.buildId);
    setTickets(data);
    setLoading(false);
  }

  useEffect(() => {
    loadTickets();
  }, [build.buildId]);

  useEffect(() => {
    if (!build?.buildId) return;

    const channel = supabase
      .channel(`assembler-tickets-${build.buildId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "section_change_requests",
          filter: `build_id=eq.${build.buildId}`,
        },
        async () => {
          await loadTickets();
        }
      )
      .subscribe((status) => {
        console.log("Assembler tickets realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [build?.buildId]);

  return (
    <div
      style={{
        height: "100vh",
        padding: 20,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Service Tickets</h1>
          <div style={{ marginTop: 6, color: "#555" }}>
            Unit: {build.buildId}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={smallButtonStyle} onClick={loadTickets}>
            Refresh
          </button>
          <button style={smallButtonStyle} onClick={goBack}>
            Back
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          overflowY: "auto",
          background: "#fff",
        }}
      >
        {loading ? (
          <div>Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div style={{ color: "#666" }}>No tickets for this build yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  padding: 14,
                  background: "#fafafa",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "start",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      Out-of-Sequence Work Request
                    </div>
                    <div style={{ marginTop: 6, color: "#444" }}>
                      From: {ticket.from_section_title}
                    </div>
                    <div style={{ color: "#444" }}>
                      Requested: {ticket.requested_section_title}
                    </div>
                  </div>

                  <StatusChip status={ticket.status} />
                </div>

                <div style={{ marginTop: 10 }}>
                  <strong>Reason:</strong> {ticket.reason}
                </div>

                <div style={{ marginTop: 10, color: "#555", fontSize: 14 }}>
                  Requested by: {ticket.requested_by || "Assembler"}
                </div>

                <div style={{ color: "#555", fontSize: 14 }}>
                  Requested at: {formatDateTime(ticket.requested_at)}
                </div>

                {ticket.review_notes && (
                  <div style={{ marginTop: 10 }}>
                    <strong>Review notes:</strong> {ticket.review_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OperatorTicketsScreen({
  fetchSectionChangeRequests,
  updateSectionChangeRequestStatus,
  approveSectionChangeRequest,
  goBack,
}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadTickets() {
    setLoading(true);
    const data = await fetchSectionChangeRequests();
    setTickets(data);
    setLoading(false);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("operator-tickets-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "section_change_requests",
        },
        async () => {
          await loadTickets();
        }
      )
      .subscribe((status) => {
        console.log("Operator tickets realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleApprove(ticket) {
    const ok = await approveSectionChangeRequest(ticket);
    if (ok) {
      await loadTickets();
    } else {
      alert("Could not approve request.");
    }
  }

  async function handleSetStatus(ticket, status, note) {
    const ok = await updateSectionChangeRequestStatus(ticket.id, status, note);
    if (ok) {
      await loadTickets();
    } else {
      alert("Could not update request.");
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        padding: 20,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "#f5f7fb",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Operator Service Tickets</h1>
          <div style={{ marginTop: 6, color: "#555" }}>
            Reviewing out-of-sequence work requests
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={smallButtonStyle} onClick={loadTickets}>
            Refresh
          </button>
          <button style={smallButtonStyle} onClick={goBack}>
            Back
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {loading ? (
          <div>Loading requests...</div>
        ) : tickets.length === 0 ? (
          <div style={{ color: "#666" }}>No requests found.</div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 14,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {ticket.build_id}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    From: {ticket.from_section_title}
                  </div>
                  <div>Requested: {ticket.requested_section_title}</div>
                </div>

                <StatusChip status={ticket.status} />
              </div>

              <div style={{ marginTop: 12 }}>
                <strong>Reason:</strong> {ticket.reason}
              </div>

              <div style={{ marginTop: 10, color: "#555", fontSize: 14 }}>
                Requested by: {ticket.requested_by || "Assembler"}
              </div>
              <div style={{ color: "#555", fontSize: 14 }}>
                Requested at: {formatDateTime(ticket.requested_at)}
              </div>

              {ticket.review_notes && (
                <div style={{ marginTop: 10 }}>
                  <strong>Review notes:</strong> {ticket.review_notes}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 16,
                }}
              >
                <button
                  style={smallButtonStyle}
                  onClick={() =>
                    handleSetStatus(
                      ticket,
                      "under_review",
                      "Operator is reviewing this request."
                    )
                  }
                >
                  Mark Under Review
                </button>

                <button
                  style={smallButtonStyle}
                  onClick={() => handleApprove(ticket)}
                >
                  Approve
                </button>

                <button
                  style={smallButtonStyle}
                  onClick={() =>
                    handleSetStatus(ticket, "denied", "Denied by operator.")
                  }
                >
                  Deny
                </button>

                <button
                  style={smallButtonStyle}
                  onClick={() =>
                    handleSetStatus(
                      ticket,
                      "needs_info",
                      "More information needed from assembler."
                    )
                  }
                >
                  Needs Info
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FloorplanScreen({ goBack, fetchFloorSlots, assignBuildToSlot }) {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [buildIdInput, setBuildIdInput] = useState("");

  async function loadSlots() {
    const data = await fetchFloorSlots();
    setSlots(data);
  }

  useEffect(() => {
    loadSlots();
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        padding: 20,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: "#f8f8f8",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Production Floor</h1>
          <div style={{ marginTop: 6, color: "#555" }}>
            Click any map slot to assign or clear a unit
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={smallButtonStyle} onClick={loadSlots}>
            Refresh
          </button>
          <button style={smallButtonStyle} onClick={goBack}>
            Back
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          border: "1px solid #ddd",
          borderRadius: 16,
          background: "#fff",
          padding: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#ffffff",
            overflow: "hidden",
          }}
        >
          <img
            src={floorplanAssets.floorplan}
            alt="Floor plan"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "135%",
              height: "135%",
              objectFit: "contain",
              transform: "translate(-50%, -50%) rotate(-90deg)",
              transformOrigin: "center center",
            }}
          />

          {slots.map((slot) => {
            const layout = floorSlotLayout[slot.slot_id];
            if (!layout) return null;

            return (
              <MapSlotOverlay
                key={slot.slot_id}
                slot={slot}
                layout={layout}
                onClick={(clickedSlot) => {
                  setSelectedSlot(clickedSlot);
                  setBuildIdInput(clickedSlot.build_id || "");
                }}
              />
            );
          })}
        </div>
      </div>

      {selectedSlot && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <h2 style={{ marginTop: 0 }}>{selectedSlot.label}</h2>

            <div style={{ marginBottom: 12 }}>
              <strong>Slot ID:</strong> {selectedSlot.slot_id}
            </div>

            <div style={{ marginBottom: 20 }}>
              <strong>Current unit:</strong> {selectedSlot.build_id || "Empty"}
            </div>

            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Unit / Build ID
            </label>

            <input
              type="text"
              value={buildIdInput}
              onChange={(e) => setBuildIdInput(e.target.value)}
              placeholder="Example: ESS-001"
              style={inputStyle}
            />

            <div style={{ marginTop: 12, color: "#666", fontSize: 14 }}>
              For now this is manual text entry. Later we can swap this for a
              dropdown of active units.
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 24,
              }}
            >
              <button
                style={smallButtonStyle}
                onClick={() => {
                  setSelectedSlot(null);
                  setBuildIdInput("");
                }}
              >
                Cancel
              </button>

              <button
                style={smallButtonStyle}
                onClick={async () => {
                  const ok = await assignBuildToSlot(selectedSlot.slot_id, null);

                  if (ok) {
                    setSelectedSlot(null);
                    setBuildIdInput("");
                    loadSlots();
                  } else {
                    alert("Could not clear slot.");
                  }
                }}
              >
                Clear
              </button>

              <button
                style={smallButtonStyle}
                onClick={async () => {
                  if (!buildIdInput.trim()) {
                    alert("Please enter a unit/build ID.");
                    return;
                  }

                  const ok = await assignBuildToSlot(
                    selectedSlot.slot_id,
                    buildIdInput.trim()
                  );

                  if (ok) {
                    setSelectedSlot(null);
                    setBuildIdInput("");
                    loadSlots();
                  } else {
                    alert("Could not assign unit.");
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MapSlotOverlay({ slot, layout, onClick }) {
  const isFilled = !!slot.build_id;

  return (
    <button
      onClick={() => onClick(slot)}
      style={{
        position: "absolute",
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
        transform: "translate(-50%, -50%)",
        borderRadius: 10,
        border: isFilled ? "2px solid #15803d" : "2px solid #6b7280",
        background: isFilled
          ? "rgba(220, 252, 231, 0.95)"
          : "rgba(229, 231, 235, 0.95)",
        color: isFilled ? "#111827" : "#374151",
        cursor: "pointer",
        padding: 8,
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        overflow: "hidden",
      }}
      title={`${slot.label} - ${slot.build_id || "Empty"}`}
    >
      <div style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.1 }}>
        {slot.label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {slot.build_id || "Empty"}
      </div>
    </button>
  );
}

function SectionPdfViewer({ fileUrl, startPage, endPage }) {
  const [numPages, setNumPages] = useState(null);

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const safeEnd = numPages ? Math.min(endPage, numPages) : endPage;

  const pages = [];
  for (let i = startPage; i <= safeEnd; i++) {
    pages.push(i);
  }

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: 16,
        background: "#f3f4f6",
      }}
    >
      <Document file={fileUrl} onLoadSuccess={onLoadSuccess}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          {pages.map((pageNumber) => (
            <div
              key={pageNumber}
              style={{
                background: "#fff",
                padding: 8,
                borderRadius: 8,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <Page pageNumber={pageNumber} width={700} />
            </div>
          ))}
        </div>
      </Document>
    </div>
  );
}

function StatusChip({ status }) {
  const labelMap = {
    pending: "Pending",
    under_review: "Under Review",
    approved: "Approved",
    denied: "Denied",
    needs_info: "Needs Info",
  };

  const bgMap = {
    pending: "#fff7d6",
    under_review: "#dbeafe",
    approved: "#dcfce7",
    denied: "#fee2e2",
    needs_info: "#f3e8ff",
  };

  const colorMap = {
    pending: "#92400e",
    under_review: "#1d4ed8",
    approved: "#166534",
    denied: "#b91c1c",
    needs_info: "#7e22ce",
  };

  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        background: bgMap[status] || "#eee",
        color: colorMap[status] || "#333",
        fontWeight: 700,
        fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      {labelMap[status] || status}
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
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