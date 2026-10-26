import axios from "axios";
import { auth } from "@/firebase/firebase";

const api = axios.create({
    baseURL :import.meta.env.VITE_API_URL,
    headers:{
        'Content-Type': 'application/json',
        Accept:"application/json",
    }

});
//Per te evndosur automatikisht token ne cdo request 
api.interceptors.request.use(
  async (config) => {
    const token = config.headers.Authorization ? null : auth.currentUser
      ? await auth.currentUser.getIdToken()
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
export default api;

