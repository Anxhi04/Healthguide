// Birth dates cross legacy strings, native Firestore Timestamps and serialized timestamps.
export const normalizeProfileDate = (value: unknown): string | undefined => {
    try {
        let date: Date;
        if (typeof value === "string") {
            const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
            if (!match) return undefined;
            const calendar = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
            if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== value.slice(0, 10)) return undefined;
            date = new Date(value);
        } else if (value && typeof value === "object") {
            const timestamp = value as { toDate?: () => Date; seconds?: number; _seconds?: number };
            const seconds = timestamp.seconds ?? timestamp._seconds;
            if (typeof timestamp.toDate === "function") date = timestamp.toDate();
            else if (typeof seconds === "number") date = new Date(seconds * 1000);
            else return undefined;
        } else return undefined;
        return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : undefined;
    } catch { return undefined; }
};
