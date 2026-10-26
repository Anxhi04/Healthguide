import { z } from "zod";
import { DisplayMode, PostType, ReviewStatus } from "../enums/enums";
export const createPostsSchema=z.object({
    communityId:z.string().min(1).nullable().optional().default(null),//postimi mund te jet brenda nje grupi ose invidual i nje personi
    displayMode:z.enum(DisplayMode),
    type:z.enum(PostType),
    imageUrls:z.array(z.string().url()).optional(),
    isAnonymous:z.boolean().default(false),
    status:z.enum(ReviewStatus),
    content:z.string(),
    title:z.string(),

})
export const updatePostsSchema = z.object({ 
    communityId: z.string().min(1).nullable().optional(), 
    displayMode: z.enum(DisplayMode).optional(), 
    type: z.enum(PostType).optional(), 
    imageUrls: z.array(z.string().url()).optional(), 
    isAnonymous: z.boolean().optional(), 
    status: z.enum(ReviewStatus).optional(), 
    content: z.string().min(1).optional(), 
    title: z.string().min(1).optional() 
});