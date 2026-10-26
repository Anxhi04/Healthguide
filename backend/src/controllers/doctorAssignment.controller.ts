import { Request, Response } from "express";
import {
  getDoctorAssignmentById,
  getDoctorAssignments
} from "../services/doctorAssignment.services";
import { reviewDocumentIdSchema } from "../validation/review.validation";
import { hospitalMutation } from "./hospitalManagement.controller";



export const createNewDoctorAssignment = hospitalMutation("assignment", "create");

export const getDoctorAssignment = async (
    req: Request,
    res: Response
) => {
    try {

        const id = reviewDocumentIdSchema.parse(req.params.id);

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

export const editDoctorAssignment = hospitalMutation("assignment", "update");

export const removeDoctorAssignment = hospitalMutation("assignment", "delete");
