import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageIntroProps {
    title: string;
    description: string;
    action?: string;
    onAction?: () => void;
}

export default function PageIntro({
    title,
    description,
    action,
    onAction,
}: PageIntroProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">
                    Hospital administration
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    {title}
                </h1>

                <p className="text-sm text-slate-600">
                    {description}
                </p>
            </div>

            {action && (
                <Button
                    onClick={onAction}
                    className="w-full sm:w-auto"
                >
                    <Plus />
                    {action}
                </Button>
            )}
        </div>
    );
}