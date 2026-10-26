import HospitalSpecialityCard from "./HospitalSpecialityCard";

interface Speciality{
    id:string;
    name:string;
}

interface HospitalSpecialityListProps {
    specialities: Speciality[];
    onViewDoctors: (specialityId: string) => void;
}

export default function HospitalSpecialityList({
    specialities,
    onViewDoctors,
}: HospitalSpecialityListProps) {
    return(
        <div className="space-y-3">
            {specialities.map((speciality) => (
                <HospitalSpecialityCard
                    key={speciality.id}
                    name={speciality.name}
                    onViewDoctors={() => onViewDoctors(speciality.id)}
                />
            ))}
        </div>
    )
}