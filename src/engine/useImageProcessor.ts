import { useEffect, useRef } from 'react';
import { useStore } from '../stores/useStore';
import { SVGChar } from '../types';
import ImageProcessorWorker from '../workers/imageProcessor.worker?worker';

const DEBOUNCE_MS = 100; // Wait 100ms before processing

export function useImageProcessor() {
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<number>();
  const {
    sourceImage,
    config,
    collections,
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

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      setIsProcessing(false);
    };

    return () => {
      worker.terminate();
    };
  }, [setProcessedCells, setIsProcessing]);

  useEffect(() => {
    if (!sourceImage) return;

    // Clear any pending debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Collect all enabled chars from all collections
    const allEnabledChars: SVGChar[] = [];
    collections.forEach(collection => {
      collection.chars.forEach(char => {
        if (enabledCharIds.has(char.id)) {
          allEnabledChars.push(char);
        }
      });
    });

    if (allEnabledChars.length === 0) {
      console.warn('No hay caracteres habilitados');
      setIsProcessing(false);
      return;
    }

    console.log(`Procesando con ${allEnabledChars.length} caracteres de ${collections.length} colección(es)`);

    // Debounce processing to avoid overwhelming the worker
    timeoutRef.current = window.setTimeout(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Use canvas dimensions from config, or limit image size for better performance
      const MAX_DIMENSION = 1920;
      let width = config.canvasWidth || sourceImage.width;
      let height = config.canvasHeight || sourceImage.height;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(sourceImage, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      setIsProcessing(true);
      workerRef.current?.postMessage({
        type: 'process',
        imageData,
        config,
        chars: allEnabledChars,
      });

      // Safety timeout to prevent indefinite processing
      const safetyTimeoutId = setTimeout(() => {
        console.warn('Processing timeout - resetting state');
        setIsProcessing(false);
      }, 30000); // 30 seconds timeout

      return () => {
        clearTimeout(safetyTimeoutId);
      };
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [sourceImage, config, collections, enabledCharIds, setIsProcessing, setProcessedCells]);

  return null;
}
