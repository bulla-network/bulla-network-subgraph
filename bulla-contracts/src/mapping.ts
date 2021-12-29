import { Address, BigInt, dataSource, ethereum } from "@graphprotocol/graph-ts";
import {
  BullaClaimERC721,
  Approval,
  ApprovalForAll,
  BullaManagerSet,
  ClaimCreated,
  ClaimPayment,
  ClaimRejected,
  ClaimRescinded,
  FeePaid,
  OwnershipTransferred,
  Transfer,
} from "../generated/BullaClaimERC721/BullaClaimERC721";
import { ERC20 } from "../generated/BullaClaimERC721/ERC20";
import { Claim, ClaimCreatedEvent, Token } from "../generated/schema";

export function handleBullaManagerSet(event: BullaManagerSet): void {}

export function handleClaimCreated(event: ClaimCreated): void {
  const {
    blocktime,
    bullaManager,
    claim: { attachment, claimAmount, claimToken, debtor, dueBy, paidAmount },
    creditor,
    description,
    origin,
    parent,
    tokenId,
  } = event.params;

  const token = new Token(claimToken.toHexString());
  const TokenContract = ERC20.bind(claimToken);
  token.address = claimToken;
  token.decimals = TokenContract.decimals();
  token.symbol = TokenContract.symbol();
  token.isNative = claimToken.equals(Address.zero());
  token.save();

  const claimCreatedEvent = new ClaimCreatedEvent(
    event.transaction.hash.toHex()
  );
  claimCreatedEvent.blockNumber = event.block.number;
  claimCreatedEvent.timestamp = blocktime;
  claimCreatedEvent.amount = claimAmount;
  claimCreatedEvent.token = token;
  claimCreatedEvent.description = description;
  claimCreatedEvent.eventName = event.logType!;
  claimCreatedEvent.tokenId = tokenId.toString();
  claimCreatedEvent.parent = parent;
  claimCreatedEvent.creator = origin;
  claimCreatedEvent.debtor = debtor;
  claimCreatedEvent.creditor = creditor;
  claimCreatedEvent.bullaManager = bullaManager;
  claimCreatedEvent.dueBy = dueBy;
  claimCreatedEvent.save();

  const claim = new Claim(event.params.tokenId.toString());
  claim.amount = claimAmount;
  claim.paidAmount = paidAmount;
  claim.description = description;
  claim.created = event.block.timestamp;
  claim.dueBy = dueBy;
  claim.creator = origin;
  claim.creditor = creditor;
  claim.debtor = debtor;
  claim.token = token;
  claim.claimType = origin.equals(creditor) ? "INVOICE" : "PAYMENT";
  claim.status = "PENDING";
  claim.transactionHash = event.transaction.hash;
}

export function handleClaimPayment(event: ClaimPayment): void {}

export function handleClaimRejected(event: ClaimRejected): void {}

export function handleClaimRescinded(event: ClaimRescinded): void {}

export function handleFeePaid(event: FeePaid): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTransfer(event: Transfer): void {}
