import { Request, Response } from "express";
import { Timestamp } from "firebase-admin/firestore";
import { ZodError } from "zod";
import { auth, logFirebaseError } from "../config/firebase";
import { Role, UserStatus } from "../enums/enums";
import { getProfileUserById, getPublicUserById } from "../services/publicUser.service";
import {
  createUser,
  getAllUsers,
  getUserById
} from "../services/user.services";
import { deleteAccount, editAccount } from "../services/userAdministration.service";
import { reviewDocumentIdSchema } from "../validation/review.validation";
import { createUserByAdminSchema, createUserSchema } from "../validation/user.validation";
import { mutationFailure } from "./mutationResponse";
export const createNewUser = async (
    req: Request,
    res: Response
) => {
    try {
        const validatedData = createUserSchema.parse(req.body);

        const firebaseUid = req.user?.uid;
        if (!firebaseUid) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (await getUserById(firebaseUid)) {
            return res.status(409).json({ message: "A profile already exists for this account" });
        }

        const user = await createUser({
            id: firebaseUid,
            displayId: firebaseUid.slice(0, 8),

            firstName: validatedData.firstName,
            lastname: validatedData.lastname,
            email: validatedData.email,
            gender: validatedData.gender,
            dateOfBirth: Timestamp.fromDate(new Date(validatedData.dateOfBirth)),
            phoneNumber: validatedData.phoneNumber,
            city: validatedData.city,
            photoUrl: "",
            settings: {
                notifications: {
                    helpRequests: true,
                    comments: true,
                    reviews: true,
                },
                privacy: {
                    publicProfile: true,
                },
            },

            role: Role.USER,
            status: UserStatus.ACTIVE,

            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        return res.status(201).json(user);

    } catch (error) {

        console.log(error);

        if (error instanceof ZodError) {
            return res.status(400).json({
                errors: error.issues,
            });
        }

        return mutationFailure(res, error);
    }
};
export const createNewUserByAdmin = async (
    req: Request,
    res: Response
) => {
    try {
        const validatedData = createUserByAdminSchema.parse(req.body);

        // Create the NEW user in Firebase Authentication
        const newFirebaseUser = await auth.createUser({
            email: validatedData.email,
            password: validatedData.password,
        });

        // UID of the NEW user
        const firebaseUid = newFirebaseUser.uid;

        const user = await createUser({
            id: firebaseUid,
            displayId: firebaseUid.slice(0, 8),

            firstName: validatedData.firstName,
            lastname: validatedData.lastname,
            email: validatedData.email,
            gender: validatedData.gender,
            dateOfBirth: Timestamp.fromDate(new Date(validatedData.dateOfBirth)),
            role: validatedData.role,
            phoneNumber: validatedData.phoneNumber,
            city: validatedData.city,
            photoUrl: validatedData.photoUrl ?? "",
            status: UserStatus.ACTIVE,
            settings: { notifications: { helpRequests: true, comments: true, reviews: true }, privacy: { publicProfile: true } },

            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        return res.status(201).json(user);

    } catch (error) {
        console.log(error);

        if (error instanceof ZodError) {
            return res.status(400).json({
                errors: error.issues,
            });
        }

        return mutationFailure(res, error);
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
    const uid = req.user?.uid;
    if (!uid) {
        return res.status(401).json({ message: "Authentication required" });
    }
    try {
        const user = await getUserById(uid);
        if (!user || (user as unknown as { deletedAt?: unknown }).deletedAt) {
            return res.status(404).json({
                code: "PROFILE_NOT_FOUND",
                message: "No user profile exists for the authenticated Firebase UID. Complete registration.",
            });
        }
        return res.status(200).json(user);
    } catch (error) {
        logFirebaseError("GET /users/me", error);
        return res.status(500).json({ message: "Could not load your profile" });
    }
};

export const getUser = async(
    req:Request,
    res:Response
)=>{
    try{
        const id = typeof req.params.id === "string" ? req.params.id : "";
        const target = await getProfileUserById(id);
        const user = target && target.id === req.user.uid
            ? target : await getPublicUserById(id, req.user.uid);
        if(!user){
            return res.status(404).json({
                ...(id === req.user?.uid ? { code: "PROFILE_NOT_FOUND" } : {}),
                message:"User not found"
            });
        }
        return res.status(200).json(user);
    }catch(error){
        console.error("GET USER ERROR:", error);
        return res.status(500).json({
            message:"Server error"
        });
    }
}
const accountMutation = (administrative: boolean, deleting: boolean) => async (req: Request, res: Response) => {
    try {
        const id = reviewDocumentIdSchema.parse(req.params.id);
        if (!administrative && id !== req.user.uid) return res.status(403).json({ message: "You can only manage your own profile" });
        if (deleting) await deleteAccount(req.user.uid, id, administrative);
        else await editAccount(req.user.uid, id, req.body, administrative);
        return res.json({ message: deleting ? "User deleted" : "User updated" });
    } catch (error) { return mutationFailure(res, error); }
};
export const editUser = accountMutation(false, false);
export const removeUser = accountMutation(false, true);
export const editUserByAdmin = accountMutation(true, false);
export const removeUserByAdmin = accountMutation(true, true);
export const getUsers= async(
    req:Request,
    res:Response
)=>{
    try{
        const users= await getAllUsers();
        return res.status(200).json(users);
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        })
    }
}
export const getPublicUser = async (req: Request, res: Response) => {
    try {
        const id = typeof req.params.id === "string" ? req.params.id : "";
        if (!id || id.includes("/")) return res.status(400).json({ message: "Invalid profile ID" });
        const user = await getPublicUserById(id, req.user?.uid);
        if (!user) return res.status(404).json({ message: "Public profile not available" });
        return res.status(200).json(user);
    } catch {
        return res.status(500).json({ message: "Could not load this profile" });
    }
};

