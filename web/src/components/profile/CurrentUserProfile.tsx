import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileService, type CurrentProfile, type ProfileUpdate } from "@/services/profileService";
import { useAuthStore } from "@/stores/authStore";
import { Gender, Role, UserStatus } from "@/enums/enums";
import type { Hospital } from "@/contexts/HospitalContext";
import { formatDateOnly } from "@/lib/date";
import { profileUpdateSchema } from "@/schema/profileSchema";

const profileForm = (profile?: CurrentProfile) => ({ firstName: profile?.firstName ?? "", lastname: profile?.lastname ?? "",
  phoneNumber: profile?.phoneNumber ?? "", dateOfBirth: profile?.dateOfBirth ?? "", city: profile?.city ?? "", gender: profile?.gender ?? "" });
const genderLabel = (gender: string) => gender.toLowerCase().replaceAll("_", " ").replace(/^./, letter => letter.toUpperCase());

const errorMessage = (err: unknown) => axios.isAxiosError(err) && typeof err.response?.data?.message === "string"
  ? err.response.data.message : "Could not update your profile. Please try again.";
export default function CurrentUserProfile({ hospital, hospitalLoading, hospitalError }: {
  hospital?: Hospital | null; hospitalLoading?: boolean; hospitalError?: string | null;
}) {
  const [profile, setProfile] = useState<CurrentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [version, setVersion] = useState(0);
  const [name, setName] = useState(profileForm());
  const lock = useRef(false);
  const photoInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    ProfileService.getMe(controller.signal).then(user => {
      if (!controller.signal.aborted) { setProfile(user); setName(profileForm(user)); setError(null); }
    }).catch(err => { if (!controller.signal.aborted) setError(errorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [version]);
  const mutate = async (operation: () => Promise<void>, finishEditing = false) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMutationError(null); setSuccess(null);
    try {
      await operation(); const user = await ProfileService.getMe();
      setProfile(user);
      if (finishEditing || !editing) setName(profileForm(user));
      useAuthStore.setState(state => ({ user: state.user ? { ...state.user, firstName: user.firstName, lastname: user.lastname,
        phoneNumber: user.phoneNumber, dateOfBirth: user.dateOfBirth, city: user.city, gender: user.gender } : null }));
      setSuccess("Profile updated.");
      if (finishEditing) setEditing(false);
    } catch (err) { setMutationError(errorMessage(err)); }
    finally { lock.current = false; setBusy(false); if (photoInput.current) photoInput.current.value = ""; }
  };
  const upload = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMutationError("Choose a JPEG, PNG or WebP image smaller than 5 MB."); return;
    }
    void mutate(() => ProfileService.uploadPhoto(file));
  };
  const blocked = profile?.status === UserStatus.BLOCKED;
  return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-4xl space-y-6">
    <h1 className="text-3xl font-semibold text-slate-900">My Profile</h1>
    {loading ? <p role="status" className="text-slate-500">Loading profile…</p> : error ? <div role="alert" className="space-y-3"><p className="text-sm text-red-700">{error}</p>
      <Button variant="outline" onClick={() => { setLoading(true); setError(null); setVersion(value => value + 1); }}>Retry</Button></div> : profile && <>
      {success && <p role="status" className="text-sm text-emerald-800">{success}</p>}
      {mutationError && <p role="alert" className="text-sm text-red-700">{mutationError}</p>}
      <Card className="border-slate-200 bg-white shadow-sm"><CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-4">
          {profile.photoUrl ? <img src={profile.photoUrl} alt="Your profile" className="h-20 w-20 rounded-full object-cover" />
            : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-2xl font-semibold text-emerald-900">{profile.firstName.slice(0, 1)}{profile.lastname.slice(0, 1)}</div>}
          <div className="space-y-1"><h2 className="text-xl font-semibold text-slate-900">{profile.firstName} {profile.lastname}</h2>
            <p className="text-sm text-slate-600">{profile.email}</p>
            <p className="text-sm text-slate-500">{profile.role === Role.ADMIN ? "Administrator" : profile.role === Role.HOSPITAL_ADMIN ? "Hospital Administrator" : "User"} · {profile.status || "Status unavailable"}</p>
            {profile.createdAt && <p className="text-xs text-slate-500">Joined {formatDateOnly(profile.createdAt)}</p>}
          </div>
        </div>
        {editing && <div className="flex flex-wrap items-center gap-3"><label htmlFor="profile-photo" className="text-sm text-slate-600">Profile photo</label>
          <input ref={photoInput} id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || blocked}
            className="max-w-full text-sm text-slate-600" onChange={event => upload(event.target.files?.[0])} />
          {profile.photoUrl && <Button variant="outline" disabled={busy || blocked} onClick={() => void mutate(ProfileService.removePhoto)}>Remove photo</Button>}
        </div>}
        <form className="space-y-4 border-t border-slate-100 pt-6" onSubmit={event => {
          event.preventDefault();
          if (!editing || blocked || busy) return;
          const firstName = name.firstName.trim(), lastname = name.lastname.trim();
          if (firstName.length < 2 || firstName.length > 20 || lastname.length < 2 || lastname.length > 20) {
            setMutationError("First and last name must each contain 2–20 characters."); return;
          }
          const update: ProfileUpdate = { firstName, lastname };
          for (const field of ["phoneNumber", "dateOfBirth", "city"] as const) {
            const value = name[field].trim();
            if (value !== (profile[field] ?? "")) update[field] = value;
          }
          if (name.gender !== (profile.gender ?? "")) update.gender = name.gender as Gender;
          const parsed = profileUpdateSchema.safeParse(update);
          if (!parsed.success) { setMutationError(parsed.error.issues[0].message); return; }
          void mutate(() => ProfileService.updateProfile(profile.id, update), true);
        }}>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><label htmlFor="profile-first-name" className="text-sm text-slate-700">First name</label>
            <Input id="profile-first-name" value={name.firstName} minLength={2} maxLength={20} required readOnly={!editing} disabled={busy || blocked} onChange={event => setName(current => ({ ...current, firstName: event.target.value }))} /></div>
            <div className="space-y-2"><label htmlFor="profile-last-name" className="text-sm text-slate-700">Last name</label>
              <Input id="profile-last-name" value={name.lastname} minLength={2} maxLength={20} required readOnly={!editing} disabled={busy || blocked} onChange={event => setName(current => ({ ...current, lastname: event.target.value }))} /></div></div>
          {editing ? <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><label htmlFor="profile-phone" className="text-sm text-slate-700">Phone number</label>
              <Input id="profile-phone" type="tel" value={name.phoneNumber} disabled={busy || blocked} onChange={event => setName(current => ({ ...current, phoneNumber: event.target.value }))} /></div>
            <div className="space-y-2"><label htmlFor="profile-birth-date" className="text-sm text-slate-700">Date of birth</label>
              <Input id="profile-birth-date" type="date" max={new Date().toISOString().slice(0, 10)} value={name.dateOfBirth} disabled={busy || blocked} onChange={event => setName(current => ({ ...current, dateOfBirth: event.target.value }))} /></div>
            <div className="space-y-2"><label htmlFor="profile-city" className="text-sm text-slate-700">Location / City</label>
              <Input id="profile-city" value={name.city} disabled={busy || blocked} onChange={event => setName(current => ({ ...current, city: event.target.value }))} /></div>
            <div className="space-y-2"><label htmlFor="profile-gender" className="text-sm text-slate-700">Gender</label>
              <select id="profile-gender" value={name.gender} disabled={busy || blocked} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" onChange={event => setName(current => ({ ...current, gender: event.target.value }))}>
                <option value="">Not provided</option>{Object.values(Gender).map(gender => <option key={gender} value={gender}>{genderLabel(gender)}</option>)}
              </select></div>
          </div> : <dl className="grid gap-4 text-sm sm:grid-cols-2">
            {profile.phoneNumber && <div><dt className="text-slate-500">Phone number</dt><dd className="mt-1 text-slate-900">{profile.phoneNumber}</dd></div>}
            {profile.dateOfBirth && <div><dt className="text-slate-500">Date of birth</dt><dd className="mt-1 text-slate-900">{formatDateOnly(profile.dateOfBirth)}</dd></div>}
            {profile.city && <div><dt className="text-slate-500">Location / City</dt><dd className="mt-1 text-slate-900">{profile.city}</dd></div>}
            {profile.gender && <div><dt className="text-slate-500">Gender</dt><dd className="mt-1 text-slate-900">{genderLabel(profile.gender)}</dd></div>}
          </dl>}
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input type="checkbox" role="switch" aria-label="Public profile" checked={profile.publicProfile}
              disabled={!editing || busy || blocked} onChange={event => {
                const value = event.target.checked;
                void mutate(async () => {
                  const result = await ProfileService.setProfileVisibility(value);
                  setProfile(current => current ? { ...current, publicProfile: result.publicProfile } : current);
                });
              }} /> Public profile
          </label>
          <p className="text-xs text-slate-500">{profile.publicProfile ? "Your profile is public." : "Your profile is private. Only you can see your full information."} Privacy changes save immediately while editing.</p>
          <p className="text-xs text-slate-500">Role, account status and hospital assignment are managed by the platform.</p>
          {editing ? <div className="flex gap-3">
            <Button type="submit" disabled={busy || blocked}>{busy ? "Saving…" : "Save"}</Button>
            <Button type="button" variant="outline" disabled={busy} onClick={() => {
              setName(profileForm(profile)); setEditing(false); setMutationError(null); setSuccess(null);
            }}>Cancel</Button>
          </div> : <Button type="button" disabled={blocked} onClick={() => { setEditing(true); setSuccess(null); setMutationError(null); }}>Edit</Button>}
        </form>
      </CardContent></Card>
      {profile.role === Role.HOSPITAL_ADMIN && <Card className="border-slate-200 bg-white shadow-sm"><CardContent className="space-y-3 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Managed hospital</h2>
        {hospitalLoading ? <p className="text-sm text-slate-500">Loading hospital…</p> : hospitalError ? <p role="alert" className="text-sm text-red-700">{hospitalError}</p>
          : hospital ? <><p className="font-medium text-slate-800">{hospital.name}</p><p className="text-sm text-slate-600">{hospital.city} · {hospital.address}</p><p className="text-xs text-slate-500">Hospital assignment is read-only.</p></>
            : <p className="text-sm text-slate-500">No managed hospital found.</p>}
      </CardContent></Card>}
    </>}
  </div></main>;
}
