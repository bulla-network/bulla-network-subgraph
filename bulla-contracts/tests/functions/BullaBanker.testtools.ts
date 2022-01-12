import { Address, Bytes, ByteArray, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { BullaBankerCreated, BullaTagUpdated } from "../../generated/BullaBanker/BullaBanker";
import { toEthAddress, MOCK_MANAGER_ADDRESS, toUint256, DEFAULT_TIMESTAMP } from "../helpers";

export const newBullaTagUpdatedEvent = (tokenId: BigInt, updatedBy: Address, _tag: string): BullaTagUpdated => {
  const tag: Bytes = Bytes.fromByteArray(ByteArray.fromUTF8(_tag));
  const event: BullaTagUpdated = changetype<BullaTagUpdated>(newMockEvent());
  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const tokenIdParam = new ethereum.EventParam("tokenId", toUint256(tokenId));
  const updatedByParam = new ethereum.EventParam("updatedBy", toEthAddress(updatedBy));
  const tagParam = new ethereum.EventParam("tag", ethereum.Value.fromBytes(tag));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(DEFAULT_TIMESTAMP.plus(BigInt.fromU32(1500))));
  event.parameters = [bullaManagerParam, tokenIdParam, updatedByParam, tagParam, blocktimeParam];

  return event;
};

export const newBullaBankerCreatedEvent = (bullaManager: Address, bullaClaimERC721: Address, bullaBanker: Address): BullaBankerCreated => {
  const event: BullaBankerCreated = changetype<BullaBankerCreated>(newMockEvent());
  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(bullaManager));
  const bullaClaimERC721Param = new ethereum.EventParam("bullaClaimERC721", toEthAddress(bullaClaimERC721));
  const bullaBankerParam = new ethereum.EventParam("bullaBanker", toEthAddress(bullaBanker));
  const timestampParam = new ethereum.EventParam("timestamp", toUint256(DEFAULT_TIMESTAMP));
  event.parameters = [bullaManagerParam, bullaClaimERC721Param, bullaBankerParam, timestampParam];

  return event;
};
