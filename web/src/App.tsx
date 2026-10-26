
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/index";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

function App() {
    const initialize= useAuthStore((state)=>state.initialize);

    useEffect(() => initialize(), [initialize]);
    return(
        <RouterProvider router={router} />
    );
}

export default App;
