import api from "@/lib/axios";
import { endpoints } from "@/endpoints/endpoints";

export interface ActiveBannedWord { id: string; word: string; }


export const BannedWordService = {
    async getAvailableWords(signal?: AbortSignal): Promise<string[]> {
        const res = await api.get(endpoints.BANNED_WORDS.AVAILABLE, { signal });
        return res.data;
    },
    async getActiveWords(signal?: AbortSignal): Promise<ActiveBannedWord[]> {
        const res = await api.get(endpoints.BANNED_WORDS.HOSPITAL, { signal });
        return res.data;
    },
    async activateWord(word: string) {
        await api.post(endpoints.BANNED_WORDS.HOSPITAL, { word });
    },
    async removeWord(id: string) {
        await api.delete(endpoints.BANNED_WORDS.DELETE_HOSPITAL(id));
    },
    async getBannedWords() {
        const res = await api.get(endpoints.BANNED_WORDS.HOSPITAL);
        return res.data;
    },
    async addBannedWord(word: string) {
        const res = await api.post(endpoints.BANNED_WORDS.HOSPITAL, { word });
        return res.data;
    },
    async deleteBannedWord(id:string){
        const res = await api.delete(endpoints.BANNED_WORDS.DELETE_HOSPITAL(id));
        return res.data;
    },
    async getBannedWordById(id:string){
        const words = await BannedWordService.getActiveWords();
        return words.find(word => word.id === id);
    }
}
