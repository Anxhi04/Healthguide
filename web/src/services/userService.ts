import { toDateInputValue } from "@/lib/date";
import type { UsersTable } from "@/services/auth/types";
import api from "@/lib/axios";
import { endpoints } from "@/endpoints/endpoints";
export const UserService = {
    async getUsers(): Promise<UsersTable[]> {
        const res = await api.get(endpoints.USERS.GET_ALL);
        return res.data.map((user: UsersTable & { dateOfBirth?: unknown }) => ({ ...user, dateOfBirth: toDateInputValue(user.dateOfBirth) }));
    },
    async getUser(id:string){
        const res=await api.get(endpoints.USERS.GET_USER(id))
        return res.data
    }
};