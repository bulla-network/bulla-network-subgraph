import { Address, ethereum, BigInt } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { InstantPayment } from "../../generated/BullaInstantPayment/BullaInstaPay";
import {
  ADDRESS_1,
  toEthAddress,
  toUint256,
  MOCK_INSTANT_PAYMENT_ADDRESS,
  ADDRESS_2,
  ONE_ETH,
  MOCK_BULLA_TOKEN_ADDRESS,
  toEthString,
  INSTAPAY_DESCRIPTION,
  INSTAPAY_TAGS,
  IPFS_HASH
} from "../helpers";

export const newInstantPayEvent = (token: Address = MOCK_BULLA_TOKEN_ADDRESS): InstantPayment => {
  const event: InstantPayment = changetype<InstantPayment>(newMockEvent());
  event.address = MOCK_INSTANT_PAYMENT_ADDRESS;

  const fromParam = new ethereum.EventParam("from", toEthAddress(ADDRESS_1));
  const toParam = new ethereum.EventParam("to", toEthAddress(ADDRESS_2));
  const amountParam = new ethereum.EventParam("amount", toUint256(BigInt.fromString(ONE_ETH)));
  const tokenAddressParam = new ethereum.EventParam("token", toEthAddress(token));
  const descriptionParam = new ethereum.EventParam("description", toEthString(INSTAPAY_DESCRIPTION));
  const tagsParam = new ethereum.EventParam("tags", ethereum.Value.fromStringArray(INSTAPAY_TAGS));
  const ipfsHashParam = new ethereum.EventParam("ipfsHash", toEthString(IPFS_HASH));

  event.parameters = [fromParam, toParam, amountParam, tokenAddressParam, descriptionParam, tagsParam, ipfsHashParam];

  return event;
};
