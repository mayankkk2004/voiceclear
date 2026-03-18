"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getTranscripts, deleteTranscript } from "@/lib/api";
import { downloadTxt, downloadDocx } from "@/lib/export";
import type { Transcript } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const authed = isAuthenticated();
    setIsAuthed(authed);
    if (!authed) {
      router.push("/login");
      return;
    }

    loadTranscripts();
  }, [router]);

  const loadTranscripts = async () => {
    try {
      setIsLoading(true);
      const data = await getTranscripts();
      setTranscripts(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transcripts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transcript?")) return;

    try {
      await deleteTranscript(id);
      setTranscripts(transcripts.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthed) {
    return null;
  }

  return (
    <div className="space-y-6 animate-rise">
      <div className="rounded-2xl border border-white/40 bg-white/80 p-8 shadow-lg backdrop-blur-xl">
        <h1 className="mb-6 text-3xl font-bold text-ink">Transcript History</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-800">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-center text-ink/60">Loading transcripts...</p>
        ) : transcripts.length === 0 ? (
          <p className="text-center text-ink/60">
            No transcripts yet. Start recording to create one!
          </p>
        ) : (
          <div className="space-y-3">
            {transcripts.map((transcript) => (
              <div
                key={transcript.id}
                className="rounded-lg border border-ink/10 p-4 transition hover:border-ink/30"
              >
                <button
                  onClick={() =>
                    setExpandedId(expandedId === transcript.id ? null : transcript.id)
                  }
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-ink">
                        {transcript.text.substring(0, 60)}
                        {transcript.text.length > 60 ? "..." : ""}
                      </p>
                      <p className="text-sm text-ink/60">
                        {formatDate(transcript.created_at)}
                      </p>
                    </div>
                    <span className="text-ink/60">
                      {expandedId === transcript.id ? "▼" : "▶"}
                    </span>
                  </div>
                </button>

                {expandedId === transcript.id && (
                  <div className="mt-4 space-y-3 border-t border-ink/10 pt-4">
                    <p className="leading-relaxed text-ink">{transcript.text}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(transcript.text)}
                        className="flex-1 rounded-lg bg-ink/10 px-3 py-2 text-sm font-medium transition hover:bg-ink/20"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => downloadTxt(transcript.text, `transcript-${transcript.id}.txt`)}
                        className="flex-1 rounded-lg bg-ink/10 px-3 py-2 text-sm font-medium transition hover:bg-ink/20"
                      >
                        TXT
                      </button>
                      <button
                        onClick={() =>
                          downloadDocx(transcript.text, `transcript-${transcript.id}.docx`)
                        }
                        className="flex-1 rounded-lg bg-ink/10 px-3 py-2 text-sm font-medium transition hover:bg-ink/20"
                      >
                        DOCX
                      </button>
                      <button
                        onClick={() => handleDelete(transcript.id)}
                        className="flex-1 rounded-lg bg-coral/20 px-3 py-2 text-sm font-medium text-coral transition hover:bg-coral/30"
                      >
                        Delete
                      </button>
                    </div>
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
