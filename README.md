# Photo Grid Maker

A web-based photo grid creator that lets you arrange photos in customizable layouts and export them as a single image.

## Features

- **Flexible Layouts**: Choose from multiple preset grid layouts (single, 2 columns, 2 rows, 2x2 grid, and complex split layouts)
- **Drag & Drop**: Simply drag images from your computer into any cell
- **Pan & Zoom**: 
  - Scroll to zoom in/out on images
  - Click and drag to pan images within cells
  - Images automatically fit to cover cells while maintaining aspect ratio
- **Adjustable Spacing**: Control padding around the entire composition and between cells with a slider
- **Export**: Download your photo grid as a high-quality PNG image

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd photo-grid
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Select a Layout**: Click one of the layout buttons in the sidebar (Single, 2 Columns, 2 Rows, etc.)
2. **Add Photos**: 
   - Drag and drop images from your computer into the grid cells
   - Or click on a cell to open the file picker
3. **Adjust Images**: 
   - Use mouse wheel to zoom in/out
   - Click and drag to reposition images within cells
4. **Customize Spacing**: Use the padding slider to adjust the frame and gaps
5. **Export**: Click "Export Image" to download your photo grid as a PNG

## Tech Stack

- React 19
- TypeScript
- Vite
- html-to-image (for export functionality)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

MIT
