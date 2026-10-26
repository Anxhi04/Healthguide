"use client"
import type { ColumnDef } from "@tanstack/react-table"
import type { BannedWordTable } from '@/services/auth/types';
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminModal } from '@/contexts/AdminModalContext';

export const columns: ColumnDef<BannedWordTable>[]=[
    {
        accessorKey:"id",
        header:({column})=>{
            return (
                <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                Id
                <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        }

    },
    {
        accessorKey:"word",
        header: ({ column }) => {
        return (
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Word
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        )}

    },
    {
        id:"actions",
        header:"Actions",
        cell:({row})=>{
        const wordId=row.original.id;
        const {  openDeleteBannedWordModal } = useAdminModal();
           return(
             <div className="flex items-center gap-3">
                <button 
                  onClick={()=>openDeleteBannedWordModal(wordId)}
                  className="px-5 py-2 rounded-lg bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition-colors duration-200 border border-slate-200 text-sm"
                >
                  Delete
                </button>
            </div>
           )
           
        }
    }   
]