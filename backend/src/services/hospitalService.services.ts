import { COLLECTIONS } from "../constants/collections";

import {
  getAllDocuments,
  getDocumentById
} from "../utils/firestore.service";


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


