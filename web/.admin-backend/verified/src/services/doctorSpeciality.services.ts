import { DoctorSpeciality } from "../modules/doctorSpecialities.model";
import { COLLECTIONS } from "../constants/collections";
import {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getAllDocuments
} from "../utils/firestore.service";

export const createDoctorSpeciality = async(
    doctorSpeciality:DoctorSpeciality
)=>{
    await createDocument(
        COLLECTIONS.DOCTOR_SPECIALITIES,
        doctorSpeciality.id,
        doctorSpeciality
    )
    return doctorSpeciality;
}
export const getDoctorSpecialityById= async(
    id:string,
)=>{
    return await getDocumentById(
        COLLECTIONS.DOCTOR_SPECIALITIES,
        id
    );
}
export const updateDoctorSpeciality=async(
    id:string,
    data:Partial<DoctorSpeciality>
)=>{
    await updateDocument(
        COLLECTIONS.DOCTOR_SPECIALITIES,
        id,
        data
    );
}
export const deleteDoctorSpeciality= async(
    id:string
)=>{
    await deleteDocument(
        COLLECTIONS.DOCTOR_SPECIALITIES,
        id
    );
}
export const getDoctorSpecialities= async()=>{
    return await getAllDocuments(
        COLLECTIONS.DOCTOR_SPECIALITIES
    )
}