import AdminShell from "@/pages/admin/AdminShell";

import CurrentUserProfile from "@/components/profile/CurrentUserProfile";
import { HospitalProvider } from "@/contexts/HospitalContext";
import { Role } from "@/enums/enums";
import Admin from "@/pages/admin/Index";
import AdminProfilePage from "@/pages/admin/ProfilePage";
import ReportsPage from "@/pages/admin/ReportsPage";
import LoginPage from "@/pages/auth/login/Index";
import RegisterPage from "@/pages/auth/register/Index";
import HospitalAdminBannedWordsPage from "@/pages/hospital_admin/BannedWordsPage";
import HospitalAdminPage from "@/pages/hospital_admin/HospitalPage";
import HospitalSpecialityDoctorsPage from "@/pages/hospital_admin/HospitalSpecialityDoctorPage";
import HospitalAdmin from "@/pages/hospital_admin/Index";
import HospitalAdminProfilePage from "@/pages/hospital_admin/ProfilePage";
import HospitalAdminReportsPage from "@/pages/hospital_admin/ReportsPage";
import ReviewsPage from "@/pages/hospital_admin/ReviewsPage";
import SpecialitiesPage from "@/pages/hospital_admin/SpecialitiesPage";
import Unauthorized from "@/pages/Unauthorized/Unauthorized.tsx";
import PublicProfilePage from "@/pages/user/components/PublicProfilePage";
import UserPage from "@/pages/user/Index";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { createBrowserRouter,Navigate } from "react-router-dom";

export const router = createBrowserRouter([
    { path: "/user/:id/public", element: <PublicProfilePage /> },
    { path: "/user/profile", element: <ProtectedRoute role={Role.USER}><CurrentUserProfile /></ProtectedRoute> },
    { path: "/admin/profile", element: <ProtectedRoute role={Role.ADMIN}><AdminProfilePage /></ProtectedRoute> },
    {
        path: "/admin/reports",
        element: <ProtectedRoute role={Role.ADMIN}><ReportsPage /></ProtectedRoute>,
    },
    {
        path: "/admin/reviews",
        element: <ProtectedRoute role={Role.ADMIN}><AdminShell><ReviewsPage doctor /></AdminShell></ProtectedRoute>,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
    {
        path: "/user",
        element: <UserPage />,
    },
    {
        path: "/hospital-admin",
        element: (
            <ProtectedRoute role={Role.HOSPITAL_ADMIN}>
                <HospitalProvider>
                    <HospitalAdmin />
                </HospitalProvider>
            </ProtectedRoute>
        ),
        children: [
            { path: "profile", element: <HospitalAdminProfilePage /> },
            { path: "reports", element: <HospitalAdminReportsPage /> },
            {
                path: "banned-words",
                element: <HospitalAdminBannedWordsPage />,
            },
            {
                index: true,
                element: <HospitalAdminPage />,
            },
            {
                path: "specialities",
                element: <SpecialitiesPage />,
            },
            {
                path: "speciality/:specialityId",
                element: <HospitalSpecialityDoctorsPage />,
            },
            {
                path: "reviews",
                element: <ReviewsPage />,
            },
        ],
    },
    {
        path: "/admin",
        element: (
            <ProtectedRoute role={Role.ADMIN}>
                <Admin />
            </ProtectedRoute>
        ),
    },
    {
        path: "/admin/banned-words",
        element: (
            <ProtectedRoute role={Role.ADMIN}>
                <Navigate to="/unauthorized" replace />
            </ProtectedRoute>
        ),
    },
    {
        path: "/unauthorized",
        element: <Unauthorized />,
    },
]);
