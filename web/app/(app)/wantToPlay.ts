import type { WantToPlayResponse } from "./types";

export async function fetchWantToPlay(apiKey: string, username: string): Promise<WantToPlayResponse> {
  const form = new FormData();
  form.append("api_key", apiKey);
  form.append("username", username);
  const res = await fetch("/api/want_to_play", { method: "POST", body: form });
  return res.json() as Promise<WantToPlayResponse>;
}
