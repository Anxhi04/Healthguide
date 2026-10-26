import type { UsersTable } from "@/services/auth/types";
import { useEffect, useState } from "react";
import { UserService } from "@/services/userService";

type Filters = {
  email: string;
  name: string;
};

//LOGJIKA QE LIDHET ME MARRJEN E USERS(MENAXHIMI I STATE)
export function useUsers(page: number, filters:Filters){
    const[data, setData]=useState<UsersTable[]>([]);
    const[lastPage]=useState(1);
    const[loading, setLoading]=useState(true);
    const[error, setError]=useState<string | null>(null);

    useEffect(()=>{
        const getUsers=async()=>{
            try{
                setLoading(true);
                setError(null);
                const response= await UserService.getUsers();
                setData(response);
                // setLastPage(response)
            }catch(error: any){
                setError(error.message || "Something went wrong");
            }finally{
                setLoading(false)
            }
        };
        getUsers();
    },[page,  filters.email, filters.name]);
    return{
        data,
        lastPage,
        loading,
        error,
    };
}