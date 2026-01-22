import { useEffect, useRef } from 'react';
import { useStore } from '../stores/useStore';
import ImageProcessorWorker from '../workers/imageProcessor.worker?worker';

export function useImageProcessor() {
  const workerRef = useRef<Worker | null>(null);
  const {
    sourceImage,
    config,
    collections,
    activeCollectionId,
    enabledCharIds,
    setProcessedCells,
    setIsProcessing,
  } = useStore();

  useEffect(() => {
    workerRef.current = new ImageProcessorWorker();

    const worker = workerRef.current;
    worker.onmessage = (e) => {
      if (e.data.type === 'result') {
        setProcessedCells(e.data.cells);
        setIsProcessing(false);
      }
    };

    return () => {
      worker.terminate();
    };
  }, [setProcessedCells, setIsProcessing]);

  useEffect(() => {
    if (!sourceImage || !activeCollectionId) return;

    const activeCollection = collections.find((c) => c.id === activeCollectionId);
    if (!activeCollection || activeCollection.chars.length === 0) return;

    // Filter only enabled chars
    const enabledChars = activeCollection.chars.filter(ch => enabledCharIds.has(ch.id));
    if (enabledChars.length === 0) {
      console.warn('No hay caracteres habilitados en la colección');
      return;
    }

    console.log(`Procesando con ${enabledChars.length} caracteres de "${activeCollection.name}"`);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = sourceImage.width;
    canvas.height = sourceImage.height;
    ctx.drawImage(sourceImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setIsProcessing(true);
    workerRef.current?.postMessage({
      type: 'process',
      imageData,
      config,
      chars: enabledChars,
    });
  }, [sourceImage, config, collections, activeCollectionId, enabledCharIds, setIsProcessing, setProcessedCells]);

  return null;
}
