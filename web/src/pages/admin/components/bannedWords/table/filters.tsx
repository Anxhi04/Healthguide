"use client"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Filter={
    word:string;
}
interface Props{
    filter: Filter,
    onChange:(filters: Filter)=>void;
    onAddClick?: () => void;
}

export function BannedWordFilters({
    filter,
    onChange,
    onAddClick,
}:Props){
    return (
        <>
            <Input
                placeholder="Search for banned words"
                value={filter.word}
                onChange={(e)=>
                    onChange({...filter, word:e.target.value})
                }
            />
            {onAddClick && (
                <Button onClick={onAddClick}>
                Add Banned Word
                </Button>
            )}
        </>
    )
}