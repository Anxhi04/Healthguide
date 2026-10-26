import { Request, Response } from "express";
import { createCommunity, updateCommunities, deleteCommunity } from "../services/communities.service";
import { communityDetails, listCommunities, myCommunities } from "../services/communityDirectory.service";
import { CommunityError } from "../services/communityMember.services";
import { setCommunityImage } from "../services/communityImage.service";

export const communityFailure = (res: Response, error: unknown) =>
  res.status(error instanceof CommunityError ? error.statusCode : 500).json({
    message: error instanceof CommunityError ? error.message : "Could not complete the community request",
  });
export const createNewCommunity = async (req: Request, res: Response) => {
  try { return res.status(201).json(await createCommunity(res.locals.communityInput, req.user.uid)); }
  catch (error) { return communityFailure(res, error); }
};
export const getCommunities = async (req: Request, res: Response) => {
  try { return res.json(await listCommunities(req.user?.uid)); }
  catch (error) { return communityFailure(res, error); }
};
export const getMyCommunities = async (req: Request, res: Response) => {
  try { return res.json(await myCommunities(req.user.uid)); }
  catch (error) { return communityFailure(res, error); }
};
export const getCommunity = async (req: Request, res: Response) => {
  try { return res.json(await communityDetails(res.locals.communityId, req.user?.uid)); }
  catch (error) { return communityFailure(res, error); }
};
export const editCommunity = async (req: Request, res: Response) => {
  try { await updateCommunities(res.locals.communityId, res.locals.communityInput, req.user.uid); return res.json({ message: "Community updated" }); }
  catch (error) { return communityFailure(res, error); }
};
export const removeCommunity = async (req: Request, res: Response) => {
  try { await deleteCommunity(res.locals.communityId, req.user.uid); return res.json({ message: "Community deleted" }); }
  catch (error) { return communityFailure(res, error); }
};
export const uploadCommunityImage = async (req: Request, res: Response) => {
  try { const input = res.locals.communityInput; return res.json(await setCommunityImage(res.locals.communityId, req.user.uid, input.bytes, input.contentType)); }
  catch (error) { return communityFailure(res, error); }
};
