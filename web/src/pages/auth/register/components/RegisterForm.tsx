import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { useAuthStore } from "@/stores/authStore";
import { registerSchema, profileCompletionSchema } from "@/schema/auth/registerSchema";
import type { RegisterFormData } from "@/schema/auth/registerSchema";
import { loginUrl, userPageUrl } from "@/endpoints/endpoints";
import { Gender } from "@/enums/enums";
import { auth } from "@/firebase/firebase";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { loading, error, clearError, initialized, profileRequired, register: registerUser } = useAuthStore();
  const [search] = useSearchParams();
  const completing = search.get("completeProfile") === "true";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(completing ? profileCompletionSchema : registerSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastname: "",
      dateOfBirth: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: Gender.MALE,
      phoneNumber: "",
      city: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (completing && auth.currentUser?.email) setValue("email", auth.currentUser.email);
  }, [completing, initialized, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    if (completing && (!initialized || !profileRequired)) return;
    try {
      await registerUser({
        firstName: data.firstName,
        lastname: data.lastname,
        dateOfBirth: data.dateOfBirth,
        email: data.email,
        password: data.password,
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        city: data.city,
      });

      navigate(userPageUrl, { replace: true });
    } catch {
      // The auth store displays the registration/profile completion error.
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            {completing ? "Complete your profile" : "Register"}
          </h2>
          <p className="text-sm font-medium text-slate-600">
            {completing ? "Your Firebase account is already signed in." : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <span className="text-red-600 text-sm">{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="text-red-500 hover:text-red-700 text-xl leading-none"
              >
                ×
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700">
              First Name
            </label>
            <InputGroup>
              <InputGroupInput
                id="firstName"
                type="text"
                placeholder="Ana"
                {...register("firstName")}
                aria-invalid={errors.firstName ? "true" : "false"}
                className="border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-500"
              />
            </InputGroup>
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lastname" className="block text-sm font-semibold text-slate-700">
              Last Name
            </label>
            <InputGroup>
              <InputGroupInput
                id="lastname"
                type="text"
                placeholder="William"
                {...register("lastname")}
                aria-invalid={errors.lastname ? "true" : "false"}
                className="border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-500"
              />
            </InputGroup>
            {errors.lastname && (
              <p className="text-red-500 text-xs mt-1">{errors.lastname.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-slate-700">
              Date of birth
            </label>
            <InputGroup>
              <InputGroupInput
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                aria-invalid={errors.dateOfBirth ? "true" : "false"}
                className="border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-500"
              />
            </InputGroup>
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="gender" className="text-sm font-semibold text-gray-700 block">
              Gender
            </label>
            <InputGroup>
              <select
                id="gender"
                {...register("gender")}
                aria-invalid={errors.gender ? "true" : "false"}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-500"
              >
                <option value={Gender.FEMALE}>FEMALE</option>
                <option value={Gender.MALE}>MALE</option>
                <option value={Gender.PREFER_NOT_TO_SAY}>PREFER_NOT_TO_SAY</option>
                <option value={Gender.OTHER}>OTHER</option>
              </select>
            </InputGroup>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700">
              Phone Number
            </label>
            <InputGroup>
              <InputGroupInput
                id="phoneNumber"
                type="tel"
                placeholder="+355 68 123 4567"
                {...register("phoneNumber")}
                aria-invalid={errors.phoneNumber ? "true" : "false"}
                className="border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-500"
              />
            </InputGroup>
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-semibold text-slate-700">
              City
            </label>
            <InputGroup>
              <InputGroupInput
                id="city"
                type="text"
                placeholder="Tirana"
                {...register("city")}
                aria-invalid={errors.city ? "true" : "false"}
                className="border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-500"
              />
            </InputGroup>
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email
            </label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText className="bg-slate-100">
                  <Mail className="h-5 w-5 text-slate-500" />
                </InputGroupText>
              </InputGroupAddon>

              <InputGroupInput
                id="email"
                type="email"
                readOnly={completing}
                placeholder="you@example.com"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
                className="border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-500"
              />
            </InputGroup>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {!completing && <><div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <InputGroup>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
                className="border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-500"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText className="bg-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-700" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-500 hover:text-slate-700" />
                    )}
                  </button>
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
              Confirm Password
            </label>
            <InputGroup>
              <InputGroupInput
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmPassword")}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                className="border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-500"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText className="bg-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-700" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-500 hover:text-slate-700" />
                    )}
                  </button>
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div></>}

          <Button
            type="submit"
            disabled={loading || (completing && (!initialized || !profileRequired))}
            className="mt-4 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition duration-200 hover:bg-slate-800"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{completing ? "Saving profile..." : "Registering..."}</span>
              </div>
            ) : (
              completing ? "Save profile" : "Sign up"
            )}
          </Button>

          <div className="text-center">
            <Link to={loginUrl} className="text-sm font-semibold text-slate-700 hover:text-slate-900 hover:underline">
              Have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
