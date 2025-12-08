import React, { useRef, useState, useEffect } from "react";
import "./App.css";

const CANVAS_WIDTH = 380;
const CANVAS_HEIGHT = 320;
const PIXEL_SIZE = 8;           // size of each “pixel” square
const BG_COLOR = "#d9d9d9";
const PEN_COLOR = "#222222";

export default function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // helper: fill background
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.imageSmoothingEnabled = false; // keep things blocky
  };

  // draw one pixel cell at mouse/touch position
  const drawPixelAtEvent = (evt) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();

    const clientX = "touches" in evt ? evt.touches[0].clientX : evt.clientX;
    const clientY = "touches" in evt ? evt.touches[0].clientY : evt.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // snap to grid
    const px = Math.floor(x / PIXEL_SIZE) * PIXEL_SIZE;
    const py = Math.floor(y / PIXEL_SIZE) * PIXEL_SIZE;

    ctx.fillStyle = PEN_COLOR;
    ctx.fillRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
  };

  // mouse handlers
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    drawPixelAtEvent(e);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    drawPixelAtEvent(e);
  };

  const handleMouseUp = () => setIsDrawing(false);
  const handleMouseLeave = () => setIsDrawing(false);

  // touch handlers (mobile)
  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    drawPixelAtEvent(e);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    drawPixelAtEvent(e);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  // initialize background
  useEffect(() => {
    clearCanvas();
  }, []);

  const handleResetClick = () => clearCanvas();
  const handleDrawClick = () => clearCanvas(); // optional: start fresh

  return (
    <div className="page">
      <div className="frame">
        <div className="frame-header">Sketch-o-Matic</div>

        <div className="screen">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>

        <div className="controls">
          <button className="btn btn-secondary" onClick={handleResetClick}>
            Reset
          </button>
          <button className="btn btn-primary" onClick={handleDrawClick}>
            Draw
          </button>
        </div>
      </div>
    </div>
  );
}
