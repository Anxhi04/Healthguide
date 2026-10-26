import { DoctorAssignments } from "../modules/doctorAssignments.model";
import { COLLECTIONS } from "../constants/collections";
import {
    createDocument,
    getDocumentById,
    getAllDocuments,
    updateDocument,
    deleteDocument
} from "../utils/firestore.service";

export const createDoctorAssignment = async (
    assignment: DoctorAssignments
) => {
    await createDocument(
        COLLECTIONS.DOCTOR_ASSIGNMENTS,
        assignment.id,
        assignment
    );
    return assignment;

};

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

export const updateDoctorAssignment = async (
    id: string,
    data: Partial<DoctorAssignments>
) => {

    await updateDocument(
        COLLECTIONS.DOCTOR_ASSIGNMENTS,
        id,
        data
    );

};

export const deleteDoctorAssignment = async (
    id: string
) => {

    await deleteDocument(
        COLLECTIONS.DOCTOR_ASSIGNMENTS,
        id
    );

};