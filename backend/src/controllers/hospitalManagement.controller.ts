import { Request, Response } from "express";
import { HospitalResource, mutateHospitalResource } from "../services/hospitalManagement.service";
import { mutationFailure } from "./mutationResponse";

export const hospitalMutation = (resource: HospitalResource, operation: "create" | "update" | "delete") =>
  async (req: Request, res: Response) => {
    try { return res.json(await mutateHospitalResource(resource, operation, req.user.uid, req.params.id, req.body)); }
    catch (error) { return mutationFailure(res, error); }
  };
