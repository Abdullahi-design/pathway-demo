"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings, Loader2 } from "lucide-react";

interface ConfigFormProps {
  onSubmit: (config: any) => void;
  isLoading: boolean;
}

export function ConfigForm({ onSubmit, isLoading }: ConfigFormProps) {
  const [config, setConfig] = useState({
    name: "",
    voice: "Default",
    interruptionThreshold: 0.5,
    robustnessLevel: "Medium"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Pathway Configuration
        </CardTitle>
        <CardDescription>
          Configure the parameters for pathway generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 text-black">
          <div className="space-y-2">
            <Label htmlFor="pathway-name" className="text-black">Pathway Name</Label>
            <Input
              id="pathway-name"
              placeholder="Enter pathway name..."
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-setting">Voice Setting</Label>
            <Select value={config.voice} onValueChange={(value) => setConfig({ ...config, voice: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select voice setting" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="Default" className="cursor-pointer">Default</SelectItem>
                <SelectItem value="Calm" className="cursor-pointer">Calm</SelectItem>
                <SelectItem value="Energetic" className="cursor-pointer">Energetic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interruption-threshold">Interruption Threshold</Label>
            <Input
              id="interruption-threshold"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={config.interruptionThreshold}
              onChange={(e) => setConfig({ ...config, interruptionThreshold: parseFloat(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground text-black">Range: 0.0 - 1.0</p>
          </div>

          <div className="space-y-3">
            <Label>Robustness Level</Label>
            <RadioGroup
              value={config.robustnessLevel}
              onValueChange={(value) => setConfig({ ...config, robustnessLevel: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Quick" id="quick" />
                <Label htmlFor="quick">Quick</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Medium" id="medium" />
                <Label htmlFor="medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Production" id="production" />
                <Label htmlFor="production">Production</Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full text-white" disabled={isLoading} variant={"outline"}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Pathway...
              </>
            ) : (
              "Generate Pathway"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
