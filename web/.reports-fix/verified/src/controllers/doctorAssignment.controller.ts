import { Request, Response } from "express";
import {
    createDoctorAssignment,
    getDoctorAssignmentById,
    getDoctorAssignments,
    updateDoctorAssignment,
    deleteDoctorAssignment
} from "../services/doctorAssignment.services";

import { createDoctorAssignmentSchema } from "../validation/doctorAssignment.validation";

import { Timestamp } from "firebase-admin/firestore";
import { ZodError } from "zod";
import crypto from "crypto";

export const createNewDoctorAssignment = async (
    req: Request,
    res: Response
) => {
    try {

        const validatedData =
            createDoctorAssignmentSchema.parse(req.body);

        const assignment =
            await createDoctorAssignment({
                ...validatedData,
                id: crypto.randomUUID(),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });

        return res.status(200).json(assignment);

    } catch (error) {

        console.log(error);

        if (error instanceof ZodError) {
            return res.status(400).json({
                errors: error.issues
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const getDoctorAssignment = async (
    req: Request,
    res: Response
) => {
    try {

        const { id } = req.params;

        const assignment =
            await getDoctorAssignmentById(id);

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        return res.status(200).json(assignment);

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const getAllDoctorAssignments = async (
    req: Request,
    res: Response
) => {
    try {

        const assignments =
            await getDoctorAssignments();

        return res.status(200).json(assignments);

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const editDoctorAssignment = async (
    req: Request,
    res: Response
) => {
    try {

        const { id } = req.params;

        await updateDoctorAssignment(id, req.body);

        return res.status(200).json({
            message: "Assignment updated"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });
    }
};

export const removeDoctorAssignment = async (
    req: Request,
    res: Response
) => {
    try {

        const { id } = req.params;

        await deleteDoctorAssignment(id);

        return res.status(200).json({
            message: "Assignment deleted"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Server error"
        });
    }
};