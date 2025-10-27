"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Music, File } from "lucide-react";

interface UploadSectionProps {
  onFilesChange: (files: File[]) => void;
}

export function UploadSection({ onFilesChange }: UploadSectionProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(files);
    onFilesChange(files);
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes("audio")) return <Music className="h-4 w-4" />;
    if (file.type.includes("text")) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Context Files
        </CardTitle>
        <CardDescription>
          Upload audio files (.mp3), transcripts (.txt), or configuration files (.json)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".txt,.json,.mp3"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              Choose Files
            </label>
          </Button>
          <span className="text-sm text-muted-foreground">
            Supports .txt, .json, .mp3 files
          </span>
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploaded Files:</h4>
            <div className="space-y-1">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getFileIcon(file)}
                  <span>{file.name}</span>
                  <span className="text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
