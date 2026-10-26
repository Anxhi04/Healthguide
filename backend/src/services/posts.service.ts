import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../constants/collections";
import { DisplayMode, ReviewStatus } from "../enums/enums";
import { Post } from "../modules/posts.model";
import { User } from "../modules/users.model";
import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  getDocumentsByField,
  getDocumentsByIds
} from "../utils/firestore.service";
import { updatePostsSchema } from "../validation/posts.validation";
import { AuthorizationError, requireActor } from "./authorization.service";
import { containsBannedWord } from "./bannedWords.services";
import { getCommunityById } from "./communities.service";
import { getProfileUserById, toPublicUser } from "./publicUser.service";
import { getUserById } from "./user.services";

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
    post:Omit<Post, "createdAt" | "updatedAt" | "status">
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
export const updatePost = async (id: string, input: unknown, uid: string) => {
    await db.runTransaction(async transaction => {
        await requireActor(uid, transaction);
        const ref = db.collection(COLLECTIONS.POSTS).doc(id);
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists) throw new AuthorizationError("Post not found", 404);
        const post = snapshot.data() as Post;
        if (post.userId !== uid) throw new AuthorizationError("You can only edit your own posts");
        const data = updatePostsSchema.parse(input);
        if (data.communityId && !await getCommunityById(data.communityId)) throw new AuthorizationError("Community not found", 404);
        const merged = { ...post, ...data };
        const status = await containsBannedWord(`${merged.title} ${merged.content}`) ? ReviewStatus.PENDING : ReviewStatus.APPROVED;
        transaction.update(ref, { ...data, status, updatedAt: Timestamp.now() });
    });
};
export const deletePost = async (id: string, uid: string) => {
    await db.runTransaction(async transaction => {
        await requireActor(uid, transaction);
        const ref = db.collection(COLLECTIONS.POSTS).doc(id);
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists) throw new AuthorizationError("Post not found", 404);
        if (snapshot.data()!.userId !== uid) throw new AuthorizationError("You can only delete your own posts");
        transaction.delete(ref);
    });
};
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

// Public identity pages never include anonymous or unpublished activity, even for its owner.
export const getPublicPostsByUser = async (id: string, viewerUid?: string) => {
    const user = await getProfileUserById(id);
    if (!user) return null;
    if (user.settings?.privacy?.publicProfile === false && viewerUid !== user.id) return [];
    const posts = await getDocumentsByField<Post>(COLLECTIONS.POSTS, "userId", user.id);
    const visible = posts.filter(post => post.status === ReviewStatus.APPROVED &&
        (post.displayMode === DisplayMode.REAL || (post.displayMode == null && post.isAnonymous === false)) && post.isAnonymous !== true);
    visible.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0) || a.id.localeCompare(b.id));
    // Filtering above stays strict; viewer context supplies only safe ownership.
    return presentPosts(visible, viewerUid);
};
