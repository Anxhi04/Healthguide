//columns.tsx (client component) 
// will contain our column definitions.
"use client"
import type { ColumnDef } from "@tanstack/react-table"
import type { UsersTable } from '@/services/auth/types';
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminModal } from '@/contexts/AdminModalContext';

export const columns: ColumnDef<UsersTable>[] = [
    {
        accessorKey:"id",
        header: ({ column }) => {
        return (
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Id
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        )}
    },
    {
        accessorKey:"firstName",
        header: ({ column }) => {
        return (
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        )}
    },
    {
        accessorKey:"lastname",
        header: ({ column }) => {
        return (
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Lastname
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        )}
    },
    {
        accessorKey:"dateOfBirth",
        header:"Date of birth"
    },
    {
        accessorKey:"city",
        header:"City"
    },
    {
        accessorKey:"gender",
        header:"Gender"
    },
    {
        accessorKey:"phoneNumber",
        header:"Phone Number"
    },
    {
        accessorKey:"email",
        header:"Email"
    },
    {
        accessorKey:"role",
        header:"Role"
    },
    {
        id:"actions",
        header:"Actions",
        cell:({row})=>{
        const user= row.original;
        const userId=row.original.id;
        const { openEditModal, openDeleteModal } = useAdminModal();
           return(
             <div className="flex items-center gap-3">
                <button 
                  onClick={()=>openEditModal(user)}
                  className="px-5 py-2 rounded-lg bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition-colors duration-200 border border-slate-200 text-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={()=>openDeleteModal(userId)}
                  className="px-5 py-2 rounded-lg bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition-colors duration-200 border border-slate-200 text-sm"
                >
                  Delete
                </button>
            </div>
           )
           
        }
    }

]