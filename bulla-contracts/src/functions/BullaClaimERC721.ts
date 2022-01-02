import { Claim } from "../../generated/schema";

export const getOrCreateClaim = (claimId: string): Claim => {
  let claim = Claim.load(claimId);
  if (!claim) claim = new Claim(claimId);
  
  return claim;
};
