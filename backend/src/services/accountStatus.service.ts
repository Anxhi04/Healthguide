import { UserStatus } from "../enums/enums";
import type { User } from "../modules/users.model";
export const ACCOUNT_RESTRICTED_MESSAGE = "Your account has been restricted. You can browse public content, but cannot make changes.";
export class AccountRestrictionError extends Error {
  readonly statusCode = 403;
  readonly code = "ACCOUNT_BLOCKED";
  constructor() { super(ACCOUNT_RESTRICTED_MESSAGE); }
}
// Only ACTIVE accounts may mutate. Invalid/legacy statuses fail closed; registration handles missing profiles.
export const assertAccountCanMutate = (user: Pick<User, "status"> | null | undefined) => {
  if (user && user.status !== UserStatus.ACTIVE) throw new AccountRestrictionError();
};
