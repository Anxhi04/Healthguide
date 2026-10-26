import { HospitalService } from "../modules/hospitalServices.model";
import { COLLECTIONS } from "../constants/collections";

import {
    createDocument,
    getDocumentById,
    getAllDocuments,
    updateDocument,
    deleteDocument
} from "../utils/firestore.service";

export const createHospitalService = async (
    hospitalService: HospitalService
) => {

    await createDocument(
        COLLECTIONS.HOSPITAL_SERVICES,
        hospitalService.id,
        hospitalService
    );

    return hospitalService;

};

export const getHospitalServiceById = async (
    id: string
) => {

    return await getDocumentById(
        COLLECTIONS.HOSPITAL_SERVICES,
        id
    );

};

export const getHospitalServices = async () => {

    return await getAllDocuments(
        COLLECTIONS.HOSPITAL_SERVICES
    );

};

export const updateHospitalService = async (
    id: string,
    data: Partial<HospitalService>
) => {

    await updateDocument(
        COLLECTIONS.HOSPITAL_SERVICES,
        id,
        data
    );

};

export const deleteHospitalService = async (
    id: string
) => {

    await deleteDocument(
        COLLECTIONS.HOSPITAL_SERVICES,
        id
    );

};