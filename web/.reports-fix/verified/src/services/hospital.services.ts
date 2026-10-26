import { Hospital } from "../modules/hospitals.model";
import { COLLECTIONS } from "../constants/collections";
import {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getAllDocuments,
    getDocumentsByField
} from "../utils/firestore.service";

export const createHospital = async(
    hospital:Hospital
)=>{
    await createDocument(
        COLLECTIONS.HOSPITALS,
        hospital.id,
        hospital
    )
    return hospital;
}
export const getHospitalById= async(
    id:string,
)=>{
    return await getDocumentById(
        COLLECTIONS.HOSPITALS,
        id
    );
}
export const updateHospital=async(
    id:string,
    data:Partial<Hospital>
)=>{
    await updateDocument(
        COLLECTIONS.HOSPITALS,
        id,
        data
    );
}
export const deleteHospital= async(
    id:string
)=>{
    await deleteDocument(
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
  console.log("🏥 SERVICE: getHospitalByAdminId called with adminId:", adminId);
  
  // Use Firestore query instead of fetching all and filtering
  const hospitals = await getDocumentsByField(
    COLLECTIONS.HOSPITALS,
    "adminId",
    adminId
  );

  console.log("🏥 SERVICE: Query returned", hospitals.length, "hospital(s)");
  
  return hospitals.length > 0 ? hospitals[0] : null;
};