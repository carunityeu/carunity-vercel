import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Crop, X, CheckCircle } from 'lucide-react';

const ASPECT = 4 / 3;

function initCrop(width, height) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, ASPECT, width, height),
    width,
    height
  );
}

export default function ImageCropModal({ imageSrc, onDone, onCancel }) {
  const [crop, setCrop] = useState(undefined);
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    setCrop(initCrop(width, height));
  }, []);

  const getCroppedBlob = useCallback(() => {
    return new Promise((resolve, reject) => {
      const image = imgRef.current;
      if (!image || !completedCrop) return reject('No crop');

      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = Math.round(completedCrop.width * scaleX);
      canvas.height = Math.round(completedCrop.height * scaleY);

      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0, 0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Canvas toBlob failed');
      }, 'image/jpeg', 0.92);
    });
  }, [completedCrop]);

  const handleCrop = async () => {
    const blob = await getCroppedBlob();
    onDone(blob, true); // true = was cropped
  };

  const handleSkip = () => {
    fetch(imageSrc)
      .then(r => r.blob())
      .then(blob => onDone(blob, false)); // false = original
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Обрезать фото</h2>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Crop area */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100 dark:bg-slate-800 mx-4 my-3 rounded-xl min-h-0">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={ASPECT}
            minWidth={40}
            className="max-h-full"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="crop preview"
              onLoad={onImageLoad}
              style={{ maxHeight: '55vh', maxWidth: '100%', display: 'block' }}
            />
          </ReactCrop>
        </div>

        <p className="text-xs text-slate-400 text-center -mt-1 mb-2">Перетащите область или измените её размер. Соотношение 4:3 — оптимально для карточек.</p>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-5">
          <Button type="button" variant="outline" className="flex-1" onClick={handleSkip}>
            Без обрезки
          </Button>
          <Button
            type="button"
            disabled={!completedCrop}
            onClick={handleCrop}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Применить обрезку
          </Button>
        </div>
      </div>
    </div>
  );
}