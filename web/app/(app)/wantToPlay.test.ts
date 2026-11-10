import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWantToPlay } from "./wantToPlay";
import type { WantToPlayResponse } from "./types";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchWantToPlay", () => {
  it("posts api_key and username as form fields and returns the parsed JSON", async () => {
    const mockResponse: WantToPlayResponse = { success: true, items: [], total: 0, requested: 0 };
    const fetchMock = vi.fn().mockResolvedValue({ json: () => Promise.resolve(mockResponse) });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchWantToPlay("my-key", "my-user");

    expect(result).toEqual(mockResponse);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/want_to_play");
    expect(options.method).toBe("POST");

    const form = options.body as FormData;
    expect(form.get("api_key")).toBe("my-key");
    expect(form.get("username")).toBe("my-user");
  });

  it("propagates the error response as-is", async () => {
    const mockResponse: WantToPlayResponse = { success: false, items: [], message: "boom" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: () => Promise.resolve(mockResponse) }),
    );

    const result = await fetchWantToPlay("bad-key", "someone");

    expect(result).toEqual(mockResponse);
  });
});
