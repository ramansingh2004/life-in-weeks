"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import domtoimage from "dom-to-image";
import {
  Check,
  Clipboard,
  Download,
  Image as ImageIcon,
  LoaderCircle,
  Share2,
} from "lucide-react";

interface CardPreviewProps {
  card: ReactNode;
  format: "square" | "story" | "rect";
  cardType: string;
}

const FORMAT_DIMS = {
  square: { width: 1080, height: 1080, ratio: "1:1", platform: "Instagram" },
  story: {
    width: 1080,
    height: 1920,
    ratio: "9:16",
    platform: "Stories / Reels",
  },
  rect: { width: 1200, height: 630, ratio: "16:9", platform: "X / Facebook" },
};

type Status = "idle" | "working" | "success" | "error";

export function CardPreview({ card, format, cardType }: CardPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dims = FORMAT_DIMS[format];
  const [scale, setScale] = useState(0.5);
  const [downloadStatus, setDownloadStatus] = useState<Status>("idle");
  const [copyStatus, setCopyStatus] = useState<Status>("idle");

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    function updateScale() {
      if (!stage) return;
      const availableWidth = Math.max(stage.clientWidth - 48, 240);
      const availableHeight = format === "story" ? 720 : 660;
      setScale(
        Math.min(availableWidth / dims.width, availableHeight / dims.height, 1),
      );
    }

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [dims.height, dims.width, format]);

  async function createPng() {
    if (!cardRef.current) throw new Error("Card preview is unavailable");
    return domtoimage.toPng(cardRef.current, {
      quality: 1,
      width: dims.width,
      height: dims.height,
      style: { transform: "none", transformOrigin: "top left" },
    });
  }

  async function downloadCard() {
    setDownloadStatus("working");
    try {
      const dataUrl = await createPng();
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `life-in-weeks-${cardType}-${format}-${Date.now()}.png`;
      link.click();
      setDownloadStatus("success");
    } catch (error) {
      console.error("Failed to download card:", error);
      setDownloadStatus("error");
    } finally {
      window.setTimeout(() => setDownloadStatus("idle"), 2200);
    }
  }

  async function copyToClipboard() {
    setCopyStatus("working");
    try {
      const dataUrl = await createPng();
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopyStatus("success");
    } catch (error) {
      console.error("Failed to copy card:", error);
      setCopyStatus("error");
    } finally {
      window.setTimeout(() => setCopyStatus("idle"), 2200);
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[2rem] border border-[#252422]/10 bg-[#252422] shadow-[0_25px_70px_rgba(37,36,34,0.16)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-[#fffaf0]">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/8">
              <ImageIcon className="h-4 w-4 text-[#f0c955]" />
            </span>
            <div>
              <p className="text-xs font-bold">Live preview</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-white/35">
                Export-ready canvas
              </p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-semibold text-white/55">
            {Math.round(scale * 100)}% view
          </span>
        </div>

        <div
          ref={stageRef}
          className="grid min-h-[540px] place-items-center overflow-hidden bg-[radial-gradient(circle_at_top,#3b3936_0,#252422_56%)] p-6 sm:min-h-[680px]"
        >
          <div
            style={{ width: dims.width * scale, height: dims.height * scale }}
            className="relative shrink-0 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
          >
            <div
              ref={cardRef}
              style={{
                width: dims.width,
                height: dims.height,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className="overflow-hidden"
            >
              {card}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#252422]/10 bg-white/65 p-3 sm:grid-cols-4">
        <Info label="Ratio" value={dims.ratio} />
        <Info label="Canvas" value={`${dims.width} × ${dims.height}`} />
        <Info label="Best for" value={dims.platform} />
        <Info label="File" value="High-res PNG" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ActionButton
          onClick={downloadCard}
          status={downloadStatus}
          idleLabel="Save PNG"
          successLabel="Saved"
          icon={Download}
          primary
        />
        <ActionButton
          onClick={copyToClipboard}
          status={copyStatus}
          idleLabel="Copy image"
          successLabel="Copied"
          icon={Clipboard}
        />
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-[#87b9ad]/30 bg-[#87b9ad]/12 p-4 text-[#375f57]">
        <Share2 className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-xs leading-5">
          <span className="font-bold">Ready to share.</span> Use square for a
          feed post, story for vertical screens, and landscape for link
          previews.
        </p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f7ead7]/65 px-3 py-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9a9287]">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-bold text-[#252422]">{value}</p>
    </div>
  );
}

function ActionButton({
  onClick,
  status,
  idleLabel,
  successLabel,
  icon: Icon,
  primary = false,
}: {
  onClick: () => void;
  status: Status;
  idleLabel: string;
  successLabel: string;
  icon: typeof Download;
  primary?: boolean;
}) {
  const busy = status === "working";
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={busy}
      className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition disabled:cursor-wait ${primary ? "bg-[#eb5e28] text-white shadow-lg shadow-[#eb5e28]/20 hover:bg-[#d94f20]" : "border border-[#252422]/15 bg-white/70 text-[#252422] hover:border-[#252422]/30"}`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-2"
        >
          {busy ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : status === "success" ? (
            <Check className="h-4 w-4" />
          ) : status === "error" ? (
            <span className="text-base">!</span>
          ) : (
            <Icon className="h-4 w-4" />
          )}
          {busy
            ? "Rendering..."
            : status === "success"
              ? successLabel
              : status === "error"
                ? "Try again"
                : idleLabel}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
