"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  Flag,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { type Milestone, useMilestoneStore } from "@/store/useMilestoneStore";
import { useMilestones } from "@/hooks/useQuery";

const CATEGORIES = [
  { id: "career", label: "Career", icon: "💼" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "health", label: "Health", icon: "💪" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "personal", label: "Personal", icon: "✨" },
  { id: "other", label: "Other", icon: "📌" },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  weekIndex: number;
  date: string;
  existingMilestone?: Milestone;
};

export default function MilestoneModal({
  isOpen,
  onClose,
  weekIndex,
  date,
  existingMilestone,
}: Props) {
  const {
    createMilestone,
    updateMilestone: updateMilestoneMutation,
    deleteMilestone,
    isLoading: isMutating,
  } = useMilestones();
  const { addMilestone, updateMilestone, removeMilestone } =
    useMilestoneStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("personal");
  const [icon, setIcon] = useState("✨");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (existingMilestone) {
      setTitle(existingMilestone.title);
      setDescription(existingMilestone.description);
      setCategory(existingMilestone.category);
      setIcon(existingMilestone.icon);
    } else {
      setTitle("");
      setDescription("");
      setCategory("personal");
      setIcon("✨");
    }
    setError("");
  }, [existingMilestone, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isMutating) onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isMutating, onClose]);

  function handleSave() {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Give this milestone a title before saving.");
      return;
    }
    setError("");

    if (existingMilestone) {
      updateMilestoneMutation(
        {
          milestoneId: existingMilestone._id,
          title: cleanTitle,
          description: description.trim(),
          category,
          icon,
        },
        {
          onSuccess: (updated) => {
            updateMilestone(existingMilestone._id, updated);
            toast.success("Milestone updated");
            onClose();
          },
          onError: (cause) => showError(cause, "Failed to update milestone"),
        },
      );
      return;
    }

    createMilestone(
      {
        weekIndex,
        title: cleanTitle,
        description: description.trim(),
        category,
        icon,
        date,
      },
      {
        onSuccess: (created) => {
          addMilestone(created);
          toast.success("Milestone created");
          onClose();
        },
        onError: (cause) => showError(cause, "Failed to create milestone"),
      },
    );
  }

  function showError(cause: unknown, fallback: string) {
    const message = cause instanceof Error ? cause.message : fallback;
    setError(message);
    toast.error(message);
    console.error(fallback, cause);
  }

  function handleDelete() {
    if (
      !existingMilestone ||
      !window.confirm("Delete this milestone? This cannot be undone.")
    )
      return;
    deleteMilestone(existingMilestone._id, {
      onSuccess: () => {
        removeMilestone(existingMilestone._id);
        toast.success("Milestone deleted");
        onClose();
      },
      onError: (cause) => showError(cause, "Failed to delete milestone"),
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#252422]/75 p-3 backdrop-blur-md sm:p-6"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && !isMutating) onClose();
          }}
        >
          <motion.section
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 270, damping: 25 }}
            className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-[#252422]/10 bg-[#fffaf0] text-[#252422] shadow-[0_30px_100px_rgba(37,36,34,0.35)]"
          >
            <header className="relative overflow-hidden border-b border-[#252422]/10 bg-[#f7ead7] px-5 pb-5 pt-6 sm:px-7 sm:pb-6 sm:pt-7">
              <div className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-[#f0c955]/40 blur-3xl" />
              <button
                onClick={onClose}
                disabled={isMutating}
                aria-label="Close milestone"
                className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-[#252422]/10 bg-[#fffaf0]/75 text-[#252422]/55 transition hover:bg-white hover:text-[#eb5e28] disabled:opacity-40"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative flex items-center gap-4 pr-12">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#252422] text-2xl text-[#fffaf0] shadow-lg">
                  {icon || "✦"}
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#eb5e28]">
                    {existingMilestone ? "Edit milestone" : "New milestone"}
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-semibold">
                    Week {weekIndex + 1}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[#77726a]">
                    <CalendarDays className="h-3 w-3" /> {date}
                  </p>
                </div>
              </div>
            </header>

            <div className="space-y-5 p-5 sm:p-7">
              <Field label="Title" count={`${title.length}/50`}>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setError("");
                  }}
                  placeholder="What happened in this chapter?"
                  maxLength={50}
                  disabled={isMutating}
                  className="w-full rounded-2xl border border-[#252422]/12 bg-white/75 px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-[#9a9287] focus:border-[#eb5e28]/60 focus:ring-4 focus:ring-[#eb5e28]/8 disabled:opacity-50"
                />
              </Field>

              <Field
                label="The story behind it"
                count={`${description.length}/200`}
                optional
              >
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add the details you will want to remember..."
                  rows={3}
                  maxLength={200}
                  disabled={isMutating}
                  className="w-full resize-none rounded-2xl border border-[#252422]/12 bg-white/75 px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-[#9a9287] focus:border-[#eb5e28]/60 focus:ring-4 focus:ring-[#eb5e28]/8 disabled:opacity-50"
                />
              </Field>

              <div>
                <div className="mb-3 flex items-end justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#625f59]">
                    Life area
                  </label>
                  <span className="text-[10px] font-semibold text-[#9a9287]">
                    Choose one
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {CATEGORIES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setCategory(item.id);
                        setIcon(item.icon);
                      }}
                      disabled={isMutating}
                      title={item.label}
                      className={`group relative rounded-2xl border px-2 py-3 text-center transition disabled:opacity-50 ${category === item.id ? "border-[#252422] bg-[#252422] text-[#fffaf0] shadow-md" : "border-[#252422]/10 bg-white/70 hover:border-[#eb5e28]/35"}`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span
                        className={`mt-1 block truncate text-[8px] font-bold uppercase tracking-[0.08em] ${category === item.id ? "text-white/55" : "text-[#77726a]"}`}
                      >
                        {item.label}
                      </span>
                      {category === item.id && (
                        <Check className="absolute right-1.5 top-1.5 h-3 w-3 text-[#f0c955]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="rounded-2xl border border-red-300/60 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col-reverse gap-2 border-t border-[#252422]/10 pt-5 sm:flex-row">
                {existingMilestone && (
                  <button
                    onClick={handleDelete}
                    disabled={isMutating}
                    className="grid h-12 w-full place-items-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:opacity-40 sm:w-12"
                    aria-label="Delete milestone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  disabled={isMutating}
                  className="h-12 flex-1 rounded-2xl border border-[#252422]/15 bg-white/65 text-sm font-bold transition hover:border-[#252422]/30 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isMutating || !title.trim()}
                  className="flex h-12 flex-[1.35] items-center justify-center gap-2 rounded-2xl bg-[#eb5e28] text-sm font-bold text-white shadow-lg shadow-[#eb5e28]/20 transition hover:-translate-y-0.5 hover:bg-[#d94f20] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
                >
                  {isMutating ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Flag className="h-4 w-4" />
                  )}
                  {isMutating
                    ? "Saving..."
                    : existingMilestone
                      ? "Save changes"
                      : "Create milestone"}
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  count,
  optional = false,
  children,
}: {
  label: string;
  count: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#625f59]">
          {label}
          {optional && (
            <span className="ml-1 normal-case tracking-normal text-[#9a9287]">
              (optional)
            </span>
          )}
        </label>
        <span className="text-[10px] font-medium text-[#9a9287]">{count}</span>
      </div>
      {children}
    </div>
  );
}
