import { useState, useRef, useEffect } from 'react';
import { DEFAULT_LAYOUTS } from './constants';
import { Layout, ImageState } from './types';
import { LayoutRenderer } from './components/LayoutRenderer';
import { clsx } from 'clsx';
import { toPng } from 'html-to-image';

function App() {
    const [currentLayout, setCurrentLayout] = useState<Layout>(DEFAULT_LAYOUTS[1]); // Default to 2 columns
    const [images, setImages] = useState<Record<string, ImageState>>({});
    const [padding, setPadding] = useState(10);
    const [scale, setScale] = useState(1);
    const gridRef = useRef<HTMLDivElement>(null);

    // Calculate scale factor based on window size
    useEffect(() => {
        const calculateScale = () => {
            const sidebarWidth = 256;
            const containerPadding = 32; // 16px on each side
            const gridWidth = 800;
            const gridHeight = gridWidth / currentLayout.aspectRatio;

            const availableWidth = window.innerWidth - sidebarWidth - containerPadding;
            const availableHeight = window.innerHeight - containerPadding;

            const scaleX = availableWidth / gridWidth;
            const scaleY = availableHeight / gridHeight;

            setScale(Math.min(scaleX, scaleY));
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, [currentLayout.aspectRatio]);

    const handleImageDrop = (id: string, file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target?.result as string;
            setImages((prev) => ({
                ...prev,
                [id]: {
                    url,
                    zoom: 1,
                    pan: { x: 0, y: 0 },
                },
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpdate = (id: string, updates: Partial<ImageState>) => {
        setImages((prev) => {
            if (!prev[id]) return prev;
            return {
                ...prev,
                [id]: { ...prev[id], ...updates },
            };
        });
    };

    const handleExport = async () => {
        if (!gridRef.current) return;
        try {
            // Temporarily remove transform to capture at full 800px resolution
            const originalTransform = gridRef.current.style.transform;
            gridRef.current.style.transform = 'none';

            // Wait a tick for the transform to be removed
            await new Promise(resolve => setTimeout(resolve, 0));

            const dataUrl = await toPng(gridRef.current, {
                cacheBust: true,
                skipFonts: true,
            });

            // Restore transform
            gridRef.current.style.transform = originalTransform;

            const link = document.createElement('a');
            link.download = 'photo-grid.png';
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to export image', err);
            alert('Failed to export image. See console for details.');
        }
    };

    // Helper to inject images into the layout tree for rendering
    const mergeImagesIntoNode = (node: any): any => {
        if (node.type === 'leaf') {
            return { ...node, image: images[node.id] };
        }
        return {
            ...node,
            children: node.children.map(mergeImagesIntoNode),
        };
    };

    const activeRoot = mergeImagesIntoNode(currentLayout.root);

    return (
        <div className="flex h-screen w-screen bg-gray-900 text-white">
            {/* Sidebar Controls */}
            <div className="w-64 flex-shrink-0 border-r border-gray-800 p-6 flex flex-col gap-8 overflow-y-auto">
                <div>
                    <h1 className="text-xl font-bold mb-6">Photo Grid</h1>

                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Layouts</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {DEFAULT_LAYOUTS.map((layout) => (
                                <button
                                    key={layout.id}
                                    onClick={() => setCurrentLayout(layout)}
                                    className={clsx(
                                        "px-3 py-2 text-sm rounded-md transition-colors text-left",
                                        currentLayout.id === layout.id
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                                    )}
                                >
                                    {layout.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Spacing</h2>
                    <div>
                        <label className="block text-xs text-gray-500 mb-2">Padding ({padding}px)</label>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            value={padding}
                            onChange={(e) => setPadding(Number(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>
                </div>

                <div className="mt-auto">
                    <button
                        className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
                        onClick={handleExport}
                    >
                        Export Image
                    </button>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex items-center justify-center bg-gray-950 p-4 overflow-hidden">
                <div
                    style={{
                        width: `${800 * scale}px`,
                        height: `${(800 / currentLayout.aspectRatio) * scale}px`,
                    }}
                >
                    <div
                        ref={gridRef}
                        className="relative bg-white shadow-2xl"
                        style={{
                            width: '800px',
                            aspectRatio: currentLayout.aspectRatio,
                            backgroundColor: '#ffffff',
                            transformOrigin: 'top left',
                            transform: `scale(${scale})`,
                        }}
                    >
                        <div
                            className="w-full h-full"
                            style={{
                                padding: `${padding}px`, // Frame padding around entire composition
                            }}
                        >
                            <LayoutRenderer
                                node={activeRoot}
                                padding={padding}
                                onImageDrop={handleImageDrop}
                                onImageUpdate={handleImageUpdate}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
