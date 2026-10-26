import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schema/auth/loginSchema";
import type { LoginFormData } from "@/schema/auth/loginSchema";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { Input } from "@/components/ui/input";
import { adminPageUrl, forgotpasswordUrl, googleLoginUrl, hospitalAdminPageUrl, registerUrl, userPageUrl } from "@/endpoints/endpoints";
import { Role } from "@/enums/enums";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";

export default function LoginForm() {
  const { login, loading, error, clearError, profileRequired } = useAuthStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    trigger,
  } = form;

  const [showPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    const isValid = await trigger();
    if (!isValid) return;

    try {
      const loggedUser = await login(data);
      if (loggedUser.profileRequired) { navigate(`${registerUrl}?completeProfile=true`, { replace: true }); return; }
      const role = loggedUser.user?.role ?? "";

      if (role === Role.ADMIN) {
        navigate(adminPageUrl, { replace: true });
      } else if (role === Role.HOSPITAL_ADMIN) {
        navigate(hospitalAdminPageUrl, { replace: true });
      } else {
        navigate(userPageUrl, { replace: true });
      }
    } catch {
      // The auth store displays the specific sign-in or profile error.
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-8">
      <Card className="rounded-3xl border border-slate-200 bg-white shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold text-slate-900">
            Login
          </CardTitle>

          <CardDescription className="text-sm font-medium text-slate-600">
            Sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {profileRequired && <p className="mb-4 text-sm text-slate-700">Your account is signed in. <Link className="underline" to={`${registerUrl}?completeProfile=true`}>Complete your profile</Link> to continue.</p>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Field className="space-y-2">
              <FieldLabel htmlFor="email" className="text-sm font-semibold text-slate-700">Email</FieldLabel>

              <Controller
                name="email"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                    onFocus={() => clearError()}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-slate-500"
                  />
                )}
              />

              {errors.email?.message && (
                <p id="email-error" className="text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </Field>

            <Field className="space-y-2">
              <FieldLabel htmlFor="password" className="text-sm font-semibold text-slate-700">Password</FieldLabel>

              <Controller
                name="password"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...field}
                    onFocus={() => clearError()}
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-slate-500"
                  />
                )}
              />

              {errors.password?.message && (
                <p id="password-error" className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </Field>

            {error && (
              <p className="text-sm text-red-500 text-center">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <br />

          <Button className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 font-semibold text-slate-700 transition hover:bg-slate-200">
            <a href={googleLoginUrl || "#"} className="block w-full">Login with Google</a>
          </Button>

          <p className="mt-4 text-center text-sm text-slate-600">
            Don&apos;t have an account? {" "}
            <Link to={registerUrl} className="font-semibold text-slate-700 hover:text-slate-900 hover:underline">
              Register
            </Link>
          </p>
          <p className="mt-4 text-center text-sm">
            <Link to={forgotpasswordUrl} className="font-medium text-slate-600 hover:text-slate-900 hover:underline">
              Forget password?
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
