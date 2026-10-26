import { Request, Response } from "express";
import {
    getAllReports,
    getReportById,
    getReportsByUserId,
    getReportsByPostId,
    createReport,
    deleteReport
}from "../services/reports.service"
import { reportDocumentIdSchema } from "../validation/reports.validation";


import { ReportError } from "../services/reports.service";
import { ZodError } from "zod";
import { getModerationReports, getModerationReport, moderateReport } from "../services/reports.service";
import { reportActionSchema } from "../validation/reports.validation";
import { ContentRemovalError } from "../services/contentRemoval.service";
export const actOnReport = async (req: Request, res: Response) => {
  try {
    res.setHeader("Cache-Control", "private, no-store");
    const { action } = reportActionSchema.parse(req.body);
    return res.json(await moderateReport(req.user.uid, reportDocumentIdSchema.parse(req.params.id), action));
  } catch (error) { return sendError(res, error); }
};

const sendError = (res: Response, error: unknown) => {
  if (error instanceof ZodError) return res.status(400).json({ message: "Invalid report", errors: error.issues });
  if (error instanceof ReportError) return res.status(error.statusCode).json({ message: error.message, ...(error.code ? { code: error.code } : {}) });
  if (error instanceof ContentRemovalError) return res.status(error.statusCode).json({ message: error.message });
  console.error("Report request failed", error);
  return res.status(500).json({ message: "Could not process the report. Please try again." });
};
export const addReport = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) return res.status(401).json({ message: "Authentication required" });
  try {
    const receipt = await createReport(uid, res.locals.reportInput);
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(201).json(receipt);
  } catch (error) { return sendError(res, error); }
};
export const removeReport=async(
    req:Request,
    res:Response
)=>{
    try{
        const {id}=req.params;
        const reportId = reportDocumentIdSchema.parse(id);
        await getModerationReport(req.user.uid, reportId);
        await deleteReport(reportId);
        return res.status(200).json({
            message:"Report deleted"
        });
    }catch(error){
        return sendError(res, error);
    }
}

export const getReports=async(
    req:Request,
    res:Response
)=>{
    try{
        const reports = await getModerationReports(req.user.uid);
        res.setHeader("Cache-Control", "private, no-store");
        return res.status(200).json(reports);
    }catch(error){
        return sendError(res, error);
    }
}
export const getReport=async(
    req:Request,
    res:Response
)=>{
    try{
        const {id}=req.params;
        const report = await getModerationReport(req.user.uid, reportDocumentIdSchema.parse(id));
        res.setHeader("Cache-Control", "private, no-store");
        if(!report){
            return res.status(404).json({
                message:"There isnt any report with this id"
            });
        }
        return res.status(200).json(report);
    }catch(error){
        return sendError(res, error);
    }
}
export const getUserReports=async(
    req:Request,
    res:Response
)=>{
    try{
        const userId=req.user.uid;
        const reports=await getReportsByUserId(userId);

        return res.status(200).json(reports)
    }catch(error){
        return res.status(500).json({
            message:error ||"Server error"
        })
    }
}
export const getPostReports=async(
    req:Request,
    res:Response
)=>{
    try{
        const {postId}=req.params;
        const reports =await getModerationReports(req.user.uid, reportDocumentIdSchema.parse(postId));

        return res.status(200).json(reports)
    }catch(error){
        return sendError(res, error);
    }
}
