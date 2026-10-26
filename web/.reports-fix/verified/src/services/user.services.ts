import { User } from "../modules/users.model";
import { COLLECTIONS } from "../constants/collections";
import {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getAllDocuments
} from "../utils/firestore.service";

export const createUser = async (
    user: User
) => {
    await createDocument(
        COLLECTIONS.USERS,
        user.id,
        user
    );
    return user;
};

export const getUserById = async (
    id: string
): Promise<User | null> => {
    return await getDocumentById<User>(
        COLLECTIONS.USERS,
        id
    );
};

export const updateUser = async (
    id: string,
    data: Partial<User>
) => {
    await updateDocument<User>(
        COLLECTIONS.USERS,
        id,
        data
    );
};

export const deleteUser = async (
    id: string
) => {
    await deleteDocument(
        COLLECTIONS.USERS,
        id
    );
};
export const getAllUsers=async()=>{
    return await getAllDocuments<User>(
        COLLECTIONS.USERS
    );
}