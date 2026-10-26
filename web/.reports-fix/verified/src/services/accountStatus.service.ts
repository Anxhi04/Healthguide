import { UserStatus } from "../enums/enums";
import type { User } from "../modules/users.model";
export const ACCOUNT_RESTRICTED_MESSAGE = "Your account has been restricted. You can browse public content, but cannot make changes.";
export class AccountRestrictionError extends Error {
  readonly statusCode = 403;
  readonly code = "ACCOUNT_BLOCKED";
  constructor() { super(ACCOUNT_RESTRICTED_MESSAGE); }
}
// Missing profiles are allowed here so authenticated registration can create one.
// Individual services continue enforcing profile existence where required.
export const assertAccountCanMutate = (user: Pick<User, "status"> | null | undefined) => {
  if (user?.status === UserStatus.BLOCKED) throw new AccountRestrictionError();
};
