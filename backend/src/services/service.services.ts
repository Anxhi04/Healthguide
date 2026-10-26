import { COLLECTIONS } from "../constants/collections";
import {
  getAllDocuments,
  getDocumentById
} from "../utils/firestore.service";


export const getServiceById= async(
    id:string
)=>{
    return await getDocumentById(
        COLLECTIONS.SERVICES,
        id
    );
};
export const getAllServices= async()=>{
    return await getAllDocuments(
        COLLECTIONS.SERVICES
    );
}


