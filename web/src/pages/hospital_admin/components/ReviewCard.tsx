import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function ReviewCard({
  author,
  date,
  rating,
  text,
  doctor,
  initials
}: {
  author: string;
  date: string;
  rating: number;
  text: string;
  doctor ? : string;
  initials ? : string
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
    <CardContent className="space-y-4 p-5">
        {doctor && <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {initials}
            </div>
            <p className="text-sm font-semibold text-slate-900">Dr. {doctor}</p>
            </div>
        }
            <div className="flex gap-1 text-amber-500">
                {Array.from({ length: rating }, (_, index) => 
                    <Star key={index} className="h-4 w-4 fill-current" />
                )}
            </div>
            <p className="text-sm leading-6 text-slate-700">“{text}”</p>
        <div className="flex items-center justify-between gap-4 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{author}</span>
            <span>{date}</span>
        </div>
    </CardContent>
</Card>
  )

}