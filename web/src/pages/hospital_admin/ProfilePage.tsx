import CurrentUserProfile from "@/components/profile/CurrentUserProfile";
import { useHospitalContext } from "@/contexts/HospitalContext";
export default function HospitalAdminProfilePage() {
  const { hospital, loading, error } = useHospitalContext();
  return <CurrentUserProfile hospital={hospital} hospitalLoading={loading} hospitalError={error} />;
}
