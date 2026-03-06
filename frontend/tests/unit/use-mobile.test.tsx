import { act, renderHook, waitFor } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

describe("useIsMobile", () => {
  const listeners = new Set<() => void>();

  const emitChange = () => {
    listeners.forEach((listener) => listener());
  };

  const setWidth = (width: number) => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: width,
    });
  };

  beforeEach(() => {
    listeners.clear();
    setWidth(1200);

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: window.innerWidth < 768,
        media: "(max-width: 767px)",
        onchange: null,
        addEventListener: (_event: string, cb: () => void) => listeners.add(cb),
        removeEventListener: (_event: string, cb: () => void) =>
          listeners.delete(cb),
      })),
    });
  });

  it("returns false for desktop viewport", async () => {
    const { result } = renderHook(() => useIsMobile());
    await waitFor(() => expect(result.current).toBe(false));
  });

  it("returns true for mobile viewport", async () => {
    setWidth(500);
    const { result } = renderHook(() => useIsMobile());
    await waitFor(() => expect(result.current).toBe(true));
  });

  it("updates when viewport changes", async () => {
    const { result } = renderHook(() => useIsMobile());
    await waitFor(() => expect(result.current).toBe(false));

    setWidth(640);
    act(() => {
      emitChange();
    });
    await waitFor(() => expect(result.current).toBe(true));
  });
});
