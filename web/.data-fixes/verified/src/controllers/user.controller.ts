import { getPublicUserById } from "../services/publicUser.service";
import { Request, Response } from "express";
import {
    getUserById,
    updateUser,
    deleteUser,
    createUser,
    getAllUsers
}from "../services/user.services";
import { createUserSchema , createUserByAdminSchema, updateUserSchema} from "../validation/user.validation";
import { Role, UserStatus } from "../enums/enums";
import { ZodError } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { auth } from "../config/firebase";
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

        return res.status(500).json({
            message: "Server error",
        });
    }
};
export const createNewUserByAdmin = async (
    req: Request,
    res: Response
) => {
    try {
        const validatedData = createUserByAdminSchema.parse(req.body);

        // UID of the admin performing the action
        const adminUid = req.user.uid;

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
            dateOfBirth: validatedData.dateOfBirth,
            role: validatedData.role,
            phoneNumber: validatedData.phoneNumber,
            city: validatedData.city,
            photoUrl: validatedData.photoUrl ?? "",
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

        return res.status(500).json({
            message: "Server error",
        });
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
    const uid = req.user?.uid;
    if (!uid) {
        return res.status(401).json({ message: "Authentication required" });
    }
    try {
        const user = await getUserById(uid);
        if (!user) {
            return res.status(404).json({
                message: "No user profile exists for the authenticated Firebase UID. Complete registration.",
            });
        }
        return res.status(200).json(user);
    } catch {
        return res.status(500).json({ message: "Could not load your profile" });
    }
};

export const getUser = async(
    req:Request,
    res:Response
)=>{
    console.log("GET USER ENTERED");
    console.log("USER ID:", req.params.id);
    try{
        const id = typeof req.params.id === "string" ? req.params.id : "";
        if (id !== req.user?.uid && req.user?.role !== Role.ADMIN) return res.status(403).json({ message: "Private profile access denied" });
        const user= await getUserById(id);
        if(!user){
            return res.status(404).json({
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
export const editUser= async(
    req:Request,
    res:Response
)=>{
    try{

        const id = typeof req.params.id === "string" ? req.params.id : "";
        if (id !== req.user?.uid) return res.status(403).json({ message: "You can only update your own profile" });
        const input = updateUserSchema.parse(req.body);
        const data = { ...input, ...(input.dateOfBirth ? { dateOfBirth: Timestamp.fromDate(new Date(input.dateOfBirth)) } : {}) };
        await updateUser(id, { ...data, updatedAt: Timestamp.now() } as Partial<import("../modules/users.model").User>);
        return res.status(200).json({
                message:"User updated"
            });
    }catch(error){
        if (error instanceof ZodError) return res.status(400).json({ message: "Invalid profile update", errors: error.issues });
        return res.status(500).json({
            message:"Server error"
        });      
    }
}
export const removeUser = async(
    req:Request,
    res:Response,
)=>{
    try{
        const {id}= req.params;
        await deleteUser(id);
        return res.status(200).json({
            message:"User deleted"
        })
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        })
    }
}
export const getUsers= async(
    req:Request,
    res:Response
)=>{
    try{
        const users= await getAllUsers();
        console.log("users backend", users);
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
        const user = await getPublicUserById(id);
        if (!user) return res.status(404).json({ message: "Public profile not available" });
        return res.status(200).json(user);
    } catch {
        return res.status(500).json({ message: "Could not load this profile" });
    }
};
