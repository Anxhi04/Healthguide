import { COLLECTIONS } from "../constants/collections";
import { Community } from "../modules/communities.model";
import { CommunityMembers } from "../modules/communityMembers.model";
import { getAllDocuments, getDocumentsByField } from "../utils/firestore.service";
import { requireCommunity } from "./communityMember.services";

const presentCommunity = (community: Community, members: CommunityMembers[], uid?: string) => ({
  id: community.id, name: community.name, ...(community.description ? { description: community.description } : {}),
  ...(community.imageUrl ? { imageUrl: community.imageUrl } : {}),
  memberCount: new Set(members.map(member => member.userId)).size,
  isMember: !!uid && members.some(member => member.userId === uid),
  isOwner: !!uid && community.createdBy === uid,
});
export const listCommunities = async (uid?: string) => {
  // Two collection reads for the directory, never one count request per card.
  const [communities, memberships] = await Promise.all([
    getAllDocuments<Community>(COLLECTIONS.COMMUNITIES), getAllDocuments<CommunityMembers>(COLLECTIONS.COMMUNITY_MEMBERS),
  ]);
  const grouped = new Map<string, CommunityMembers[]>();
  for (const member of memberships) {
    const group = grouped.get(member.communityId) ?? [];
    group.push(member); grouped.set(member.communityId, group);
  }
  return communities.map(community => presentCommunity(community, grouped.get(community.id) ?? [], uid));
};
export const communityDetails = async (id: string, uid?: string) => {
  const [community, members] = await Promise.all([requireCommunity(id),
    getDocumentsByField<CommunityMembers>(COLLECTIONS.COMMUNITY_MEMBERS, "communityId", id)]);
  return presentCommunity(community, members, uid);
};
export const myCommunities = async (uid: string) => {
  const memberships = await getDocumentsByField<CommunityMembers>(COLLECTIONS.COMMUNITY_MEMBERS, "userId", uid);
  // Shared grouped aggregation provides reliable counts, not a count per community.
  const mine = new Set(memberships.map(member => member.communityId));
  return (await listCommunities(uid)).filter(community => mine.has(community.id));
};
