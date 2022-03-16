import { Address, BigInt, ByteArray, Bytes, crypto, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { InstantPayment, InstantPaymentTagUpdated } from "../../generated/BullaInstantPayment/BullaInstantPayment";
import {
  ADDRESS_1, ADDRESS_2, DEFAULT_ACCOUNT_TAG, INSTAPAY_DESCRIPTION,
  IPFS_HASH, MOCK_BULLA_TOKEN_ADDRESS, MOCK_INSTANT_PAYMENT_ADDRESS, ONE_ETH, toEthAddress, toEthString, toUint256
} from "../helpers";

export const newInstantPaymentEvent = (token: Address = MOCK_BULLA_TOKEN_ADDRESS): InstantPayment => {
  const event: InstantPayment = changetype<InstantPayment>(newMockEvent());
  event.address = MOCK_INSTANT_PAYMENT_ADDRESS;

  const fromParam = new ethereum.EventParam("from", toEthAddress(ADDRESS_1));
  const toParam = new ethereum.EventParam("to", toEthAddress(ADDRESS_2));
  const amountParam = new ethereum.EventParam("amount", toUint256(BigInt.fromString(ONE_ETH)));
  const tokenAddressParam = new ethereum.EventParam("token", toEthAddress(token));
  const descriptionParam = new ethereum.EventParam("description", toEthString(INSTAPAY_DESCRIPTION));
  const tagParam = new ethereum.EventParam("tag", toEthString(DEFAULT_ACCOUNT_TAG));
  const ipfsHashParam = new ethereum.EventParam("ipfsHash", toEthString(IPFS_HASH));

  event.parameters = [fromParam, toParam, amountParam, tokenAddressParam, descriptionParam, tagParam, ipfsHashParam];

  return event;
};

export const newInstantPaymentTagUpdatedEvent = (txAndLogIndexHash: Bytes, tag: string): InstantPaymentTagUpdated => {
  const event: InstantPaymentTagUpdated = changetype<InstantPaymentTagUpdated>(newMockEvent());
  event.address = MOCK_INSTANT_PAYMENT_ADDRESS;

  const txAndLogIndexHashParam = new ethereum.EventParam("txAndLogIndexHash", ethereum.Value.fromBytes(txAndLogIndexHash));
  const updatedByParam = new ethereum.EventParam("updatedBy", toEthAddress(ADDRESS_1));
  const tagParam = new ethereum.EventParam("tag", toEthString(tag));
  const blocktimeParam = new ethereum.EventParam("blocktime", toUint256(event.block.timestamp));
  
  event.parameters = [txAndLogIndexHashParam, updatedByParam, tagParam, blocktimeParam];
  event.transaction.hash = Bytes.fromByteArray(crypto.keccak256(ByteArray.fromUTF8("fake new hash")));

  return event;
};
