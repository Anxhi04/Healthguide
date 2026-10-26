import { Post } from "../modules/posts.model";
import { COLLECTIONS } from "../constants/collections";
import {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getAllDocuments,
    getDocumentsByField,
    getDocumentsByIds
} from "../utils/firestore.service";
import { getUserById } from "./user.services";
import { Timestamp } from "firebase-admin/firestore";
import { containsBannedWord } from "./bannedWords.services";
import { ReviewStatus } from "../enums/enums";
import { getCommunityById } from "./communities.service";
import { toPublicUser } from "./publicUser.service";
import { DisplayMode } from "../enums/enums";
import { User } from "../modules/users.model";

export const presentPosts = async (posts: Post[], viewerUid?: string) => {
    posts = posts.filter(post => post.status === ReviewStatus.APPROVED || (!!viewerUid && post.userId === viewerUid));
    const authorIds = [...new Set(posts.filter(post => post.displayMode !== DisplayMode.ANONYMOUS && !post.isAnonymous).map(post => post.userId))];
    const authors = new Map((await getDocumentsByIds<User>(COLLECTIONS.USERS, authorIds)).map(user => [user.id, user]));
    return posts.map(post => {
        const anonymous = post.displayMode === DisplayMode.ANONYMOUS || post.isAnonymous === true;
        const author = authors.get(post.userId);
        return { id: post.id, title: post.title, content: post.content, type: post.type,
            communityId: post.communityId ?? null, displayMode: anonymous ? DisplayMode.ANONYMOUS : DisplayMode.REAL,
            isAnonymous: anonymous, status: post.status, createdAt: post.createdAt, updatedAt: post.updatedAt,
            ...(post.imageUrls ? { imageUrls: post.imageUrls } : {}), isMine: !!viewerUid && post.userId === viewerUid,
            ...(!anonymous && author ? { author: toPublicUser(author) } : {}),
        };
    });
};
export const createPost= async(
    post:Omit<Post, "createdAt" | "updatedAt">
)=>{
    //check if user exists
    const userExists=await  getUserById(post.userId);
    if(!userExists){
        throw new Error("No user profile exists for the authenticated Firebase UID. Complete registration before creating a post.")
    }
    //check if this post has bannedwords
    const hasBannedWord=await containsBannedWord(
        `${post.title} ${post.content}`
    )
    const communityId = post.communityId ?? null;
    if (communityId !== null) {
        if (typeof communityId !== "string" || communityId.length === 0) {
            throw new Error("Invalid community ID");
        }
        const community = await getCommunityById(communityId);
        if (!community) {
            throw new Error("Community does not exist");
        }
    }
    const newPost ={
        ...post,
        communityId,
        status: hasBannedWord ? ReviewStatus.PENDING : ReviewStatus.APPROVED,
        createdAt:Timestamp.now(),
        updatedAt:Timestamp.now(),
    }
    await createDocument(
        COLLECTIONS.POSTS,
        post.id,
        newPost
    )
    return newPost;
}
export const  getPostById=async(
    id:string,
)=>{
    return await getDocumentById(
        COLLECTIONS.POSTS,
        id
    );
}
export const updatePost=async(
    id:string,
    data:Partial<Post>
)=>{
    const post = await getPostById(id);
    if(!post){
        throw new Error("This post does not exists")
    }
    await updateDocument(
        COLLECTIONS.POSTS,
        id,
        {
            ...data,
            updatedAt:Timestamp.now()
        }
    );
}
export const deletePost=async(
    id:string
)=>{
    const post = await getPostById(id);
    if(!post){
        throw new Error("This post does not exists")
    }
    await deleteDocument(
        COLLECTIONS.POSTS,
        id
    );
}
export const getAllPosts=async(communityId?: string)=>{
    if (communityId !== undefined) {
        return await getDocumentsByField<Post>(
            COLLECTIONS.POSTS,
            "communityId",
            communityId
        );
    }
    return await getAllDocuments<Post>(
        COLLECTIONS.POSTS
    )
}
