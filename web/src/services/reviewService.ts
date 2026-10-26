import api from "@/lib/axios";
import { endpoints } from "@/endpoints/endpoints";
import { DisplayMode, ReviewStatus, TargetType } from "@/enums/enums";

export interface ModerationReview {
    id: string;
    targetType: TargetType;
    targetId: string;
    targetName: string;
    rating?: number;
    comment?: string;
    displayMode: DisplayMode;
    status: ReviewStatus;
    createdAt: string | { _seconds?: number; seconds?: number };
    author?: { firstName: string; lastname?: string } | null;
    anonymousLabel?: string;
}

export const ReviewService={
    async getDoctorModerationQueue(signal?: AbortSignal): Promise<ModerationReview[]> {
        return (await api.get("/review/moderation/doctor", { signal })).data;
    },
    async moderateDoctorReview(id: string, status: ReviewStatus.APPROVED | ReviewStatus.REJECTED): Promise<void> {
        await api.patch(`/review/moderation/doctor/${encodeURIComponent(id)}`, { status });
    },
    async getHospitalModerationQueue(signal?: AbortSignal): Promise<ModerationReview[]> {
        const res = await api.get(endpoints.REVIEW.HOSPITAL_MODERATION, { signal });
        return res.data;
    },
    async moderateHospitalReview(id: string, status: ReviewStatus.APPROVED | ReviewStatus.REJECTED): Promise<void> {
        await api.patch(endpoints.REVIEW.MODERATE_HOSPITAL(id), { status });
    },
    async getReviews(){
        const res= await api.get(endpoints.REVIEW.GET_ALL);
        return res.data
    },
    async getReviewById(id:string){
        const res = await api.get(endpoints.REVIEW.GET(id))
        return res.data
    },
    async addReview(reviewData:any){
        const res = await api.post(endpoints.REVIEW.CREATE, reviewData)
        return res.data
    },
    async deleteReview(id:string){
        const  res = await api.delete(endpoints.REVIEW.DELETE(id))
        return res.data
    },
    async update(id:string, reviewData:any){
        const res= await api.put(endpoints.REVIEW.UPDATE(id), reviewData);
        return res.data
    },
    async getDoctorReviews(id:string){
        const res = await api.get(endpoints.REVIEW.GET_DOCTOR_REVIEWS(id))
        return res.data
    },
    async getHospitalReviews(id:string){
        const res = await api.get(endpoints.REVIEW.GET_HOSPITAL_REVIEWS(id));
        return res.data
    }
}
