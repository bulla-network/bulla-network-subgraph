import { Address, ethereum, BigInt, Bytes, log, ByteArray } from "@graphprotocol/graph-ts";
import { clearStore, createMockedFunction, newMockEvent } from "matchstick-as/assembly/index";
import { BullaBanker, BullaBankerCreated, BullaTagUpdated } from "../generated/BullaBanker/BullaBanker";
import {
  BullaManagerSet,
  ClaimCreated,
  ClaimPayment,
  ClaimRejected,
  ClaimRescinded,
  FeePaid,
  Transfer
} from "../generated/BullaClaimERC721/BullaClaimERC721";
import { AccountTag, BullaTagUpdatedEvent, ClaimCreatedEvent } from "../generated/schema";
import { ADDRESS_ZERO as addressZeroString, EMPTY_BYTES32 } from "../src/functions/common";

//@dev: ts-ignores here are for AssemblyScript functionality not supported by Typescript (u32 & changetype).

export const TX_HASH = "0x39d02b6c00bca9eecbaa7363d61f1ac1c096e2a71600af3c30108103ee846018";
//@ts-ignore
export const TX_HASH_BYTES: Bytes = changetype<Bytes>(Bytes.fromHexString(TX_HASH));
export const DEFAULT_TIMESTAMP = BigInt.fromI32(1641511670);
export const IPFS_HASH = "QmUuT6LyXrN3DwQh7YvFBe63fPLcqJKD2iW4j2tJhqh5X9";
export const MULTIHASH_BYTES = "0x618d2742203889e41eaae366739084c022f7e01a34639b7f2e0af7e6eb2bf064";
export const MULTIHASH_SIZE = 32;
export const MULTIHASH_FUNCTION = 18;
export const CLAIM_DESCRIPTION = "testing 1234";
export const DEFAULT_ACCOUNT_TAG = "test tag";
export const CLAIM_AMOUNT = "1000000000000000000";
export const MOCK_WETH_ADDRESS = Address.fromString("0xc778417e063141139fce010982780140aa0cd5ab");
export const MOCK_MANAGER_ADDRESS = Address.fromString("0xd33abDe96F344FDe00B65650c8f68875D4c9e18B");
export const MOCK_CLAIM_ADDRRESS = Address.fromString("0xC5E586BE8C2ae78dFbeBc41CB9232f652A837330");
export const MOCK_BANKER_ADDRESS = Address.fromString("0xf1f41946c288246b2d6e4E16Cb077a07B93CBE9a");
export const ADDRESS_ZERO = Address.fromString(addressZeroString);
export const ADDRESS_1 = Address.fromString("0xb8c18E036d46c5FB94d7DeBaAeD92aFabe65EE61");
export const ADDRESS_2 = Address.fromString("0xe2B28b58cc5d34872794E861fd1ba1982122B907");
export const ADDRESS_3 = Address.fromString("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
export const FEE_RECEIVER = ADDRESS_1;
export const FEE_BPS = BigInt.fromU64(5);

export const getFeeAmount = (amount: BigInt): BigInt => amount.times(FEE_BPS).div(BigInt.fromU32(10000));

export const toEthString = (value: string): ethereum.Value => ethereum.Value.fromString(value);

export const toEthAddress = (value: Address): ethereum.Value => ethereum.Value.fromAddress(value);

export const toUint256 = (value: BigInt): ethereum.Value => ethereum.Value.fromUnsignedBigInt(value);

export const setupTests = (): void => {
  /** setup ERC20 token */
  createMockedFunction(MOCK_WETH_ADDRESS, "decimals", "decimals():(uint8)").returns([ethereum.Value.fromI32(18)]);
  createMockedFunction(MOCK_WETH_ADDRESS, "symbol", "symbol():(string)").returns([ethereum.Value.fromString("WETH")]);
};

export const afterEach = (): void => {
  clearStore();
};

export const newBullaTagUpdatedEvent = (tokenId: BigInt, updatedBy: Address, _tag: string): BullaTagUpdated => {
  const tag: Bytes = Bytes.fromByteArray(ByteArray.fromUTF8(_tag));
  //@ts-ignore
  const event: BullaTagUpdated = changetype<BullaTagUpdated>(newMockEvent());
  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(tokenId));
  const updatedByParam = new ethereum.EventParam("updatedBy", toEthAddress(updatedBy));
  const tagParam = new ethereum.EventParam("tag", ethereum.Value.fromBytes(tag));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP.plus(BigInt.fromU32(1500))));
  event.parameters = [bullaManagerParam, tokenIdParam, updatedByParam, tagParam, blocktimeParam];

  return event;
};

export const newTransferEvent = (claimCreatedEntity: ClaimCreated, isMintEvent: boolean): Transfer => {
  //@ts-ignore
  const event: Transfer = changetype<Transfer>(newMockEvent());
  const fromParam = new ethereum.EventParam("from", toEthAddress(isMintEvent ? ADDRESS_ZERO : ADDRESS_1));
  const toParam = new ethereum.EventParam("to", toEthAddress(isMintEvent ? ADDRESS_1 : ADDRESS_3));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(claimCreatedEntity.params.tokenId));
  event.parameters = [fromParam, toParam, tokenIdParam];

  return event;
};

export const newFeePaidEvent = (claimCreatedEntity: ClaimCreated): FeePaid => {
  //@ts-ignore
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
  //@ts-ignore
  const event: ClaimRejected = changetype<ClaimRejected>(newMockEvent());
  const managerAddressParam = new ethereum.EventParam("managerAddress", toEthAddress(claimCreatedEntity.params.bullaManager));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(claimCreatedEntity.params.tokenId));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(claimCreatedEntity.block.timestamp.plus(BigInt.fromU32(1000))));

  event.parameters = [managerAddressParam, tokenIdParam, blocktimeParam];
  return event;
};

export const newClaimRescindedEvent = (claimCreatedEntity: ClaimCreated): ClaimRescinded => {
  //@ts-ignore
  const event: ClaimRescinded = changetype<ClaimRescinded>(newMockEvent());
  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(claimCreatedEntity.params.bullaManager));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(claimCreatedEntity.params.tokenId));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(claimCreatedEntity.block.timestamp.plus(BigInt.fromU32(1000))));

  event.parameters = [bullaManagerParam, tokenIdParam, blocktimeParam];
  return event;
};

export const newClaimPaymentEvent = (claimCreatedEntity: ClaimCreated, partialPayment: boolean): ClaimPayment => {
  // pay half or pay in full
  const paymentAmount = partialPayment ? BigInt.fromString(CLAIM_AMOUNT).div(BigInt.fromU32(2)) : BigInt.fromString(CLAIM_AMOUNT);
  //@ts-ignore
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

//@ts-ignore u32 not supported
export const newClaimCreatedEvent = (tokenId: u32, claimType: string, includeIPFSHash: boolean): ClaimCreated => {
  const sender = ADDRESS_1;
  const receiver = ADDRESS_2;
  const debtor = claimType === "INVOICE" ? receiver : sender;
  const creditor = claimType === "INVOICE" ? sender : receiver;
  //@ts-ignore
  const event: ClaimCreated = changetype<ClaimCreated>(newMockEvent());
  const tokenidParam = new ethereum.EventParam("tokenId", toUint256(BigInt.fromU32(tokenId)));
  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const parentParam = new ethereum.EventParam("parent", toEthAddress(ADDRESS_ZERO));
  const originParam = new ethereum.EventParam("origin", toEthAddress(sender));
  const debtorParam = new ethereum.EventParam("debtor", toEthAddress(debtor));
  const creditorParam = new ethereum.EventParam("creditor", toEthAddress(creditor));
  const descriptionParam = new ethereum.EventParam("description", toEthString(CLAIM_DESCRIPTION));

  //@ts-ignore
  const hash: Bytes = changetype<Bytes>(Bytes.fromHexString(includeIPFSHash ? MULTIHASH_BYTES : EMPTY_BYTES32));
  const multihashArray: Array<ethereum.Value> = [
    ethereum.Value.fromBytes(hash), // hash
    toUint256(BigInt.fromU32(includeIPFSHash ? MULTIHASH_FUNCTION : 0)), // hashFunction
    toUint256(BigInt.fromU32(includeIPFSHash ? MULTIHASH_SIZE : 0)) // size
  ];
  //@ts-ignore
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

  //@ts-ignore
  const claimTuple: ethereum.Tuple = changetype<ethereum.Tuple>(claimArray);
  const claimParam = new ethereum.EventParam("claim", ethereum.Value.fromTuple(claimTuple));
  const timestampParam = new ethereum.EventParam("timestamp", toUint256(DEFAULT_TIMESTAMP));

  event.parameters = [
    bullaManagerParam,
    tokenidParam,
    parentParam,
    creditorParam,
    debtorParam,
    originParam,
    descriptionParam,
    claimParam,
    timestampParam
  ];

  return event;
};

export const newBullaManagerSetEvent = (prevBullaManager: Address, newBullaManager: Address): BullaManagerSet => {
  //@ts-ignore
  const event: BullaManagerSet = changetype<BullaManagerSet>(newMockEvent());
  const prevManagerParam = new ethereum.EventParam("prevManager", toEthAddress(prevBullaManager));
  const newManagerParam = new ethereum.EventParam("newManager", toEthAddress(newBullaManager));
  const timestampParam = new ethereum.EventParam("timestamp", toUint256(DEFAULT_TIMESTAMP));
  event.parameters = [prevManagerParam, newManagerParam, timestampParam];

  return event;
};

export const newBullaBankerCreatedEvent = (bullaManager: Address, bullaClaimERC721: Address, bullaBanker: Address): BullaBankerCreated => {
  //@ts-ignore
  const event: BullaBankerCreated = changetype<BullaBankerCreated>(newMockEvent());
  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(bullaManager));
  const bullaClaimERC721Param = new ethereum.EventParam("bullaClaimERC721", toEthAddress(bullaClaimERC721));
  const bullaBankerParam = new ethereum.EventParam("bullaBanker", toEthAddress(bullaBanker));
  const timestampParam = new ethereum.EventParam("timestamp", toUint256(DEFAULT_TIMESTAMP));
  event.parameters = [bullaManagerParam, bullaClaimERC721Param, bullaBankerParam, timestampParam];

  return event;
};
