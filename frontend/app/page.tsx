"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { transcribeAudio } from "@/lib/api";
import { downloadTxt, downloadDocx } from "@/lib/export";

export default function RecorderPage() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [quality, setQuality] = useState<"fast" | "accurate">("fast");
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const authed = isAuthenticated();
    setIsAuthed(authed);
    if (!authed) {
      router.push("/login");
    }
  }, [router]);

  const startRecording = async () => {
    try {
      setError("");
      setLatencyMs(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const supportsOpus = MediaRecorder.isTypeSupported("audio/webm;codecs=opus");
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: supportsOpus ? "audio/webm;codecs=opus" : "audio/webm",
        audioBitsPerSecond: 64000,
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start(250);
      setIsRecording(true);
      setTranscript("");
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((t: number) => t + 1);
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to access microphone"
      );
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    setIsRecording(false);
    mediaRecorderRef.current.stop();

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setIsLoading(true);

      try {
        const result = await transcribeAudio(audioBlob, true, "en-US", quality);
        setTranscript(result.transcript);
        setLatencyMs(result.elapsed_ms ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Transcription failed");
      } finally {
        setIsLoading(false);
      }

      mediaRecorderRef.current
        ?.stream.getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
    };
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!isAuthed) {
    return null;
  }

  return (
    <div className="space-y-6 animate-rise">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/30 bg-white/70 p-8 shadow-glow backdrop-blur-xl sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-coral/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-sky/20 blur-3xl" />

        <div className="relative space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/60">
              Studio Recorder
            </p>
            <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Transcribe Speech in Seconds
            </h1>
            <p className="max-w-2xl text-sm text-ink/70 sm:text-base">
              Low-latency recording pipeline with export-ready transcripts. Use fast mode for speed or accurate mode for heavier audio.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={startRecording}
              disabled={isRecording || isLoading}
              className="rounded-xl bg-sage px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRecording ? "Recording..." : "Start Recording"}
            </button>
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className="rounded-xl bg-coral px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Stop Recording
            </button>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-paper/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
                Recording Time
              </p>
              <p className="mt-1 text-3xl font-bold text-sky">{formatTime(recordingTime)}</p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-ink/5 p-1">
              <button
                type="button"
                onClick={() => setQuality("fast")}
                disabled={isRecording || isLoading}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  quality === "fast" ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"
                }`}
              >
                Fast
              </button>
              <button
                type="button"
                onClick={() => setQuality("accurate")}
                disabled={isRecording || isLoading}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  quality === "accurate" ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"
                }`}
              >
                Accurate
              </button>
            </div>

            <div className="text-sm text-ink/60">
              {latencyMs ? `Last result: ${(latencyMs / 1000).toFixed(1)}s` : "No recent run"}
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center gap-3 rounded-xl border border-sky/30 bg-sky/10 px-4 py-3 text-sm text-sky">
              <span className="inline-block h-2.5 w-2.5 animate-pulseDot rounded-full bg-sky" />
              Transcribing with {quality} mode. This usually completes in a few seconds.
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>
          )}

          {transcript && (
            <div className="space-y-4 animate-rise">
              <div className="rounded-2xl border border-sky/20 bg-sky/10 p-4 sm:p-5">
                <p className="text-lg leading-relaxed text-ink">{transcript}</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  onClick={() => navigator.clipboard.writeText(transcript)}
                  className="rounded-lg bg-ink/10 px-4 py-2 font-medium transition hover:bg-ink/20"
                >
                  Copy
                </button>
                <button
                  onClick={() => downloadTxt(transcript)}
                  className="rounded-lg bg-ink/10 px-4 py-2 font-medium transition hover:bg-ink/20"
                >
                  Download TXT
                </button>
                <button
                  onClick={() => downloadDocx(transcript)}
                  className="rounded-lg bg-ink/10 px-4 py-2 font-medium transition hover:bg-ink/20"
                >
                  Download DOCX
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
