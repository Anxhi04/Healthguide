import { Service } from "../modules/services.model";
import { COLLECTIONS  } from "../constants/collections";
import {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getAllDocuments
} from "../utils/firestore.service";

export const createService = async(
    service:Service
)=>{
    await createDocument(
        COLLECTIONS.SERVICES,
        service.id,
        service
    );
    return service;
};

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

export const updateService= async(
    id:string,
    data:Partial<Service>
)=>{
    await updateDocument(
        COLLECTIONS.SERVICES,
        id,
        data
    );
};

export const deleteService= async(
    id:string
)=>{
    await deleteDocument(
        COLLECTIONS.SERVICES,
        id
    );
};