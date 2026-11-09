"use client";

import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect } from "react-konva";
import Konva from "konva";
import { CustomEditorConfig } from "@/types/database.types";
import { ZoomIn, ZoomOut, RotateCw, Type, Sliders, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface KonvaEditorProps {
  imageSrc: string;
  filter: "none" | "grayscale" | "vintage" | "sketch";
  textConfig: {
    content: string;
    fontFamily: string;
    fontSize: number;
    color: string;
  };
  onConfigChange: (config: CustomEditorConfig) => void;
  aspectRatio?: number; // width / height, e.g. 3/4
}

export default function KonvaEditor({
  imageSrc,
  filter,
  textConfig,
  onConfigChange,
  aspectRatio = 3 / 4,
}: KonvaEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const imageRef = useRef<Konva.Image>(null);

  const [dimensions, setDimensions] = useState({ width: 400, height: 533 });
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  // Resize canvas according to container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth || 380;
        const h = Math.round(w / aspectRatio);
        setDimensions({ width: w, height: h });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [aspectRatio]);

  // Load HTML Image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      setImageObj(img);
      // Center and fit image
      const scaleX = dimensions.width / img.width;
      const scaleY = dimensions.height / img.height;
      const initialScale = Math.max(scaleX, scaleY);
      setScale(initialScale);
      setPosition({
        x: (dimensions.width - img.width * initialScale) / 2,
        y: (dimensions.height - img.height * initialScale) / 2,
      });
    };
  }, [imageSrc, dimensions.width, dimensions.height]);

  // Apply Konva filters
  useEffect(() => {
    if (!imageRef.current) return;

    const node = imageRef.current;
    node.clearCache();

    if (filter === "none") {
      node.filters([]);
    } else if (filter === "grayscale") {
      node.filters([Konva.Filters.Grayscale]);
    } else if (filter === "vintage") {
      node.filters([Konva.Filters.Sepia, Konva.Filters.Contrast]);
      node.contrast(15);
    } else if (filter === "sketch") {
      node.filters([Konva.Filters.Grayscale, Konva.Filters.Invert, Konva.Filters.Blur]);
      node.blurRadius(2);
    }

    try {
      node.cache();
    } catch {
      // CORS or empty image fallback
    }
    stageRef.current?.batchDraw();
  }, [filter, imageObj]);

  const handleZoom = (delta: number) => {
    setScale((prev) => {
      const next = Math.max(0.4, Math.min(3.5, prev + delta));
      onConfigChange({ zoom: next, position, filter, text: { ...textConfig, position: { x: 20, y: dimensions.height - 40 } } });
      return next;
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    if (!imageObj) return;
    const scaleX = dimensions.width / imageObj.width;
    const scaleY = dimensions.height / imageObj.height;
    const init = Math.max(scaleX, scaleY);
    setScale(init);
    setPosition({
      x: (dimensions.width - imageObj.width * init) / 2,
      y: (dimensions.height - imageObj.height * init) / 2,
    });
    setRotation(0);
  };

  return (
    <div className="flex flex-col items-center space-y-3 w-full">
      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-[420px] rounded-2xl overflow-hidden bg-neutral-900 border border-border shadow-2xl touch-none select-none"
        style={{ height: dimensions.height }}
      >
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          className="cursor-grab active:cursor-grabbing"
        >
          <Layer>
            {/* Background Rect */}
            <Rect
              x={0}
              y={0}
              width={dimensions.width}
              height={dimensions.height}
              fill="#18181b"
            />

            {/* Draggable User Image */}
            {imageObj && (
              <KonvaImage
                ref={imageRef}
                image={imageObj}
                x={position.x}
                y={position.y}
                scaleX={scale}
                scaleY={scale}
                rotation={rotation}
                draggable
                onDragEnd={(e) => {
                  const newPos = { x: e.target.x(), y: e.target.y() };
                  setPosition(newPos);
                  onConfigChange({
                    zoom: scale,
                    position: newPos,
                    filter,
                    rotation,
                    text: { ...textConfig, position: { x: 20, y: dimensions.height - 40 } },
                  });
                }}
              />
            )}

            {/* Text Overlay */}
            {textConfig.content.trim() && (
              <KonvaText
                text={textConfig.content}
                x={20}
                y={dimensions.height - 48}
                width={dimensions.width - 40}
                align="center"
                fontFamily={textConfig.fontFamily}
                fontSize={textConfig.fontSize}
                fill={textConfig.color}
                fontStyle="bold"
                draggable
                shadowColor="rgba(0,0,0,0.6)"
                shadowBlur={6}
                shadowOffset={{ x: 1, y: 1 }}
                shadowOpacity={0.8}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Canvas Tool Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-card border border-border/80 px-3 py-2 rounded-2xl shadow-sm text-xs w-full max-w-[420px]">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handleZoom(0.1)}
          className="h-8 px-2.5 rounded-lg flex items-center gap-1"
        >
          <ZoomIn className="h-3.5 w-3.5" />
          Zoom In
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handleZoom(-0.1)}
          className="h-8 px-2.5 rounded-lg flex items-center gap-1"
        >
          <ZoomOut className="h-3.5 w-3.5" />
          Zoom Out
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleRotate}
          className="h-8 px-2.5 rounded-lg flex items-center gap-1"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Rotate
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleReset}
          className="h-8 px-2.5 rounded-lg flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}
