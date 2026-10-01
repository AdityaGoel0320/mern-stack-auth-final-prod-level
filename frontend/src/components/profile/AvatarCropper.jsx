import React, { useEffect, useState } from "react";
import Cropper from "react-easy-crop";

const AvatarCropper = ({
  image,
  onCancel,
  onCropComplete,
}) => {
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState(null);

  useEffect(() => {
    setCrop({
      x: 0,
      y: 0,
    });

    setZoom(1);

    setCroppedAreaPixels(null);
  }, [image]);

  const handleCropComplete = (
    _,
    croppedPixels
  ) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const createCroppedImage = async (
    imageSrc,
    pixelCrop
  ) => {
    const img = new Image();

    img.src = imageSrc;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement("canvas");

    const size = 800;

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Could not create canvas context."
      );
    }

    ctx.drawImage(
      img,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      size,
      size
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Could not create cropped image."
              )
            );

            return;
          }

          const file = new File(
            [blob],
            "avatar.jpg",
            {
              type: "image/jpeg",
              lastModified: Date.now(),
            }
          );

          resolve(file);
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const handleApplyCrop = async () => {
    try {
      if (!croppedAreaPixels) {
        return;
      }

      const croppedFile =
        await createCroppedImage(
          image,
          croppedAreaPixels
        );

      onCropComplete(croppedFile);
    } catch (error) {
      console.error(
        "Image crop error:",
        error
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Crop Profile Photo
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Position your photo inside the circle
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close crop editor"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

        </div>

        {/* Crop Area */}
        <div className="relative h-[380px] w-full bg-gray-950">

          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={
              handleCropComplete
            }
          />

        </div>

        {/* Zoom */}
        <div className="px-6 pt-5">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-xs font-medium text-gray-500">
              Zoom
            </span>

            <span className="text-xs font-semibold text-gray-700">
              {zoom.toFixed(1)}x
            </span>

          </div>

          <div className="flex items-center gap-3">

            <span className="text-gray-400 text-sm">
              −
            </span>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) =>
                setZoom(
                  Number(e.target.value)
                )
              }
              className="w-full accent-indigo-600"
            />

            <span className="text-gray-400 text-sm">
              +
            </span>

          </div>

        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-5">

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            Apply Crop
          </button>

        </div>

      </div>

    </div>
  );
};

export default AvatarCropper;
