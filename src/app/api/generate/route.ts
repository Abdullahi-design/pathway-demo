import { NextResponse } from "next/server";
import { mockGenerate } from "@/lib/mockGenerator";
import { processUploadedFiles, extractContextFromFiles, ProcessedFile } from "@/lib/fileProcessor";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Process uploaded files if any
    let processedFiles: ProcessedFile[] = [];
    if (body.files && body.files.length > 0) {
      // Convert file objects back to File instances for processing
      const fileInstances = body.files.map((fileData: any) => {
        const file = new File([], fileData.name, { type: fileData.type });
        Object.defineProperty(file, 'size', { value: fileData.size });
        return file;
      });
      
      processedFiles = await processUploadedFiles(fileInstances);
    }
    
    // Add processed file context to the config
    const enhancedConfig = {
      ...body,
      processedFiles: processedFiles,
      fileContext: extractContextFromFiles(processedFiles)
    };
    
    const data = await mockGenerate(enhancedConfig);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate pathway',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
