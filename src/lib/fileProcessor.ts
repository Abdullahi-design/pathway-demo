// File processing utilities
export async function processUploadedFiles(files: File[]): Promise<ProcessedFile[]> {
  const processedFiles: ProcessedFile[] = [];
  
  for (const file of files) {
    try {
      const content = await readFileContent(file);
      processedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        content: content,
        processedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      // Still include the file but with error content
      processedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        content: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        processedAt: new Date().toISOString(),
        error: true
      });
    }
  }
  
  return processedFiles;
}

async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('File reading failed'));
    };
    
    // Handle different file types
    if (file.type.includes('text') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else if (file.type.includes('audio') || file.name.endsWith('.mp3')) {
      // For audio files, we'll just note that transcription is needed
      resolve(`[AUDIO FILE: ${file.name} - Transcription needed for full content analysis]`);
    } else {
      // For other file types, try to read as text
      reader.readAsText(file);
    }
  });
}

export interface ProcessedFile {
  name: string;
  type: string;
  size: number;
  content: string;
  processedAt: string;
  error?: boolean;
}

// Extract key information from processed files
export function extractContextFromFiles(processedFiles: ProcessedFile[]): string {
  if (processedFiles.length === 0) return '';
  
  let context = '\n\nUPLOADED CONTEXT FILES:\n';
  context += '=' .repeat(50) + '\n';
  
  processedFiles.forEach((file, index) => {
    context += `\nFile ${index + 1}: ${file.name}\n`;
    context += `Type: ${file.type}\n`;
    context += `Size: ${(file.size / 1024).toFixed(1)} KB\n`;
    context += `Processed: ${file.processedAt}\n`;
    
    if (file.error) {
      context += `Status: ERROR - ${file.content}\n`;
    } else {
      // Truncate very long content for prompt efficiency
      const maxLength = 2000;
      const content = file.content.length > maxLength 
        ? file.content.substring(0, maxLength) + '... [truncated]'
        : file.content;
      
      context += `Content:\n${content}\n`;
    }
    context += '\n' + '-'.repeat(40) + '\n';
  });
  
  return context;
}
