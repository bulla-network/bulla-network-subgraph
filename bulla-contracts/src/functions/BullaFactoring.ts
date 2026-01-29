import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { BullaFactoringV0, ActivePaidInvoicesReconciled, DepositMade, InvoiceUnfactored as InvoiceUnfactoredV0, SharesRedeemed } from "../../generated/BullaFactoringV0/BullaFactoringV0";
import {
  BullaFactoringV1,
  Deposit as DepositV1,
  InvoiceFunded as InvoiceFundedV1,
  InvoiceImpaired as InvoiceImpairedV1,
  InvoiceKickbackAmountSent as InvoiceKickbackAmountSentV1,
  InvoicePaid as InvoicePaidV1,
  InvoiceUnfactored as InvoiceUnfactoredV1,
  Withdraw as WithdrawV1,
} from "../../generated/BullaFactoringV1/BullaFactoringV1";
import {
  BullaFactoringV2_1,
  InvoiceFunded as InvoiceFundedV2_1,
  InvoicePaid as InvoicePaidV2_1,
  InvoiceUnfactored as InvoiceUnfactoredV2_1,
} from "../../generated/BullaFactoringV2_1/BullaFactoringV2_1";
import {
  DepositMadeEvent,
  InvoiceFundedEvent,
  InvoiceImpairedEvent,
  InvoiceKickbackAmountSentEvent,
  InvoiceReconciledEvent,
  InvoiceUnfactoredEvent,
  PoolPermissionsContractAddresses,
  SharesRedeemedEvent,
} from "../../generated/schema";
import { ADDRESS_ZERO } from "./common";

export const getInvoiceFundedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceFunded-" + underlyingClaimId.toString() + "-" + event.address.toHexString();

export const createInvoiceFundedEventV1 = (underlyingTokenId: BigInt, event: InvoiceFundedV1): InvoiceFundedEvent => {
  return new InvoiceFundedEvent(getInvoiceFundedEventId(underlyingTokenId, event));
};

export const createInvoiceFundedEventV2_1 = (underlyingTokenId: BigInt, event: InvoiceFundedV2_1): InvoiceFundedEvent => {
  return new InvoiceFundedEvent(getInvoiceFundedEventId(underlyingTokenId, event));
};

export const getInvoiceKickbackAmountSentEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceKickbackAmountSent-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceKickbackAmountSentEventV1 = (underlyingTokenId: BigInt, event: ethereum.Event): InvoiceKickbackAmountSentEvent =>
  new InvoiceKickbackAmountSentEvent(getInvoiceKickbackAmountSentEventId(underlyingTokenId, event));

export const getInvoiceUnfactoredEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceUnfactored-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceUnfactoredEventV0 = (underlyingTokenId: BigInt, event: InvoiceUnfactoredV0): InvoiceUnfactoredEvent =>
  new InvoiceUnfactoredEvent(getInvoiceUnfactoredEventId(underlyingTokenId, event));

export const createInvoiceUnfactoredEventV1 = (underlyingTokenId: BigInt, event: InvoiceUnfactoredV1): InvoiceUnfactoredEvent =>
  new InvoiceUnfactoredEvent(getInvoiceUnfactoredEventId(underlyingTokenId, event));

export const createInvoiceUnfactoredEventV2_1 = (underlyingTokenId: BigInt, event: InvoiceUnfactoredV2_1): InvoiceUnfactoredEvent =>
  new InvoiceUnfactoredEvent(getInvoiceUnfactoredEventId(underlyingTokenId, event));

export const getDepositMadeEventId = (event: ethereum.Event, logIndexOverride: BigInt | null): string => {
  const poolAddress = event.address;
  return (
    "DepositMade-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + (logIndexOverride ? logIndexOverride : event.logIndex).toString()
  );
};

export const createDepositMadeEventV0 = (event: DepositMade): DepositMadeEvent => new DepositMadeEvent(getDepositMadeEventId(event, null));

export const createDepositMadeEventV1 = (event: DepositV1): DepositMadeEvent => new DepositMadeEvent(getDepositMadeEventId(event, null));

export const getSharesRedeemedEventId = (event: ethereum.Event, logIndexOverride: BigInt | null): string => {
  const poolAddress = event.address;
  return (
    "SharesRedeemed-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + (logIndexOverride ? logIndexOverride : event.logIndex).toString()
  );
};

export const createSharesRedeemedEventV0 = (event: SharesRedeemed): SharesRedeemedEvent => new SharesRedeemedEvent(getSharesRedeemedEventId(event, null));

export const createSharesRedeemedEventV1 = (event: WithdrawV1): SharesRedeemedEvent => new SharesRedeemedEvent(getSharesRedeemedEventId(event, null));

export const getInvoiceImpairedEventId = (underlyingClaimId: BigInt, event: ethereum.Event): string =>
  "InvoiceImpaired-" + underlyingClaimId.toString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString();

export const createInvoiceImpairedEventV1 = (underlyingTokenId: BigInt, event: InvoiceImpairedV1): InvoiceImpairedEvent =>
  new InvoiceImpairedEvent(getInvoiceImpairedEventId(underlyingTokenId, event));

export const getInvoiceReconciledEventId = (invoiceId: BigInt, event: ethereum.Event): string => {
  const poolAddress = event.address;
  return "InvoiceReconciled-" + poolAddress.toHexString() + "-" + event.transaction.hash.toHexString() + "-" + event.logIndex.toString() + "-" + invoiceId.toString();
};

export const createInvoiceReconciledEventV0 = (invoiceId: BigInt, event: ActivePaidInvoicesReconciled): InvoiceReconciledEvent =>
  new InvoiceReconciledEvent(getInvoiceReconciledEventId(invoiceId, event));

export const createInvoiceReconciledEventV1 = (invoiceId: BigInt, event: InvoicePaidV1): InvoiceReconciledEvent =>
  new InvoiceReconciledEvent(getInvoiceReconciledEventId(invoiceId, event));

export const createInvoiceReconciledEventV2_1 = (invoiceId: BigInt, event: InvoicePaidV2_1): InvoiceReconciledEvent =>
  new InvoiceReconciledEvent(getInvoiceReconciledEventId(invoiceId, event));

export const getTargetProtocolFeeFromFundedEvent = (invoiceId: BigInt, event: ethereum.Event): BigInt => {
  const fundedEventId = getInvoiceFundedEventId(invoiceId, event);
  const fundedEvent = InvoiceFundedEvent.load(fundedEventId);

  if (fundedEvent) {
    return fundedEvent.targetProtocolFee;
  }

  return BigInt.fromI32(0);
};

export const getOrCreatePoolPermissionsContractAddresses = (poolAddress: Address, version: string): PoolPermissionsContractAddresses => {
  let poolPermissions = PoolPermissionsContractAddresses.load(poolAddress.toHexString());

  if (!poolPermissions) {
    poolPermissions = new PoolPermissionsContractAddresses(poolAddress.toHexString());
    poolPermissions.poolAddress = poolAddress;

    if (version == "v0") {
      const contract = BullaFactoringV0.bind(poolAddress);
      poolPermissions.depositPermissions = contract.depositPermissions();
      poolPermissions.factoringPermissions = contract.factoringPermissions();
      poolPermissions.redeemPermissions = Address.fromString(ADDRESS_ZERO);
    } else if (version == "v1") {
      const contract = BullaFactoringV1.bind(poolAddress);
      poolPermissions.depositPermissions = contract.depositPermissions();
      poolPermissions.factoringPermissions = contract.factoringPermissions();
      poolPermissions.redeemPermissions = Address.fromString(ADDRESS_ZERO);
    } else {
      // v2_1
      const contract = BullaFactoringV2_1.bind(poolAddress);
      poolPermissions.depositPermissions = contract.depositPermissions();
      poolPermissions.factoringPermissions = contract.factoringPermissions();
      poolPermissions.redeemPermissions = contract.redeemPermissions();
    }
  }

  return poolPermissions;
};
