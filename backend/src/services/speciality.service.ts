import { COLLECTIONS } from "../constants/collections";
import {
  getAllDocuments,
  getDocumentById
} from "../utils/firestore.service";


export const getSpecialityById= async(
    id:string
)=>{
    return await getDocumentById(
        COLLECTIONS.SPECIALITIES,
        id
    );
}

export const getAllSpecialities= async()=>{
    return await getAllDocuments(
        COLLECTIONS.SPECIALITIES
    )
}

