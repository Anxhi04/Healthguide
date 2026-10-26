import { Request, Response } from "express";
import {
  getAllServices,
  getServiceById
} from "../services/service.services";
import { reviewDocumentIdSchema } from "../validation/review.validation";
import { hospitalMutation } from "./hospitalManagement.controller";

export const createNewService = hospitalMutation("service", "create");

export const getService = async(
    req:Request,
    res:Response
)=>{
    try{
        const id = reviewDocumentIdSchema.parse(req.params.id);
        const service= await getServiceById(id);
        if(!service){
            return res.status(404).json({
                message:"service not found"
            });
        }
        return res.status(200).json(service);
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        });
    }
}
export const getServices= async(
    req:Request,
    res:Response 
)=>{
    try{
        const services = await getAllServices()
        return res.status(200).json(services)
    }catch(error){
        return res.status(500).json({
            message:"Server error"
        });       
    }
}
export const editService = hospitalMutation("service", "update");

export const removeService = hospitalMutation("service", "delete");
