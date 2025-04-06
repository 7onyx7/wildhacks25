import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface UploadProgressProps {
  progress: number
  className?: string
}

export default function UploadProgress({ progress, className }: UploadProgressProps) {
  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span>Uploading content...</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  )
}

