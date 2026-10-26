import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProfileService, type PublicProfile } from "@/services/profileService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PublicProfilePage() {
  const { id } = useParams();
  const [version, setVersion] = useState(0);
  const requestKey = `${id}:${version}`;
  const [result, setResult] = useState<{key: string; profile?: PublicProfile; failed?: boolean} | null>(null);
  const loading = result?.key !== requestKey;
  const profile = loading ? null : result?.profile;
  const failed = !loading && result?.failed;
  useEffect(() => {
    const controller = new AbortController();
    ProfileService.getPublic(id!, controller.signal).then(data => {
      if (!controller.signal.aborted) setResult({key: requestKey, profile: data});
    }).catch(() => { if (!controller.signal.aborted) setResult({key: requestKey, failed: true}); });
    return () => controller.abort();
  }, [id, requestKey]);
  return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-4xl space-y-6">
    <h1 className="text-3xl font-semibold text-slate-900">Public Profile</h1>
    {loading ? <p role="status">Loading profile…</p> : failed ? <div role="alert" className="space-y-3">
      <p>Public profile not available.</p><Button variant="outline" onClick={() => setVersion(value => value + 1)}>Retry</Button>
    </div> : profile && <Card><CardContent className="flex items-center gap-4 p-6">
      {profile.photoUrl && <img src={profile.photoUrl} alt={`${profile.firstName} ${profile.lastname}`} className="h-20 w-20 rounded-full object-cover" />}
      <div><h2 className="text-xl font-semibold">{profile.firstName} {profile.lastname}</h2>
      {profile.publicProfile === false && <p className="mt-2 text-sm text-slate-600">This profile is private.</p>}</div>
    </CardContent></Card>}
  </div></main>;
}
