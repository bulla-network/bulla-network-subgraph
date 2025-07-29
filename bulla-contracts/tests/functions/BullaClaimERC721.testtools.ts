import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import {
  BullaManagerSet,
  ClaimCreated as ClaimCreatedV1,
  ClaimPayment,
  ClaimRejected,
  ClaimRescinded,
  FeePaid,
  Transfer,
} from "../../generated/BullaClaimERC721/BullaClaimERC721";
import {
  BindingUpdated,
  ClaimCreated as ClaimCreatedV2,
  ClaimImpaired,
  ClaimMarkedAsPaid,
  ClaimPayment as ClaimPaymentV2,
  ClaimRejected as ClaimRejectedV2,
  ClaimRescinded as ClaimRescindedV2,
  MetadataAdded,
} from "../../generated/BullaClaimV2/BullaClaimV2";
import { CLAIM_TYPE_INVOICE, EMPTY_BYTES32 } from "../../src/functions/common";
import {
  ADDRESS_1,
  ADDRESS_2,
  ADDRESS_3,
  ADDRESS_ZERO,
  CLAIM_DESCRIPTION,
  DEFAULT_TIMESTAMP,
  FEE_RECEIVER,
  MOCK_CLAIM_ADDRRESS,
  MOCK_MANAGER_ADDRESS,
  MOCK_WETH_ADDRESS,
  MULTIHASH_BYTES,
  MULTIHASH_FUNCTION,
  MULTIHASH_SIZE,
  ONE_ETH,
  getFeeAmount,
  toEthAddress,
  toEthString,
  toUint256,
} from "../helpers";

export const newTransferEvent = (claimCreatedEntity: ClaimCreatedV1, isMintEvent: boolean): Transfer => {
  const event: Transfer = changetype<Transfer>(newMockEvent());
  const fromParam = new ethereum.EventParam("from", toEthAddress(isMintEvent ? ADDRESS_ZERO : ADDRESS_1));
  const toParam = new ethereum.EventParam("to", toEthAddress(isMintEvent ? ADDRESS_1 : ADDRESS_3));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(claimCreatedEntity.params.tokenId));
  event.parameters = [fromParam, toParam, tokenIdParam];

  return event;
};

export const newFeePaidEvent = (claimCreatedEntity: ClaimCreatedV1): FeePaid => {
  const event: FeePaid = changetype<FeePaid>(newMockEvent());
  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(claimCreatedEntity.params.bullaManager));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(claimCreatedEntity.params.tokenId));
  const collectionAddressParam = new ethereum.EventParam("collectionAddress", toEthAddress(FEE_RECEIVER));
  const paymentAmountParam = new ethereum.EventParam("paymentAmount", toUint256(BigInt.fromString(ONE_ETH)));
  const transactionFeeParam = new ethereum.EventParam("transactionFee", toUint256(getFeeAmount(BigInt.fromString(ONE_ETH))));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(claimCreatedEntity.block.timestamp.plus(BigInt.fromU32(1000))));
  event.parameters = [bullaManagerParam, tokenIdParam, collectionAddressParam, paymentAmountParam, transactionFeeParam, blocktimeParam];

  return event;
};

export const newClaimRejectedEvent = (claimCreatedEntity: ClaimCreatedV1): ClaimRejected => {
  const event: ClaimRejected = changetype<ClaimRejected>(newMockEvent());
  const managerAddressParam = new ethereum.EventParam("managerAddress", toEthAddress(claimCreatedEntity.params.bullaManager));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(claimCreatedEntity.params.tokenId));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(claimCreatedEntity.block.timestamp.plus(BigInt.fromU32(1000))));

  event.parameters = [managerAddressParam, tokenIdParam, blocktimeParam];
  return event;
};

export const newClaimRescindedEvent = (claimCreatedEntity: ClaimCreatedV1): ClaimRescinded => {
  const event: ClaimRescinded = changetype<ClaimRescinded>(newMockEvent());
  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(claimCreatedEntity.params.bullaManager));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(claimCreatedEntity.params.tokenId));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(claimCreatedEntity.block.timestamp.plus(BigInt.fromU32(1000))));

  event.parameters = [bullaManagerParam, tokenIdParam, blocktimeParam];
  return event;
};

export const newClaimPaymentEvent = (claimCreatedEntity: ClaimCreatedV1, partialPayment: boolean = false): ClaimPayment => {
  // pay half or pay in full
  const paymentAmount = partialPayment ? BigInt.fromString(ONE_ETH).div(BigInt.fromU32(2)) : BigInt.fromString(ONE_ETH);
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

export const newPartialClaimPaymentEvent = (claimCreatedEntity: ClaimCreatedV1): ClaimPayment => newClaimPaymentEvent(claimCreatedEntity, true);

export const newClaimPaymentEventV2 = (claimCreatedEntity: ClaimCreatedV2, partialPayment: boolean = false): ClaimPaymentV2 => {
  // pay half or pay in full
  const paymentAmount = partialPayment ? BigInt.fromString(ONE_ETH).div(BigInt.fromU32(2)) : BigInt.fromString(ONE_ETH);
  const totalPaidAmount = partialPayment ? paymentAmount : BigInt.fromString(ONE_ETH);
  const event: ClaimPaymentV2 = changetype<ClaimPaymentV2>(newMockEvent());

  const claimIdParam = new ethereum.EventParam("claimId", toUint256(claimCreatedEntity.params.claimId));
  const paidByParam = new ethereum.EventParam("paidBy", toEthAddress(claimCreatedEntity.params.debtor));
  const paymentAmountParam = new ethereum.EventParam("paymentAmount", toUint256(paymentAmount));
  const totalPaidAmountParam = new ethereum.EventParam("totalPaidAmount", toUint256(totalPaidAmount));

  event.parameters = [claimIdParam, paidByParam, paymentAmountParam, totalPaidAmountParam];

  return event;
};

export const newPartialClaimPaymentEventV2 = (claimCreatedEntity: ClaimCreatedV2): ClaimPaymentV2 => newClaimPaymentEventV2(claimCreatedEntity, true);

export const newClaimCreatedEventV1 = (tokenId: u32, claimType: string, includeIPFSHash: boolean = false): ClaimCreatedV1 => {
  const sender = ADDRESS_1;
  const receiver = ADDRESS_2;
  const debtor = claimType === CLAIM_TYPE_INVOICE ? receiver : sender;
  const creditor = claimType === CLAIM_TYPE_INVOICE ? sender : receiver;
  const event: ClaimCreatedV1 = changetype<ClaimCreatedV1>(newMockEvent());
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
    toUint256(BigInt.fromU32(includeIPFSHash ? MULTIHASH_SIZE : 0)), // size
  ];
  const multihashTuple: ethereum.Tuple = changetype<ethereum.Tuple>(multihashArray);

  const claimArray: Array<ethereum.Value> = [
    toUint256(BigInt.fromString(ONE_ETH)), // claimAmount: 1 ether
    toUint256(BigInt.fromString("0")), // paidAmount
    toUint256(BigInt.fromString("0")), // status: pending
    toUint256(BigInt.fromU64(1641337179)), // dueBy
    toEthAddress(debtor), // debtor
    toEthAddress(MOCK_WETH_ADDRESS), // claimToken
    ethereum.Value.fromTuple(multihashTuple), // multihash
  ];

  const claimTuple: ethereum.Tuple = changetype<ethereum.Tuple>(claimArray);
  const claimParam = new ethereum.EventParam("claim", ethereum.Value.fromTuple(claimTuple));
  const timestampParam = new ethereum.EventParam("timestamp", toUint256(DEFAULT_TIMESTAMP));

  event.parameters = [bullaManagerParam, tokenidParam, parentParam, creditorParam, debtorParam, originParam, descriptionParam, claimParam, timestampParam];
  event.address = MOCK_CLAIM_ADDRRESS;

  return event;
};

export const newClaimCreatedEventV2 = (tokenId: u32, claimType: string, includeIPFSHash: boolean = false): ClaimCreatedV2 => {
  const sender = ADDRESS_1;
  const receiver = ADDRESS_2;
  const debtor = claimType === CLAIM_TYPE_INVOICE ? receiver : sender;
  const creditor = claimType === CLAIM_TYPE_INVOICE ? sender : receiver;
  const event: ClaimCreatedV2 = changetype<ClaimCreatedV2>(newMockEvent());

  // V2 ClaimCreated event parameters based on the ABI:
  // event ClaimCreated(
  //   uint256 indexed claimId,
  //   address indexed from,
  //   address indexed creditor,
  //   address debtor,
  //   uint256 claimAmount,
  //   string description,
  //   uint256 dueBy,
  //   address token,
  //   address controller,
  //   Binding binding
  // );

  const claimIdParam = new ethereum.EventParam("claimId", toUint256(BigInt.fromU32(tokenId)));
  const fromParam = new ethereum.EventParam("from", toEthAddress(sender));
  const creditorParam = new ethereum.EventParam("creditor", toEthAddress(creditor));
  const debtorParam = new ethereum.EventParam("debtor", toEthAddress(debtor));
  const claimAmountParam = new ethereum.EventParam("claimAmount", toUint256(BigInt.fromString(ONE_ETH)));
  const dueByParam = new ethereum.EventParam("dueBy", toUint256(BigInt.fromU64(1641337179)));
  const descriptionParam = new ethereum.EventParam("description", toEthString(CLAIM_DESCRIPTION));
  const tokenParam = new ethereum.EventParam("token", toEthAddress(MOCK_WETH_ADDRESS));
  const controllerParam = new ethereum.EventParam("controller", toEthAddress(ADDRESS_ZERO));
  const bindingParam = new ethereum.EventParam("binding", toUint256(BigInt.fromI32(0))); // 0 = Unbound

  event.parameters = [claimIdParam, fromParam, creditorParam, debtorParam, claimAmountParam, descriptionParam, dueByParam, tokenParam, controllerParam, bindingParam];
  event.address = MOCK_CLAIM_ADDRRESS;

  return event;
};

export const newClaimCreatedWithAttachmentEvent = (tokenId: u32, claimType: string): ClaimCreatedV1 => newClaimCreatedEventV1(tokenId, claimType, true);

export const newBullaManagerSetEvent = (prevBullaManager: Address, newBullaManager: Address): BullaManagerSet => {
  const event: BullaManagerSet = changetype<BullaManagerSet>(newMockEvent());
  const prevManagerParam = new ethereum.EventParam("prevManager", toEthAddress(prevBullaManager));
  const newManagerParam = new ethereum.EventParam("newManager", toEthAddress(newBullaManager));
  const timestampParam = new ethereum.EventParam("timestamp", toUint256(DEFAULT_TIMESTAMP));
  event.parameters = [prevManagerParam, newManagerParam, timestampParam];

  return event;
};

export const newMetadataAddedEvent = (
  claimId: u32,
  tokenURI: string = "https://example.com/token/1",
  attachmentURI: string = "https://example.com/attachment/1",
): MetadataAdded => {
  const event: MetadataAdded = changetype<MetadataAdded>(newMockEvent());
  const claimIdParam = new ethereum.EventParam("claimId", toUint256(BigInt.fromU32(claimId)));
  const tokenURIParam = new ethereum.EventParam("tokenURI", toEthString(tokenURI));
  const attachmentURIParam = new ethereum.EventParam("attachmentURI", toEthString(attachmentURI));

  event.parameters = [claimIdParam, tokenURIParam, attachmentURIParam];
  return event;
};

export const newBindingUpdatedEvent = (
  claimId: u32,
  from: Address = ADDRESS_1,
  binding: u32 = 1, // 1 = BindingPending, 2 = Bound
): BindingUpdated => {
  const event: BindingUpdated = changetype<BindingUpdated>(newMockEvent());
  const claimIdParam = new ethereum.EventParam("claimId", toUint256(BigInt.fromU32(claimId)));
  const fromParam = new ethereum.EventParam("from", toEthAddress(from));
  const bindingParam = new ethereum.EventParam("binding", toUint256(BigInt.fromU32(binding)));

  event.parameters = [claimIdParam, fromParam, bindingParam];
  return event;
};

export const newClaimRejectedEventV2 = (claimId: u32, from: Address = ADDRESS_1, note: string = "Rejected by debtor"): ClaimRejectedV2 => {
  const event: ClaimRejectedV2 = changetype<ClaimRejectedV2>(newMockEvent());
  const claimIdParam = new ethereum.EventParam("claimId", toUint256(BigInt.fromU32(claimId)));
  const fromParam = new ethereum.EventParam("from", toEthAddress(from));
  const noteParam = new ethereum.EventParam("note", toEthString(note));

  event.parameters = [claimIdParam, fromParam, noteParam];
  return event;
};

export const newClaimRescindedEventV2 = (claimId: u32, from: Address = ADDRESS_1, note: string = "Rescinded by creditor"): ClaimRescindedV2 => {
  const event: ClaimRescindedV2 = changetype<ClaimRescindedV2>(newMockEvent());
  const claimIdParam = new ethereum.EventParam("claimId", toUint256(BigInt.fromU32(claimId)));
  const fromParam = new ethereum.EventParam("from", toEthAddress(from));
  const noteParam = new ethereum.EventParam("note", toEthString(note));

  event.parameters = [claimIdParam, fromParam, noteParam];
  return event;
};

export const newClaimImpairedEvent = (claimId: u32): ClaimImpaired => {
  const event: ClaimImpaired = changetype<ClaimImpaired>(newMockEvent());
  const claimIdParam = new ethereum.EventParam("claimId", toUint256(BigInt.fromU32(claimId)));

  event.parameters = [claimIdParam];
  return event;
};

export const newClaimMarkedAsPaidEvent = (claimId: u32): ClaimMarkedAsPaid => {
  const event: ClaimMarkedAsPaid = changetype<ClaimMarkedAsPaid>(newMockEvent());
  const claimIdParam = new ethereum.EventParam("claimId", toUint256(BigInt.fromU32(claimId)));

  event.parameters = [claimIdParam];
  return event;
};
