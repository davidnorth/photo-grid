import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { LeafNode, ImageState } from '../types';
import { clsx } from 'clsx';

interface CellProps {
    node: LeafNode;
    onImageDrop: (id: string, file: File) => void;
    onImageUpdate: (id: string, updates: Partial<ImageState>) => void;
    className?: string;
}

export const Cell: React.FC<CellProps> = ({ node, onImageDrop, onImageUpdate, className }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Local state for smooth interaction, synced with prop
    // We use the prop as the source of truth but local state for immediate feedback
    // Actually, let's just use the prop to avoid sync issues, unless performance is bad.

    const imageState = node.image || { url: '', zoom: 1, pan: { x: 0, y: 0 } };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            onImageDrop(node.id, file);
        }
    };

    const handleClick = () => {
        if (!node.image) {
            inputRef.current?.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageDrop(node.id, file);
        }
    };

    // Pan/Zoom Logic
    const calculateConstraints = () => {
        if (!containerRef.current || !imageRef.current || !node.image) return null;

        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        const iw = imageRef.current.naturalWidth;
        const ih = imageRef.current.naturalHeight;

        if (iw === 0 || ih === 0) return null;

        const minZoom = Math.max(cw / iw, ch / ih);
        const currentZoom = Math.max(imageState.zoom, minZoom);

        // Calculate max pan allowed
        // Image dimensions at current zoom
        const dw = iw * currentZoom;
        const dh = ih * currentZoom;

        // Max offset from center (where 0,0 is center aligned)
        // If image is centered, left edge is at (cw - dw)/2
        // We want to allow panning such that left edge <= 0 and right edge >= cw
        // maxPanX is the distance we can move away from center
        const maxPanX = (dw - cw) / 2;
        const maxPanY = (dh - ch) / 2;

        return { minZoom, maxPanX, maxPanY, currentZoom };
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!node.image) return;
        e.preventDefault();
        e.stopPropagation();

        const constraints = calculateConstraints();
        if (!constraints) return;

        const { minZoom } = constraints;
        const zoomSpeed = 0.001;
        const newZoom = Math.max(minZoom, imageState.zoom - e.deltaY * zoomSpeed);

        // When zooming, we might need to clamp pan
        // We'll let the effect handle clamping or do it here?
        // Doing it here is better for single update

        // Re-calculate constraints with new zoom
        // Actually, let's just update zoom and let the clamper handle pan
        onImageUpdate(node.id, { zoom: newZoom });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!node.image) return;
        e.preventDefault();
        setIsPanning(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning || !node.image) return;
        e.preventDefault();

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        const newPan = {
            x: imageState.pan.x + dx,
            y: imageState.pan.y + dy,
        };

        setDragStart({ x: e.clientX, y: e.clientY });
        onImageUpdate(node.id, { pan: newPan });
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleMouseLeave = () => {
        setIsPanning(false);
    };

    // Clamp values effect
    useLayoutEffect(() => {
        if (!node.image) return;
        const constraints = calculateConstraints();
        if (!constraints) return;

        const { minZoom, maxPanX, maxPanY, currentZoom } = constraints;

        let needsUpdate = false;
        const updates: Partial<ImageState> = {};

        if (imageState.zoom < minZoom) {
            updates.zoom = minZoom;
            needsUpdate = true;
        }

        // Clamp pan
        const clampedX = Math.max(-maxPanX, Math.min(maxPanX, imageState.pan.x));
        const clampedY = Math.max(-maxPanY, Math.min(maxPanY, imageState.pan.y));

        if (Math.abs(clampedX - imageState.pan.x) > 0.1 || Math.abs(clampedY - imageState.pan.y) > 0.1) {
            updates.pan = { x: clampedX, y: clampedY };
            needsUpdate = true;
        }

        if (needsUpdate) {
            onImageUpdate(node.id, updates);
        }
    }, [node.image, imageState.zoom, imageState.pan.x, imageState.pan.y, containerRef.current?.clientWidth, containerRef.current?.clientHeight]);

    // Also need to handle window resize to re-clamp
    useEffect(() => {
        const handleResize = () => {
            // Trigger re-render or re-check
            // The layout effect will run if we force update or if dimensions change?
            // We might need a ResizeObserver on the container
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ResizeObserver
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(() => {
            if (node.image) {
                onImageUpdate(node.id, {});
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [node.id, node.image, onImageUpdate]);


    return (
        <div
            ref={containerRef}
            className={clsx(
                'relative w-full h-full overflow-hidden flex items-center justify-center transition-colors select-none',
                isDragging && 'bg-blue-50 border-blue-500',
                !node.image && 'bg-gray-100 cursor-pointer hover:bg-gray-200 border-2 border-dashed border-gray-300',
                node.image && 'bg-white',
                isPanning && 'cursor-move',
                !isPanning && node.image && 'cursor-grab',
                className
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {node.image ? (
                <img
                    ref={imageRef}
                    src={node.image.url}
                    alt=""
                    className="absolute max-w-none origin-center pointer-events-none"
                    style={{
                        transform: `translate(-50%, -50%) translate(${imageState.pan.x}px, ${imageState.pan.y}px) scale(${imageState.zoom})`,
                        left: '50%',
                        top: '50%',
                    }}
                    onLoad={() => {
                        // Set initial zoom to minimum (fit to cover)
                        if (containerRef.current && imageRef.current) {
                            const cw = containerRef.current.clientWidth;
                            const ch = containerRef.current.clientHeight;
                            const iw = imageRef.current.naturalWidth;
                            const ih = imageRef.current.naturalHeight;

                            if (iw > 0 && ih > 0) {
                                const minZoom = Math.max(cw / iw, ch / ih);
                                onImageUpdate(node.id, { zoom: minZoom });
                            }
                        }
                    }}
                />
            ) : (
                <div className="text-gray-400 text-sm font-medium select-none pointer-events-none">
                    Drop Image Here
                </div>
            )}
        </div>
    );
};
