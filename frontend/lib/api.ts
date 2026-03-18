import { getToken } from "@/lib/auth";
import type { Transcript } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type RequestOptions = RequestInit & {
  auth?: boolean;
  timeoutMs?: number;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 30000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (options.auth) {
    const token = getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
      cache: "no-store"
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw new Error("Network error. Please check your connection and try again.");
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}

export async function register(email: string, password: string): Promise<void> {
  await request<{ message: string }>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
}

export async function login(email: string, password: string): Promise<string> {
  const data = await request<{ access_token: string }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return data.access_token;
}

export async function transcribeAudio(
  audioFile: Blob,
  save = true,
  language = "en-US",
  quality: "fast" | "accurate" = "fast"
): Promise<{
  transcript: string;
  saved: boolean;
  transcript_id: number | null;
  quality: "fast" | "accurate";
  elapsed_ms: number;
}> {
  const formData = new FormData();
  formData.append("audio", audioFile, "recording.webm");
  formData.append("save", String(save));
  formData.append("language", language);
  formData.append("quality", quality);

  return request("/transcribe", {
    method: "POST",
    body: formData,
    auth: true,
    timeoutMs: 120000
  });
}

export async function getTranscripts(): Promise<Transcript[]> {
  return request<Transcript[]>("/transcripts", { auth: true });
}

export async function getTranscript(id: number): Promise<Transcript> {
  return request<Transcript>(`/transcripts/${id}`, { auth: true });
}

export async function deleteTranscript(id: number): Promise<void> {
  await request<{ message: string }>(`/transcripts/${id}`, {
    method: "DELETE",
    auth: true
  });
}
