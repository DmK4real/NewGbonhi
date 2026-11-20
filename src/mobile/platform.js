import { Capacitor } from "@capacitor/core";

export const isMobileApp = import.meta.env.VITE_NATIVE_APP === "true";
export const isNativePlatform = () => Capacitor.isNativePlatform();
