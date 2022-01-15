import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ClaimCreated, Transfer, FeePaid, ClaimRejected, ClaimRescinded, ClaimPayment, BullaManagerSet } from "../../generated/BullaClaimERC721/BullaClaimERC721";
import { newMockEvent } from "matchstick-as";
import { CLAIM_TYPE_INVOICE, EMPTY_BYTES32 } from "../../src/functions/common";
import {
  toEthAddress,
  ADDRESS_ZERO,
  MULTIHASH_BYTES,
  ADDRESS_1,
  ADDRESS_3,
  toUint256,
  FEE_RECEIVER,
  CLAIM_AMOUNT,
  getFeeAmount,
  ADDRESS_2,
  MOCK_MANAGER_ADDRESS,
  toEthString,
  CLAIM_DESCRIPTION,
  MULTIHASH_FUNCTION,
  MULTIHASH_SIZE,
  MOCK_WETH_ADDRESS,
  DEFAULT_TIMESTAMP
} from "../helpers";

export const newTransferEvent = (claimCreatedEntity: ClaimCreated, isMintEvent: boolean): Transfer => {
  const event: Transfer = changetype<Transfer>(newMockEvent());
  const fromParam = new ethereum.EventParam("from", toEthAddress(isMintEvent ? ADDRESS_ZERO : ADDRESS_1));
  const toParam = new ethereum.EventParam("to", toEthAddress(isMintEvent ? ADDRESS_1 : ADDRESS_3));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(claimCreatedEntity.params.tokenId));
  event.parameters = [fromParam, toParam, tokenIdParam];

  return event;
};

export const newFeePaidEvent = (claimCreatedEntity: ClaimCreated): FeePaid => {
  const event: FeePaid = changetype<FeePaid>(newMockEvent());
  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(claimCreatedEntity.params.bullaManager));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(claimCreatedEntity.params.tokenId));
  const collectionAddressParam = new ethereum.EventParam("collectionAddress", toEthAddress(FEE_RECEIVER));
  const paymentAmountParam = new ethereum.EventParam("paymentAmount", toUint256(BigInt.fromString(CLAIM_AMOUNT)));
  const transactionFeeParam = new ethereum.EventParam("transactionFee", toUint256(getFeeAmount(BigInt.fromString(CLAIM_AMOUNT))));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(claimCreatedEntity.block.timestamp.plus(BigInt.fromU32(1000))));
  event.parameters = [bullaManagerParam, tokenIdParam, collectionAddressParam, paymentAmountParam, transactionFeeParam, blocktimeParam];

  return event;
};

export const newClaimRejectedEvent = (claimCreatedEntity: ClaimCreated): ClaimRejected => {
  const event: ClaimRejected = changetype<ClaimRejected>(newMockEvent());
  const managerAddressParam = new ethereum.EventParam("managerAddress", toEthAddress(claimCreatedEntity.params.bullaManager));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(claimCreatedEntity.params.tokenId));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(claimCreatedEntity.block.timestamp.plus(BigInt.fromU32(1000))));

  event.parameters = [managerAddressParam, tokenIdParam, blocktimeParam];
  return event;
};

export const newClaimRescindedEvent = (claimCreatedEntity: ClaimCreated): ClaimRescinded => {
  const event: ClaimRescinded = changetype<ClaimRescinded>(newMockEvent());
  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(claimCreatedEntity.params.bullaManager));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(claimCreatedEntity.params.tokenId));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(claimCreatedEntity.block.timestamp.plus(BigInt.fromU32(1000))));

  event.parameters = [bullaManagerParam, tokenIdParam, blocktimeParam];
  return event;
};

export const newClaimPaymentEvent = (claimCreatedEntity: ClaimCreated, partialPayment: boolean = false): ClaimPayment => {
  // pay half or pay in full
  const paymentAmount = partialPayment ? BigInt.fromString(CLAIM_AMOUNT).div(BigInt.fromU32(2)) : BigInt.fromString(CLAIM_AMOUNT);
  const event: ClaimPayment = changetype<ClaimPayment>(newMockEvent());

  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(claimCreatedEntity.params.bullaManager));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(claimCreatedEntity.params.tokenId));
  const debtorParam = new ethereum.EventParam("debtor", toEthAddress(claimCreatedEntity.params.debtor));
  const paidByParam = new ethereum.EventParam("paidBy", toEthAddress(claimCreatedEntity.params.debtor));
  const paidByOriginParam = new ethereum.EventParam("paidBy", toEthAddress(claimCreatedEntity.params.debtor));
  const paymentAmountParam = new ethereum.EventParam("paymentAmount", toUint256(paymentAmount));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(claimCreatedEntity.block.timestamp.plus(BigInt.fromU32(1000))));

  event.parameters = [bullaManagerParam, tokenIdParam, debtorParam, paidByParam, paidByOriginParam, paymentAmountParam, blocktimeParam];

  return event;
};

export const newPartialClaimPaymentEvent = (claimCreatedEntity: ClaimCreated): ClaimPayment => newClaimPaymentEvent(claimCreatedEntity, true);

export const newClaimCreatedEvent = (tokenId: u32, claimType: string, includeIPFSHash: boolean = false): ClaimCreated => {
  const sender = ADDRESS_1;
  const receiver = ADDRESS_2;
  const debtor = claimType === CLAIM_TYPE_INVOICE ? receiver : sender;
  const creditor = claimType === CLAIM_TYPE_INVOICE ? sender : receiver;
  const event: ClaimCreated = changetype<ClaimCreated>(newMockEvent());
  const tokenidParam = new ethereum.EventParam("tokenId", toUint256(BigInt.fromU32(tokenId)));
  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const parentParam = new ethereum.EventParam("parent", toEthAddress(ADDRESS_ZERO));
  const originParam = new ethereum.EventParam("origin", toEthAddress(sender));
  const debtorParam = new ethereum.EventParam("debtor", toEthAddress(debtor));
  const creditorParam = new ethereum.EventParam("creditor", toEthAddress(creditor));
  const descriptionParam = new ethereum.EventParam("description", toEthString(CLAIM_DESCRIPTION));

  const hash: Bytes = changetype<Bytes>(Bytes.fromHexString(includeIPFSHash ? MULTIHASH_BYTES : EMPTY_BYTES32));
  const multihashArray: Array<ethereum.Value> = [
    ethereum.Value.fromBytes(hash), // hash
    toUint256(BigInt.fromU32(includeIPFSHash ? MULTIHASH_FUNCTION : 0)), // hashFunction
    toUint256(BigInt.fromU32(includeIPFSHash ? MULTIHASH_SIZE : 0)) // size
  ];
  const multihashTuple: ethereum.Tuple = changetype<ethereum.Tuple>(multihashArray);

  const claimArray: Array<ethereum.Value> = [
    toUint256(BigInt.fromString(CLAIM_AMOUNT)), // claimAmount: 1 ether
    toUint256(BigInt.fromString("0")), // paidAmount
    toUint256(BigInt.fromString("0")), // status: pending
    toUint256(BigInt.fromU64(1641337179)), // dueBy
    toEthAddress(debtor), // debtor
    toEthAddress(MOCK_WETH_ADDRESS), // claimToken
    ethereum.Value.fromTuple(multihashTuple) // multihash
  ];

  const claimTuple: ethereum.Tuple = changetype<ethereum.Tuple>(claimArray);
  const claimParam = new ethereum.EventParam("claim", ethereum.Value.fromTuple(claimTuple));
  const timestampParam = new ethereum.EventParam("timestamp", toUint256(DEFAULT_TIMESTAMP));

  event.parameters = [bullaManagerParam, tokenidParam, parentParam, creditorParam, debtorParam, originParam, descriptionParam, claimParam, timestampParam];

  return event;
};

export const newClaimCreatedWithAttachmentEvent = (tokenId: u32, claimType: string): ClaimCreated => newClaimCreatedEvent(tokenId, claimType, true);

export const newBullaManagerSetEvent = (prevBullaManager: Address, newBullaManager: Address): BullaManagerSet => {
  const event: BullaManagerSet = changetype<BullaManagerSet>(newMockEvent());
  const prevManagerParam = new ethereum.EventParam("prevManager", toEthAddress(prevBullaManager));
  const newManagerParam = new ethereum.EventParam("newManager", toEthAddress(newBullaManager));
  const timestampParam = new ethereum.EventParam("timestamp", toUint256(DEFAULT_TIMESTAMP));
  event.parameters = [prevManagerParam, newManagerParam, timestampParam];

  return event;
};
