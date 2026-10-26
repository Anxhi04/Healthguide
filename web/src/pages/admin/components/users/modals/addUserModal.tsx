import {
AlertDialog,
AlertDialogContent,
AlertDialogFooter,
AlertDialogHeader,
AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { InputGroup,InputGroupAddon,InputGroupInput,InputGroupText } from "@/components/ui/input-group";
import { Gender } from "@/enums/enums";
import type { AddUserFormData,AddUserFormInput } from "@/schema/auth/registerSchema";
import { addUserSchema } from "@/schema/auth/registerSchema";
import { useAuthStore } from "@/stores/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye,EyeOff,Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
// import { createUserByAdmin } from "@/services/auth/function";

interface AddModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddModal({ open, onClose }: AddModalProps) {
  const { error, clearError, createUserByAdmin } = useAuthStore();
  const {
      register,
      handleSubmit,
      formState: {errors},
  } = useForm<AddUserFormInput, unknown, AddUserFormData>({
      resolver: zodResolver(addUserSchema),
      mode: "onChange",
      defaultValues: {
        firstName: "",
        lastname: "",
        dateOfBirth: "",
        email: "",
        password: "",
        gender: Gender.OTHER,
        phoneNumber: "",
        city: "",
        role: "USER",
      },
    });
   
  const [showPassword, setShowPassword] = useState(false);
  
   const onSubmit = async (data: AddUserFormData) => {


    try {
      await createUserByAdmin({
        firstName: data.firstName,
        lastname: data.lastname,
        dateOfBirth: data.dateOfBirth,
        email: data.email,
        password: data.password,
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        city: data.city,
        role: data.role,
      });
    onClose();
    } catch (error) {
      console.error("Register error:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(value)=>{
       if (!value) onClose();
    }}>
      <AlertDialogContent className="border-0 bg-white shadow-2xl p-6 sm:rounded-3xl max-w-md">

        <AlertDialogHeader>
          <AlertDialogTitle>Add User</AlertDialogTitle>
        </AlertDialogHeader>

<form
  onSubmit={handleSubmit(onSubmit)}
  className="space-y-6"
>          {error && (
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
            <label htmlFor="firstName" className="text-sm font-semibold text-gray-700 block">
              First name
            </label>
            <InputGroup>
              <InputGroupInput
                id="firstName"
                type="text"
                placeholder="Ana"
                {...register("firstName")}
                aria-invalid={errors.firstName ? "true" : "false"}
                className="focus:ring-2 focus:ring-slate-500 focus:border-slate-500 border-slate-300"
              />
            </InputGroup>

            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
            )}
          </div>

          {/* lastname Field */}
          <div className="space-y-2">
            <label htmlFor="lastname" className="text-sm font-semibold text-gray-700 block">
              lastname
            </label>
            <InputGroup>
              <InputGroupInput
                id="lastname"
                type="text"
                placeholder="William"
                {...register("lastname")}
                aria-invalid={errors.lastname ? "true" : "false"}
                className="focus:ring-2 focus:ring-slate-500 focus:border-slate-500 border-slate-300"
              />
            </InputGroup>

            {errors.lastname && (
              <p className="text-red-500 text-xs mt-1">{errors.lastname.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700 block">
              Date of birth
            </label>

            <InputGroup>
              <InputGroupInput
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                aria-invalid={errors.dateOfBirth ? "true" : "false"}
                className="focus:ring-2 focus:ring-slate-500 focus:border-slate-500 border-slate-300"
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
                className="h-9 w-full rounded-md border-0 bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="OTHER">Other</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </InputGroup>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700 block">
              Phone number
            </label>
            <InputGroup>
              <InputGroupInput
                id="phoneNumber"
                type="tel"
                placeholder="+383 44 123 456"
                {...register("phoneNumber")}
                aria-invalid={errors.phoneNumber ? "true" : "false"}
                className="focus:ring-2 focus:ring-slate-500 focus:border-slate-500 border-slate-300"
              />
            </InputGroup>
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-semibold text-gray-700 block">
              City
            </label>
            <InputGroup>
              <InputGroupInput
                id="city"
                type="text"
                placeholder="Prishtina"
                {...register("city")}
                aria-invalid={errors.city ? "true" : "false"}
                className="focus:ring-2 focus:ring-slate-500 focus:border-slate-500 border-slate-300"
              />
            </InputGroup>
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700 block">
              Email
            </label>

            <InputGroup>
              <InputGroupAddon>
                <InputGroupText className="bg-slate-100">
                  <Mail className="h-5 w-5 text-gray-500" />
                </InputGroupText>
              </InputGroupAddon>

              <InputGroupInput
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
                className="focus:ring-2 focus:ring-slate-500 focus:border-slate-500 border-slate-300"
              />
            </InputGroup>

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700 block">
              Password
            </label>

            <InputGroup>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
                className="focus:ring-2 focus:ring-slate-500 focus:border-slate-500 border-slate-300"
              />

              <InputGroupAddon align="inline-end">
                <InputGroupText className="bg-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    )}
                  </button>
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* ROLE Field */}
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-semibold text-gray-700 block">
              Role
            </label>

            <InputGroup>
              <InputGroupInput
                id="role"
                type="text"
                placeholder="ADMIN|HOSPITAL_ADMIN|USER"
                {...register("role")}
                aria-invalid={errors.role ? "true" : "false"}
                className="focus:ring-2 focus:ring-slate-500 focus:border-slate-500 border-slate-300"
              />
            </InputGroup>

            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
            )}
          </div>
             <AlertDialogFooter className="space-x-3">
          
            <Button
             className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" 
             onClick={onClose}
             type="reset"
             >
               Cancel
            </Button>
            <Button  
             className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
             type="submit"
             >
               Save
            </Button>
        </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

