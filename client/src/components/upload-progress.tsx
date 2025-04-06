import { Progress } from "@/components/ui/progress"

interface UploadProgressProps {
  progress: number
}

export default function UploadProgress({ progress }: UploadProgressProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span>Uploading content...</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  )
}

