import React, { useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// CameraExample component that uses the Capacitor Camera on native, and falls back to a file input on web.
export default function CameraExample() {
  const [photo, setPhoto] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const takePhotoNative = async () => {
    try {
      const result = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });
      setPhoto(result.dataUrl || null);
    } catch (err) {
      console.error('Camera error', err);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const isNative = Capacitor.isNativePlatform();

  return (
    <div className="flex flex-col gap-2 items-start">
      <h3 className="text-lg font-semibold">Camera (native) + Web fallback</h3>
      {isNative ? (
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded"
          onClick={takePhotoNative}
        >
          Open Camera
        </button>
      ) : (
        <>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded"
            onClick={openFilePicker}
          >
            Choose or Take Photo
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onFileChange}
          />
        </>
      )}

      {photo && (
        <div className="mt-2">
          <img src={photo} alt="captured" className="max-w-xs rounded shadow" />
        </div>
      )}
    </div>
  );
}
