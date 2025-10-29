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
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleGenerate = async (config: any) => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate pathway');
      }

      const data = await response.json();
      
      // Check if the response contains an error
      if (data.error) {
        throw new Error(data.message || 'Failed to generate pathway');
      }
      
      setPathwayData(data);
      setProgress(100);
    } catch (error) {
      console.error("Error generating pathway:", error);
      setError(error instanceof Error ? error.message : 'Failed to generate pathway');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to regenerate pathway');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to regenerate pathway');
      }
      
      setPathwayData(data);
    } catch (error) {
      console.error("Error regenerating pathway:", error);
      setError(error instanceof Error ? error.message : 'Failed to regenerate pathway');
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

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Error generating pathway</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-sm mt-2 underline"
              >
                Dismiss
              </button>
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