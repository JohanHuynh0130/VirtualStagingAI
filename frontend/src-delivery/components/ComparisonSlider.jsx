import React, { useState, useRef, useEffect } from 'react';
import { MoveHorizontal } from 'lucide-react';

const ComparisonSlider = ({ beforeImage, afterImage, alt }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleMove = (event) => {
        if (!containerRef.current) return;

        const { left, width } = containerRef.current.getBoundingClientRect();
        const headers = [event.clientX, event.touches?.[0]?.clientX].filter(x => x !== undefined);
        const clientX = headers[0];

        if (clientX === undefined) return;

        let position = ((clientX - left) / width) * 100;
        position = Math.max(0, Math.min(100, position));
        setSliderPosition(position);
    };

    const handleMouseDown = () => setIsDragging(true);

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        const handleGlobalMouseMove = (e) => {
            if (isDragging) handleMove(e);
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        window.addEventListener('touchend', handleGlobalMouseUp);
        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('touchmove', handleGlobalMouseMove);

        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('touchend', handleGlobalMouseUp);
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('touchmove', handleGlobalMouseMove);
        };
    }, [isDragging]);

    return (
        <div
            ref={containerRef}
            className="relative w-full overflow-hidden bg-gray-100 select-none cursor-ew-resize group rounded-none"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onClick={handleMove}
        >
            <img
                src={afterImage}
                alt={`Staged ${alt}`}
                className="block w-full h-auto object-cover pointer-events-none opacity-0"
            />
            {/* We render a hidden image to just force the container height to match aspect ratio */}

            <img
                src={afterImage}
                alt={`Staged ${alt}`}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            <div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img
                    src={beforeImage}
                    alt={`Empty ${alt}`}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>

            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:scale-110 transition-transform">
                    <MoveHorizontal className="w-5 h-5" />
                </div>
            </div>

            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-none pointer-events-none uppercase tracking-wider font-heading">
                Before
            </div>
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-medium px-3 py-1.5 rounded-none pointer-events-none shadow-sm uppercase tracking-wider font-heading">
                Staged
            </div>
        </div>
    );
};

export default ComparisonSlider;
