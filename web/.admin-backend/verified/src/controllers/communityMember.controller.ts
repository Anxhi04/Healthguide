import { Request, Response } from "express";
import { Timestamp } from "firebase-admin/firestore";
import { joinCommunity, leaveCommunity, getCommunityMembers, isCommunityMember } from "../services/communityMember.services";
import { communityFailure } from "./communities.controller";
export const join = async (req: Request, res: Response) => {
  try { return res.json(await joinCommunity({ id: "", userId: req.user.uid, communityId: res.locals.communityId, joinedAt: Timestamp.now() })); }
  catch (error) { return communityFailure(res, error); }
};
export const leave = async (req: Request, res: Response) => {
  try { return res.json(await leaveCommunity(res.locals.communityId, req.user.uid)); }
  catch (error) { return communityFailure(res, error); }
};
export const getMembers = async (_req: Request, res: Response) => {
  try { return res.json(await getCommunityMembers(res.locals.communityId)); }
  catch (error) { return communityFailure(res, error); }
};
export const checkMembership = async (req: Request, res: Response) => {
  try { return res.json({ isMember: await isCommunityMember(res.locals.communityId, req.user?.uid) }); }
  catch (error) { return communityFailure(res, error); }
};
