# Pathway Generator Demo App

A Next.js 14 demo application that simulates AI-powered conversational pathway generation from user context files.

## Features

- **File Upload**: Support for .txt, .json, and .mp3 files
- **Configuration Form**: Customizable pathway parameters including voice settings, interruption thresholds, and robustness levels
- **Interactive Visualization**: React Flow-based pathway diagrams with nodes and connections
- **Real-time Generation**: Simulated API calls with progress indicators
- **Modern UI**: Clean design using ShadCN/UI components and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN/UI
- **Flow Visualization**: React Flow
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pathway-demo
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/generate/route.ts    # API endpoint for pathway generation
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page component
├── components/
│   ├── ui/                      # ShadCN/UI components
│   ├── UploadSection.tsx        # File upload component
│   ├── ConfigForm.tsx           # Configuration form
│   └── PathwayViewer.tsx         # Pathway visualization
└── lib/
    └── mockGenerator.ts         # Mock pathway generation logic
```

## Usage

1. **Upload Files**: Select .txt, .json, or .mp3 files to provide context
2. **Configure Settings**: 
   - Set pathway name
   - Choose voice setting (Default, Calm, Energetic)
   - Adjust interruption threshold (0-1)
   - Select robustness level (Quick, Medium, Production)
3. **Generate**: Click "Generate Pathway" to create the conversational flow
4. **Visualize**: View the generated pathway as an interactive diagram
5. **Regenerate**: Use the regenerate button to create new variations

## API Endpoints

### POST /api/generate

Generates a pathway based on configuration and uploaded files.

**Request Body:**
```json
{
  "name": "string",
  "voice": "Default" | "Calm" | "Energetic",
  "interruptionThreshold": number,
  "robustnessLevel": "Quick" | "Medium" | "Production",
  "files": [
    {
      "name": "string",
      "type": "string",
      "size": number
    }
  ]
}
```

**Response:**
```json
{
  "pathway_name": "string",
  "nodes": [
    {
      "id": "string",
      "type": "prompt" | "action",
      "title": "string",
      "prompt": "string"
    }
  ],
  "edges": [
    {
      "from": "string",
      "to": "string",
      "condition": "string"
    }
  ],
  "meta": {
    "confidence": number,
    "generated_at": "string"
  }
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Netlify

1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify

### Manual Deployment

1. Build the project: `npm run build`
2. Start the production server: `npm start`

## Customization

### Adding New File Types

Update the `accept` attribute in `UploadSection.tsx`:
```tsx
accept=".txt,.json,.mp3,.wav,.pdf"
```

### Modifying Pathway Generation

Edit `mockGenerator.ts` to customize the generated pathways:
- Add new node types
- Modify edge conditions
- Adjust confidence scoring

### Styling Changes

- Update Tailwind classes in components
- Modify ShadCN theme in `components.json`
- Add custom CSS in `globals.css`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Demo

Live demo available at: [https://pathway-demo-three.vercel.app](https://pathway-demo-three.vercel.app)

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.