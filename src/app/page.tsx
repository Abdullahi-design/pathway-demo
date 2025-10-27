"use client";

import { useState } from "react";
import { UploadSection } from "@/components/UploadSection";
import { ConfigForm } from "@/components/ConfigForm";
import { PathwayViewer } from "@/components/PathwayViewer";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader2 } from "lucide-react";

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [pathwayData, setPathwayData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleGenerate = async (config: any) => {
    setIsGenerating(true);
    setProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...config,
          files: uploadedFiles.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
          }))
        }),
      });

      const data = await response.json();
      setPathwayData(data);
      setProgress(100);
    } catch (error) {
      console.error("Error generating pathway:", error);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: pathwayData?.pathway_name || "Regenerated Pathway",
          voice: "Default",
          interruptionThreshold: 0.5,
          robustnessLevel: "Medium"
        }),
      });

      const data = await response.json();
      setPathwayData(data);
    } catch (error) {
      console.error("Error regenerating pathway:", error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Pathway Generator</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate conversational pathways from your context files. Upload audio, transcripts, or configurations to create intelligent conversation flows.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Upload and Config Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <UploadSection onFilesChange={handleFilesChange} />
            <ConfigForm onSubmit={handleGenerate} isLoading={isGenerating} />
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating pathway...
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Pathway Viewer */}
          {pathwayData && (
            <PathwayViewer
              pathwayData={pathwayData}
              onRegenerate={handleRegenerate}
              isRegenerating={isRegenerating}
            />
          )}

          {/* Empty State */}
          {!pathwayData && !isGenerating && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Brain className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Ready to Generate Your First Pathway?
              </h3>
              <p className="text-gray-500">
                Upload your context files and configure the settings above to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}