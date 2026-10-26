import { COLLECTIONS } from "../constants/collections";
import {
  getAllDocuments,
  getDocumentById
} from "../utils/firestore.service";


export const getDoctorSpecialityById= async(
    id:string,
)=>{
    return await getDocumentById(
        COLLECTIONS.DOCTOR_SPECIALITIES,
        id
    );
}


export const getDoctorSpecialities= async()=>{
    return await getAllDocuments(
        COLLECTIONS.DOCTOR_SPECIALITIES
    )
}