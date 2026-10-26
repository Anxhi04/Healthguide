import { COLLECTIONS } from "../constants/collections";
import {
  getAllDocuments,
  getDocumentById
} from "../utils/firestore.service";


export const getDoctorAssignmentById = async (
    id: string
) => {
    return await getDocumentById(
        COLLECTIONS.DOCTOR_ASSIGNMENTS,
        id
    );
};

export const getDoctorAssignments = async () => {
    return await getAllDocuments(
        COLLECTIONS.DOCTOR_ASSIGNMENTS
    );
};


