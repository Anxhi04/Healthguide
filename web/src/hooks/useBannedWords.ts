import { useEffect, useState } from "react";
import { BannedWordService } from "@/services/bannedWordService";
import type { BannedWordTable } from "@/services/auth/types";

export function useBannedWords(page: number) {

    const [data, setData] = useState<BannedWordTable[]>([]);
    const [lastPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getBannedWords = async () => {
            try {
                setLoading(true);
                setError(null);
                const resp = await BannedWordService.getBannedWords();
                setData(resp);
            } catch (error: any) {
                console.error( "Error fetching banned words:", error );
                setError(error?.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };
        getBannedWords();
    }, [page]);
    return {
        data,
        lastPage,
        loading,
        error,
    };
}