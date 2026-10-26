import { Speciality } from "../modules/specialities.model";
import { COLLECTIONS  } from "../constants/collections";
import {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getAllDocuments
} from "../utils/firestore.service";

export const createSpeciality= async(
    speciality: Speciality 
)=>{
    await createDocument(
        COLLECTIONS.SPECIALITIES,
        speciality.id,
        speciality
    )
    return speciality;
}

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
export const updateSpeciality= async(
    id:string,
    data: Partial<Speciality>
)=>{
    await updateDocument(
        COLLECTIONS.SPECIALITIES,
        id, 
        data
    );

}
export const deleteSpeciality= async(
    id:string
)=>{
    await deleteDocument(
        COLLECTIONS.SPECIALITIES,
        id
    );
}