import React, { useRef, useState, useEffect } from "react";
import "./App.css";

const CANVAS_WIDTH = 380;
const CANVAS_HEIGHT = 320;
const PIXEL_SIZE = 18;           // size of each “pixel” square
const BG_COLOR = "#d9d9d9";


export default function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#222222");
  // Removed lastPos state (not needed for wrap logic)
  // Mouse up handler for global event
  const handleGlobalMouseUp = () => {
    setIsDrawing(false);
    window.removeEventListener("mousemove", handleGlobalMouseMove);
    window.removeEventListener("mouseup", handleGlobalMouseUp);
  };

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
  // Draw at a given (x, y) in canvas coordinates, wrapping if needed
  const drawPixelAt = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    // Wrap coordinates
    let px = ((Math.floor(x / PIXEL_SIZE) * PIXEL_SIZE) + CANVAS_WIDTH) % CANVAS_WIDTH;
    let py = ((Math.floor(y / PIXEL_SIZE) * PIXEL_SIZE) + CANVAS_HEIGHT) % CANVAS_HEIGHT;
    ctx.fillStyle = brushColor;
    ctx.fillRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
  };

  // For mouse/touch event, get canvas-relative coordinates
  const getCanvasCoords = (evt) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in evt ? evt.touches[0].clientX : evt.clientX;
    const clientY = "touches" in evt ? evt.touches[0].clientY : evt.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Draw at event position (mouse/touch)
  const drawPixelAtEvent = (evt) => {
    const { x, y } = getCanvasCoords(evt);
    drawPixelAt(x, y);
  };

  // mouse handlers
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    drawPixelAtEvent(e);
    // Listen for mousemove/mouseup on window for wrap
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
  };

  // Normal mouse move inside canvas
  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    drawPixelAtEvent(e);
  };

  // Mouse move anywhere (for wrap)
  const handleGlobalMouseMove = (e) => {
    if (!isDrawing) return;
    // If mouse is outside canvas, wrap
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    // If out of bounds, wrap
    if (x < 0) x = CANVAS_WIDTH + x;
    if (x >= CANVAS_WIDTH) x = x - CANVAS_WIDTH;
    if (y < 0) y = CANVAS_HEIGHT + y;
    if (y >= CANVAS_HEIGHT) y = y - CANVAS_HEIGHT;
    drawPixelAt(x, y);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    window.removeEventListener("mousemove", handleGlobalMouseMove);
    window.removeEventListener("mouseup", handleGlobalMouseUp);
  };

  const handleMouseLeave = () => {
    // Do not stop drawing, allow wrap
  };

  // touch handlers (mobile)
  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    drawPixelAtEvent(e);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    // Wrap touch coordinates
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let x = e.touches[0].clientX - rect.left;
    let y = e.touches[0].clientY - rect.top;
    if (x < 0) x = CANVAS_WIDTH + x;
    if (x >= CANVAS_WIDTH) x = x - CANVAS_WIDTH;
    if (y < 0) y = CANVAS_HEIGHT + y;
    if (y >= CANVAS_HEIGHT) y = y - CANVAS_HEIGHT;
    drawPixelAt(x, y);
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
  // Save canvas as image
  const handleSaveClick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'sketch.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

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
          <div className="side-buttons">
            <label className="btn btn-small" title="Change Brush Color" >
              <span className="color-btn-swatch">
                <span className="color-btn-swatch-inner" style={{ background: brushColor }} />
                <input
                  type="color"
                  value={brushColor}
                  onChange={e => setBrushColor(e.target.value)}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0, padding: 0, border: 'none' }}
                  aria-label="Pick brush color"
                />
              </span>
            </label>
            <button
              className="btn btn-small"
              title="Eraser"
              onClick={() => setBrushColor(BG_COLOR)}
            >
              Eraser
            </button>
            <button className="btn btn-small" title="Small 3" >Text</button>
          </div>
          <div className="btn-main-group">
          <button className="btn btn-secondary" onClick={handleResetClick}>
            Reset
          </button>
          <button className="btn btn-primary" onClick={handleSaveClick}>
            Save
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
