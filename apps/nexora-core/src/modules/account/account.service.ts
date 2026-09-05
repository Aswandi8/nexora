import {
  updateAccountProfileSchema,
  type UpdateAccountProfileResult,
} from "@nexora/contracts";

import { accountRepository } from "./account.repository";

export interface UpdateOwnProfileResult {
  before: UpdateAccountProfileResult;
  result: UpdateAccountProfileResult;
}

export async function updateOwnProfile(
  userId: string,
  currentName: string,
  input: unknown,
): Promise<UpdateOwnProfileResult> {
  const data = updateAccountProfileSchema.parse(input);

  const before = {
    name: currentName,
  };

  if (data.name === currentName) {
    return {
      before,
      result: before,
    };
  }

  const updated = await accountRepository.updateName(userId, data.name);

  return {
    before,
    result: {
      name: updated.name,
    },
  };
}
