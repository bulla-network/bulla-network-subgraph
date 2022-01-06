import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { test, assert, newMockEvent, createMockedFunction, logStore } from "matchstick-as/assembly/index";
import { ClaimCreated } from "../generated/BullaClaimERC721/BullaClaimERC721";
import { ADDRESS_ZERO as addressZeroString, EMPTY_BYTES32 } from "../src/functions/common";
// import { newClaimCreatedEvent } from "./helpers";
import { handleClaimCreated } from "../src/mappings/BullaClaimERC721";
import { toEthAddress, toEthString, toUint256 } from "./helpers";
// import { createNewClaim } from "./helpers";

/** tests mapping */
const TX_HASH = "0x39d02b6c00bca9eecbaa7363d61f1ac1c096e2a71600af3c30108103ee846018";
//@ts-ignore
const TX_HASH_BYTES: Bytes = changetype<Bytes>(Bytes.fromHexString(TX_HASH));
const CLAIM_DESCRIPTION = "testing 1234";
const CLAIM_AMOUNT = "1000000000000000000";
const MOCK_WETH_ADDRESS = Address.fromString("0xc778417e063141139fce010982780140aa0cd5ab");
const MOCK_MANAGER_ADDRESS = Address.fromString("0xd33abDe96F344FDe00B65650c8f68875D4c9e18B");
const ADDRESS_ZERO = Address.fromString(addressZeroString);
const ADDRESS_1 = Address.fromString("0xb8c18E036d46c5FB94d7DeBaAeD92aFabe65EE61");
const ADDRESS_2 = Address.fromString("0xe2B28b58cc5d34872794E861fd1ba1982122B907");

const setupTests = (): void => {
  /** setup ERC20 token */
  createMockedFunction(MOCK_WETH_ADDRESS, "decimals", "decimals():(uint8)").returns([ethereum.Value.fromI32(18)]);
  createMockedFunction(MOCK_WETH_ADDRESS, "symbol", "symbol():(string)").returns([ethereum.Value.fromString("WETH")]);
};

export const newClaimCreatedEvent = (): ClaimCreated => {
  //@ts-ignore
  const event: ClaimCreated = changetype<ClaimCreated>(newMockEvent());

  const tokenidParam = new ethereum.EventParam("tokenId", toUint256(BigInt.fromI32(1)));
  const bullaManagerParam = new ethereum.EventParam("bullaManager", toEthAddress(MOCK_MANAGER_ADDRESS));
  const parentParam = new ethereum.EventParam("parent", toEthAddress(ADDRESS_ZERO));
  const creatorParam = new ethereum.EventParam("creditor", toEthAddress(ADDRESS_2));
  const debtorParam = new ethereum.EventParam("debtor", toEthAddress(ADDRESS_1));
  const originParam = new ethereum.EventParam("origin", toEthAddress(ADDRESS_1));
  const descriptionParam = new ethereum.EventParam("description", toEthString(CLAIM_DESCRIPTION));

  //@ts-ignore
  const hash: Bytes = changetype<Bytes>(Bytes.fromHexString(EMPTY_BYTES32));
  const multihashArray: Array<ethereum.Value> = [
    ethereum.Value.fromBytes(hash), // hash
    toUint256(BigInt.fromI32(0)), // hashFunction
    toUint256(BigInt.fromI32(0)) // size
  ];
  //@ts-ignore
  const multihashTuple: ethereum.Tuple = changetype<ethereum.Tuple>(multihashArray);

  const claimArray: Array<ethereum.Value> = [
    toUint256(BigInt.fromString(CLAIM_AMOUNT)), // claimAmount: 1 ether
    toUint256(BigInt.fromString("0")), // paidAmount
    toUint256(BigInt.fromString("0")), // status: pending
    toUint256(BigInt.fromU64(1641337179)), // dueBy
    toEthAddress(ADDRESS_1), // debtor
    toEthAddress(MOCK_WETH_ADDRESS), // claimToken
    ethereum.Value.fromTuple(multihashTuple) // multihash
  ];

  //@ts-ignore
  const claimTuple: ethereum.Tuple = changetype<ethereum.Tuple>(claimArray);
  const claimParam = new ethereum.EventParam("claim", ethereum.Value.fromTuple(claimTuple));
  const timestampParam = new ethereum.EventParam("timestamp", toUint256(BigInt.fromU64(1638568465)));

  event.parameters = [
    bullaManagerParam,
    tokenidParam,
    parentParam,
    creatorParam,
    debtorParam,
    originParam,
    descriptionParam,
    claimParam,
    timestampParam
  ];

  return event;
};

test("should handle create claim events", () => {
  setupTests();

  const event = newClaimCreatedEvent();
  event.transaction.hash = TX_HASH_BYTES;

  handleClaimCreated(event);

  const tokenId = "1";
  const ev = event.params;

  /** assert token */
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "address", ev.claim.claimToken.toHexString());
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "symbol", "WETH");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "decimals", "18");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "isNative", "false");
  assert.fieldEquals("Token", MOCK_WETH_ADDRESS.toHexString(), "network", "mainnet");

  /** assert ClaimCreatedEvent */
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "tokenId", tokenId);
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "bullaManager", ev.bullaManager.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "parent", ev.parent.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "creator", ev.origin.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "creditor", ev.creditor.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "claimToken", ev.claim.claimToken.toHexString());
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "description", ev.description);
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "ipfsHash", "null");
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "amount", ev.claim.claimAmount.toString());
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "dueBy", ev.claim.dueBy.toString());
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "eventName", "ClaimCreated");
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "blockNumber", event.block.number.toString());
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "transactionHash", event.transaction.hash.toHex());
  assert.fieldEquals("ClaimCreatedEvent", TX_HASH, "timestamp", "1");

  /** assert Users */
  // TODO: handle lists?
  // assert.fieldEquals("User", ADDRESS_1.toHexString(), "claims", ADDRESS_1.toHexString());
  assert.fieldEquals("User", ADDRESS_1.toHexString(), "address", ADDRESS_1.toHexString());
  assert.fieldEquals("User", ADDRESS_2.toHexString(), "address", ADDRESS_2.toHexString());

  /** assert claim */
  assert.fieldEquals("Claim", tokenId, "id", tokenId);
  assert.fieldEquals("Claim", tokenId, "tokenId", "1");

  // ipfsHash: String
  // creator: Bytes! # address
  // creditor: Bytes! # address
  // debtor: Bytes! # address
  // amount: BigInt!
  // paidAmount: BigInt!
  // isTransferred: Boolean!
  // description: String!
  // created: BigInt!
  // dueBy: BigInt!
  // claimType: ClaimType!
  // token: Token!
  // status: ClaimStatus!
  // transactionHash: Bytes!

  /**it...
   * should create a claim entity with the correct params
   * should parse the IPFS hash
   */
  // logStore();
  // TX_HASH will be the ID of the claim
});

// test("should update claim on payment", () => {
//   const tokenId = "1";
//   const claim = createNewClaim(tokenId);
//   claim.save();

//   // const paymentEvent = newClaimPaymentEvent(tokenId,...params);
//   // handleClaimPayment(paymentEvent);
//   // assert.equal(claim.status, "PAID");

// });

export { handleClaimCreated };
