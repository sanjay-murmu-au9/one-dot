import { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    model: 'iPhone', // Default fallback
    manufacturer: 'Apple',
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform(),
    resolution: { w: 1170, h: 2532 } // Default iPhone res
  });

  useEffect(() => {
    async function detectDevice() {
      const isNative = Capacitor.isNativePlatform();
      console.log("[OneDot] Capacitor.isNativePlatform():", isNative);
      
      if (isNative) {
        try {
          const info = await Device.getInfo();
          // Example info: { model: 'OnePlus Nord CE2 Lite', manufacturer: 'OnePlus', platform: 'android', ... }
          
          let resolution = { w: 1080, h: 2400 }; // Default Android
          if (info.platform === 'ios') {
            resolution = { w: 1170, h: 2532 };
          }

          setDeviceInfo({
            model: info.model,
            manufacturer: info.manufacturer,
            platform: info.platform,
            isNative: true,
            resolution: resolution
          });
        } catch (error) {
          console.error("Device detection failed:", error);
        }
      }
    }

    detectDevice();
  }, []);

  return deviceInfo;
}
