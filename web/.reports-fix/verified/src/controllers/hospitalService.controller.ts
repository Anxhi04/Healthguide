import { Request, Response } from "express";
import {
    createHospitalService,
    getHospitalServiceById,
    getHospitalServices,
    updateHospitalService,
    deleteHospitalService
} from "../services/hospitalService.services";

import { createHospitalServiceSchema } from "../validation/hospitalService.validation";

import { Timestamp } from "firebase-admin/firestore";
import { ZodError } from "zod";
import crypto from "crypto";

export const createNewHospitalService = async (
    req: Request,
    res: Response
) => {
    try {

        const validatedData =
            createHospitalServiceSchema.parse(req.body);

        const hospitalService =
            await createHospitalService({
                ...validatedData,
                id: crypto.randomUUID(),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

        return res.status(200).json(hospitalService);

    } catch (error) {

        console.log(error);

        if (error instanceof ZodError) {
            return res.status(400).json({
                errors: error.issues,
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const getHospitalService = async (
    req: Request,
    res: Response
) => {
    try {

        const { id } = req.params;

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

export const editHospitalService = async (
    req: Request,
    res: Response
) => {
    try {

        const { id } = req.params;

        await updateHospitalService(id, req.body);

        return res.status(200).json({
            message: "Hospital service updated"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const removeHospitalService = async (
    req: Request,
    res: Response
) => {
    try {

        const { id } = req.params;

        await deleteHospitalService(id);

        return res.status(200).json({
            message: "Hospital service deleted"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });
    }
};