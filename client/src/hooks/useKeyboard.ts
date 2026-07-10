import { useState, useEffect } from "react";
import { isNativeApp } from "@/lib/platform";

interface KeyboardInfo {
  visible: boolean;
  height: number;
}

/**
 * Track on-screen keyboard visibility and height.
 *
 * On Capacitor native apps, listens to the Keyboard plugin events.
 * On web/PWA, falls back to visual viewport resize events so the input
 * bar can be repositioned when the soft keyboard appears.
 */
export function useKeyboard(): KeyboardInfo {
  const [keyboard, setKeyboard] = useState<KeyboardInfo>({ visible: false, height: 0 });

  useEffect(() => {
    let cancelled = false;

    const handleResize = () => {
      if (cancelled) return;
      const vv = window.visualViewport;
      if (!vv) return;
      const windowHeight = window.innerHeight;
      const heightDiff = Math.max(0, windowHeight - vv.height);
      const threshold = 100;
      setKeyboard({
        visible: heightDiff > threshold,
        height: heightDiff > threshold ? heightDiff : 0,
      });
    };

    const setupNative = async () => {
      try {
        const { Keyboard } = await import("@capacitor/keyboard");
        const showListener = await Keyboard.addListener("keyboardWillShow", (info) => {
          if (!cancelled) setKeyboard({ visible: true, height: info.keyboardHeight || 0 });
        });
        const hideListener = await Keyboard.addListener("keyboardWillHide", () => {
          if (!cancelled) setKeyboard({ visible: false, height: 0 });
        });
        return () => {
          showListener.remove();
          hideListener.remove();
        };
      } catch {
        // Keyboard plugin unavailable, fall through to visual viewport.
      }
      return undefined;
    };

    let cleanup: (() => void) | undefined;

    if (isNativeApp()) {
      setupNative().then((nativeCleanup) => {
        cleanup = nativeCleanup;
      });
    } else {
      window.visualViewport?.addEventListener("resize", handleResize);
      window.addEventListener("resize", handleResize);
      handleResize();
      cleanup = () => {
        window.visualViewport?.removeEventListener("resize", handleResize);
        window.removeEventListener("resize", handleResize);
      };
    }

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return keyboard;
}
