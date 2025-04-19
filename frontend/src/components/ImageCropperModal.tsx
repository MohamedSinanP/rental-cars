import React, { useState, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface Props {
  image: File;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

const ImageCropperModal: React.FC<Props> = ({ image, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  }); const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  const generateCroppedImage = async (crop: PixelCrop) => {
    if (!imageRef || !crop.width || !crop.height) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;

    canvas.width = crop.width;
    canvas.height = crop.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      imageRef,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], image.name, { type: 'image/jpeg' });
          onCropComplete(file);
          resolve();
        }
      }, 'image/jpeg');
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex justify-center items-center">
      <div className="bg-white p-4 rounded-xl w-full max-w-2xl">
        <div className="relative w-full h-[70vh] bg-gray-100 rounded-md overflow-auto flex justify-center items-center">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            ruleOfThirds
          >
            <img
              src={URL.createObjectURL(image)}
              onLoad={(e) => setImageRef(e.currentTarget)}
              alt="Crop me"
              style={{ maxHeight: '65vh' }}
            />
          </ReactCrop>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">
            Cancel
          </button>
          <button
            onClick={() => completedCrop && generateCroppedImage(completedCrop)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
