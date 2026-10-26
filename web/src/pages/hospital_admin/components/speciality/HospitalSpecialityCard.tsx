import { Button } from "@/components/ui/button";

interface HospitalSpecialityCardProps {
    name: string;
    doctorCount?: number;
    onViewDoctors: () => void;
}

export default function HospitalSpecialityCard({
    name,
    doctorCount = 0,
    onViewDoctors,
}: HospitalSpecialityCardProps) {
    return (
        <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold">
                        {name}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                        {doctorCount} doctors
                    </p>
                </div>

                <Button onClick={onViewDoctors}>
                    View doctors
                </Button>
            </div>
        </div>
    );
}