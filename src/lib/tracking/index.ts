import { getDeviceId } from "./device-id";
import type { DeviceType, TrackingEvent, TrackingEventType } from "./types";

export * from "./types";

function getDeviceType(): DeviceType {
  if (typeof window === "undefined") return "desktop";

  const ua = navigator?.userAgent;
  if (ua) {
    if (/iPad|Android(?!.*Mobile)|tablet/i.test(ua)) return "tablet";
    if (
      /iPhone|iPod|Android.*Mobile|webOS|BlackBerry|Opera Mini|IEMobile/i.test(
        ua,
      )
    )
      return "mobile";
    return "desktop";
  }

  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function trackEvent(
  type: TrackingEventType,
  metadata?: Record<string, unknown>,
): void {
  try {
    const event: TrackingEvent = {
      type,
      timestamp: new Date().toISOString(),
      deviceId: getDeviceId(),
      deviceType: getDeviceType(),
      metadata,
    };

    fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }).catch((error) => {
      console.debug("Tracking failed:", error);
    });
  } catch {
    console.debug("Tracking failed");
  }
}
