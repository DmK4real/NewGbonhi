import { Capacitor } from "@capacitor/core";

export const isMobileApp = import.meta.env.VITE_NATIVE_APP === "true";
export const isMobilePreview = import.meta.env.VITE_MOBILE_PREVIEW === "true";
export const isNativePlatform = () => Capacitor.isNativePlatform();
