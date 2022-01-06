// import { Address, BigInt, ByteArray, Bytes, ethereum } from "@graphprotocol/graph-ts";
// import { newMockEvent } from "matchstick-as/assembly/index";
// import { ClaimCreated, ClaimCreatedClaimStruct } from "../generated/BullaClaimERC721/BullaClaimERC721";
// import { ADDRESS_ZERO as addressZeroString, EMPTY_BYTES32, getIPFSHash } from "../src/functions/common";

import { Address, ethereum, BigInt } from "@graphprotocol/graph-ts";

// import { Claim } from "../generated/schema";
// import { getOrCreateToken } from "../src/functions/common";
// import { getOrCreateClaim } from "../src/functions/BullaClaimERC721";

// const TX_HASH = "0x39d02b6c00bca9eecbaa7363d61f1ac1c096e2a71600af3c30108103ee846018";
// const CLAIM_DESCRIPTION = "testing 1234";
// const ADDRESS_ZERO = Address.fromString(addressZeroString);
// const ADDRESS_1 = Address.fromString("0xb8c18E036d46c5FB94d7DeBaAeD92aFabe65EE61");
// const ADDRESS_2 = Address.fromString("0xe2B28b58cc5d34872794E861fd1ba1982122B907");

// export const createNewClaim = (tokenId: string): Claim => {
//   const token = getOrCreateToken(ADDRESS_ZERO);
//   const ipfsHash = "";

//   const claim = getOrCreateClaim(tokenId);
//   claim.tokenId = tokenId;
//   claim.ipfsHash = ipfsHash;
//   claim.creator = ADDRESS_1;
//   claim.creditor = ADDRESS_1;
//   claim.debtor = ADDRESS_2;
//   claim.amount = BigInt.fromString("1000000000000000");
//   claim.paidAmount = BigInt.zero();
//   claim.isTransferred = false;
//   claim.description = CLAIM_DESCRIPTION;
//   claim.created = BigInt.fromString("1638568465");
//   claim.dueBy = BigInt.fromString("1638569465");
//   claim.claimType = "INVOICE";
//   claim.token = token.id;
//   claim.status = "PENDING";
//   claim.transactionHash = Bytes.fromHexString(TX_HASH);

//   return claim;
// };

// export const newClaimCreatedEvent = (id: string): ClaimCreated => {
//   //@ts-ignore
//   const event: ClaimCreated = changetype<ClaimCreated>(newMockEvent());
//   event.parameters = new Array();
//   let idParam = new ethereum.EventParam("id", ethereum.Value.fromString(id));
//   let bullaManagerParam = new ethereum.EventParam("bullaManager", ethereum.Value.fromAddress(ADDRESS_ZERO));
//   let parentParam = new ethereum.EventParam("parent", ethereum.Value.fromAddress(ADDRESS_ZERO));
//   let creatorParam = new ethereum.EventParam("creditor", ethereum.Value.fromAddress(ADDRESS_2));
//   let debtorParam = new ethereum.EventParam("debtor", ethereum.Value.fromAddress(ADDRESS_1));
//   let originParam = new ethereum.EventParam("origin", ethereum.Value.fromAddress(ADDRESS_1));
//   let descriptionParam = new ethereum.EventParam("description", ethereum.Value.fromString("test"));
//   let claimParam = new ethereum.EventParam(
//     "claim",
//     ethereum.Value.fromTuple(
//       ethereum.Tuple.from([
//         ethereum.Value.fromString("0xde0b6b3a7640001"), // amount: 1 ether
//         ethereum.Value.fromString("0x0"), // paidAmount
//         ethereum.Value.fromString("0x0"), // status: pending
//         ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(1641337179)), // dueBy
//         ethereum.Value.fromAddress(ADDRESS_1), // debtor
//         ethereum.Value.fromAddress(ADDRESS_ZERO), // claimToken
//         ethereum.Value.fromTuple(
//           ethereum.Tuple.from([
//             ethereum.Value.fromString(EMPTY_BYTES32), // hash
//             ethereum.Value.fromString("0x0"), // hashFunction
//             ethereum.Value.fromString("0x0") // size
//           ])
//         )
//       ])
//     )
//   );

//   let eventNameParam = new ethereum.EventParam("eventName", ethereum.Value.fromString("ClaimCreated"));
//   let blockNumberParam = new ethereum.EventParam("blockNumber", ethereum.Value.fromI32(1_000_000));
//   let transactionHashParam = new ethereum.EventParam("transactionHash", ethereum.Value.fromString(TX_HASH));
//   let timestampParam = new ethereum.EventParam("timestamp", ethereum.Value.fromString("0x61aa9211"));

//   event.parameters.push(idParam);
//   event.parameters.push(bullaManagerParam);
//   event.parameters.push(parentParam);
//   event.parameters.push(creatorParam);
//   event.parameters.push(debtorParam);
//   event.parameters.push(originParam);
//   event.parameters.push(descriptionParam);
//   event.parameters.push(claimParam);
//   event.parameters.push(eventNameParam);
//   event.parameters.push(blockNumberParam);
//   event.parameters.push(transactionHashParam);
//   event.parameters.push(timestampParam);

//   return event;
// };

// // // export const createNewClaim = (
// // //   id: string,
// // //   creditor: Bytes,
// // //   debtor: Bytes,
// // //   amount: BigInt,
// // //   description: string
// // // ): Claim => {
// // //   let claim = new Claim(id);
// // //   claim.tokenId = id;
// // //   claim.ipfsHash = null;
// // //   claim.creator = creditor;
// // //   claim.creditor = creditor;
// // //   claim.debtor = debtor;
// // //   claim.amount = amount;
// // //   claim.paidAmount = new BigInt(0);
// // //   claim.isTransferred = false;
// // //   claim.description = description;
// // //   claim.created = new BigInt(Date.now() / 1000);
// // //   claim.dueBy = new BigInt(Date.now() / 1000 + 1000);
// // //   claim.claimType = "INVOICE";
// // //   claim.token = ADDRESS_ZERO;
// // //   claim.status = "PENDING";
// // //   claim.transactionHash = new Bytes(
// // //     0x39d02b6c00bca9eecbaa7363d61f1ac1c096e2a71600af3c30108103ee846018
// // //   );
// // //   claim.save();
// // //   return claim;
// // // };

export const toEthString = (value: string): ethereum.Value => ethereum.Value.fromString(value);

export const toEthAddress = (value: Address): ethereum.Value => ethereum.Value.fromAddress(value);

export const toUint256 = (value: BigInt): ethereum.Value => ethereum.Value.fromUnsignedBigInt(value);
