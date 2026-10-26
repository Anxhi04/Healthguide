import { COLLECTIONS } from "../constants/collections";
import {
  getAllDocuments,
  getDocumentById,
  getDocumentsByField
} from "../utils/firestore.service";


export const getHospitalById= async(
    id:string,
)=>{
    return await getDocumentById(
        COLLECTIONS.HOSPITALS,
        id
    );
}


export const getAllHospitals= async()=>{
    return await getAllDocuments(
        COLLECTIONS.HOSPITALS
    )
}

export const getHospitalByAdminId = async (
  adminId: string
) => {
  // Use Firestore query instead of fetching all and filtering
  const hospitals = await getDocumentsByField(
    COLLECTIONS.HOSPITALS,
    "adminId",
    adminId
  );

  return hospitals.length > 0 ? hospitals[0] : null;
};