import { Request, Response } from "express";
import {
  getHospitalServiceById,
  getHospitalServices
} from "../services/hospitalService.services";
import { reviewDocumentIdSchema } from "../validation/review.validation";
import { hospitalMutation } from "./hospitalManagement.controller";



export const createNewHospitalService = hospitalMutation("hospitalService", "create");

export const getHospitalService = async (
    req: Request,
    res: Response
) => {
    try {

        const id = reviewDocumentIdSchema.parse(req.params.id);

        const hospitalService =
            await getHospitalServiceById(id);

        if (!hospitalService) {
            return res.status(404).json({
                message: "Hospital service not found"
            });
        }

        return res.status(200).json(hospitalService);

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const getAllHospitalServices = async (
    req: Request,
    res: Response
) => {
    try {

        const hospitalServices =
            await getHospitalServices();

        return res.status(200).json(hospitalServices);

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const editHospitalService = hospitalMutation("hospitalService", "update");

export const removeHospitalService = hospitalMutation("hospitalService", "delete");
