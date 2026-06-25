import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { User } from "../generated/schema";
import { CLAIM_TYPE_INVOICE } from "../src/functions/common";
import {
  getFeeWithdrawnEventId,
  getLoanOfferAcceptedEventId,
  getLoanOfferedEventId,
  getLoanOfferRejectedEventId,
  getLoanPaymentEventId,
} from "../src/functions/FrendLend";
import { handleClaimCreatedV2 } from "../src/mappings/BullaClaimERC721";
import {
  handleBullaTagUpdated,
  handleFeeWithdrawn,
  handleLoanOfferAccepted,
  handleLoanOfferAcceptedV2,
  handleLoanOffered,
  handleLoanOfferedV2,
  handleLoanOfferRejected,
  handleLoanOfferRejectedV2,
  handleLoanPayment,
} from "../src/mappings/FrendLend";
import { handleClaimCreatedV1 } from "./BullaFinance.test";
import { newClaimCreatedEventV1, newClaimCreatedEventV2 } from "./functions/BullaClaimERC721.testtools";
import {
  newBullaTagUpdatedEvent,
  newFeeWithdrawnEvent,
  newLoanOfferAcceptedEvent,
  newLoanOfferAcceptedEventV2,
  newLoanOfferedEvent,
  newLoanOfferedEventV2,
  newLoanOfferRejectedEvent,
  newLoanOfferRejectedEventV2,
  newLoanPaymentEvent,
} from "./functions/FrendLend.testtools";
import { ADDRESS_1, ADDRESS_2, ADDRESS_3, afterEach, DEFAULT_ACCOUNT_TAG, IPFS_HASH, MOCK_WETH_ADDRESS, ONE_ETH, setupContracts } from "./helpers";

test("it handles LoanOffered events", () => {
  setupContracts();

  const loanId = BigInt.fromI32(1);
  const interestBPS = BigInt.fromI32(875);
  const termLength = BigInt.fromI32(30 * 24 * 60 * 60); // 30 days
  const loanAmount = BigInt.fromString(ONE_ETH);
  const creditor = ADDRESS_1;
  const debtor = ADDRESS_2;
  const description = "Test Loan Offered Event";
  const claimToken = MOCK_WETH_ADDRESS;

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const loanOfferedEvent = newLoanOfferedEvent(loanId, interestBPS, termLength, loanAmount, creditor, debtor, description, claimToken);
  loanOfferedEvent.block.timestamp = timestamp;
  loanOfferedEvent.block.number = blockNum;

  handleLoanOffered(loanOfferedEvent);

  const loanOfferedEventId = getLoanOfferedEventId(loanId, "v1");

  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "loanId", loanOfferedEvent.params.loanId.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "version", "V1");
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "offeredBy", loanOfferedEvent.params.offeredBy.toHexString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "interestBPS", loanOfferedEvent.params.loanOffer.interestBPS.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "numberOfPeriodsPerYear", "0"); // V1 defaults to 0
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "termLength", loanOfferedEvent.params.loanOffer.termLength.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "loanAmount", loanOfferedEvent.params.loanOffer.loanAmount.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "creditor", loanOfferedEvent.params.loanOffer.creditor.toHexString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "debtor", loanOfferedEvent.params.loanOffer.debtor.toHexString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "description", loanOfferedEvent.params.loanOffer.description);
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "claimToken", loanOfferedEvent.params.loanOffer.claimToken.toHexString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "ipfsHash", IPFS_HASH);
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "eventName", "LoanOffered");
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "blockNumber", loanOfferedEvent.block.number.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "transactionHash", loanOfferedEvent.transaction.hash.toHexString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "timestamp", loanOfferedEvent.block.timestamp.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "logIndex", loanOfferedEvent.logIndex.toString());
  log.info("✅ should create a LoanOffered event", []);

  // Denormalized LoanOffer (claim-independent, pending offer)
  assert.fieldEquals("LoanOffer", "1-v1", "loanId", "1");
  assert.fieldEquals("LoanOffer", "1-v1", "version", "V1");
  assert.fieldEquals("LoanOffer", "1-v1", "status", "Offered");
  assert.fieldEquals("LoanOffer", "1-v1", "offeredBy", creditor.toHexString());
  assert.fieldEquals("LoanOffer", "1-v1", "creditor", creditor.toHexString());
  assert.fieldEquals("LoanOffer", "1-v1", "debtor", debtor.toHexString());
  assert.fieldEquals("LoanOffer", "1-v1", "loanAmount", loanAmount.toString());
  assert.fieldEquals("LoanOffer", "1-v1", "token", MOCK_WETH_ADDRESS.toHexString());
  assert.fieldEquals("LoanOffer", "1-v1", "interestBPS", interestBPS.toString());
  assert.fieldEquals("LoanOffer", "1-v1", "termLength", termLength.toString());
  assert.fieldEquals("LoanOffer", "1-v1", "description", description);
  assert.fieldEquals("LoanOffer", "1-v1", "ipfsHash", IPFS_HASH);
  assert.fieldEquals("LoanOffer", "1-v1", "offerDate", timestamp.toString());
  assert.fieldEquals("LoanOffer", "1-v1", "offerTxHash", loanOfferedEvent.transaction.hash.toHexString());
  log.info("✅ should denormalize a pending LoanOffer", []);

  afterEach();
});

test("it handles LoanOfferAccepted events", () => {
  setupContracts();

  const loanId = BigInt.fromI32(1);
  const interestBPS = BigInt.fromI32(875);
  const termLength = BigInt.fromI32(30 * 24 * 60 * 60); // 30 days
  const loanAmount = BigInt.fromString(ONE_ETH);
  const creditor = ADDRESS_1;
  const debtor = ADDRESS_2;
  const description = "Test Loan Offered Event";
  const claimToken = MOCK_WETH_ADDRESS;

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const loanOfferedEvent = newLoanOfferedEvent(loanId, interestBPS, termLength, loanAmount, creditor, debtor, description, claimToken);
  loanOfferedEvent.block.timestamp = timestamp;
  loanOfferedEvent.block.number = blockNum;

  handleLoanOffered(loanOfferedEvent);

  const claimId = BigInt.fromI32(1);

  const loanOfferAcceptedEvent = newLoanOfferAcceptedEvent(loanId, claimId);
  loanOfferAcceptedEvent.block.timestamp = timestamp;
  loanOfferAcceptedEvent.block.number = blockNum;
  const claimCreatedEvent = newClaimCreatedEventV1(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;
  const bullaTagUpdatedEvent = newBullaTagUpdatedEvent(claimId, ADDRESS_1, DEFAULT_ACCOUNT_TAG);
  bullaTagUpdatedEvent.block.timestamp = timestamp;
  bullaTagUpdatedEvent.block.number = blockNum;

  handleClaimCreatedV1(claimCreatedEvent);
  handleBullaTagUpdated(bullaTagUpdatedEvent);
  handleLoanOfferAccepted(loanOfferAcceptedEvent);
  const loanOfferAcceptedEventId = getLoanOfferAcceptedEventId(loanId, claimId, loanOfferAcceptedEvent);

  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "loanId", loanOfferAcceptedEvent.params.loanId.toString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "version", "V1");
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "claimId", loanOfferAcceptedEvent.params.claimId.toString() + "-v1");
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "eventName", "LoanOfferAccepted");
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "blockNumber", loanOfferAcceptedEvent.block.number.toString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "transactionHash", loanOfferAcceptedEvent.transaction.hash.toHexString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "timestamp", loanOfferAcceptedEvent.block.timestamp.toString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "logIndex", loanOfferAcceptedEvent.logIndex.toString());

  // Denormalized ClaimFinancing on the accepted v1 loan claim ("1-v1").
  // Original terms are read through the loanOffer link, not duplicated here.
  assert.fieldEquals("Claim", claimId.toString() + "-v1", "financing", claimId.toString() + "-v1");
  // v1 frendlend bakes a 1-wei sentinel into amount/paidAmount; net strips it (claim amount=1e18, paid=0)
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v1", "netAmount", "999999999999999999");
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v1", "netPaidAmount", "0");

  // Denormalized LoanOffer flipped to Accepted, linked to the minted claim
  assert.fieldEquals("LoanOffer", "1-v1", "status", "Accepted");
  assert.fieldEquals("LoanOffer", "1-v1", "claim", claimId.toString() + "-v1");
  assert.fieldEquals("LoanOffer", "1-v1", "claimId", claimId.toString() + "-v1");
  assert.fieldEquals("LoanOffer", "1-v1", "tokenId", claimId.toString());
  assert.fieldEquals("LoanOffer", "1-v1", "processingFee", "0");
  assert.fieldEquals("LoanOffer", "1-v1", "acceptedDate", timestamp.toString());
  assert.fieldEquals("LoanOffer", "1-v1", "acceptedTxHash", loanOfferAcceptedEvent.transaction.hash.toHexString());
  // ClaimFinancing carries the reverse link used by handleLoanPayment to fold aggregates
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v1", "loanOffer", "1-v1");
  log.info("✅ should create a LoanOfferAccepted event", []);

  afterEach();
});

test("it handles LoanOfferRejected events", () => {
  setupContracts();

  const loanId = BigInt.fromI32(1);
  const interestBPS = BigInt.fromI32(875);
  const termLength = BigInt.fromI32(30 * 24 * 60 * 60); // 30 days
  const loanAmount = BigInt.fromString(ONE_ETH);
  const creditor = ADDRESS_1;
  const debtor = ADDRESS_2;
  const description = "Test Loan Offered Event";
  const claimToken = MOCK_WETH_ADDRESS;

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const loanOfferedEvent = newLoanOfferedEvent(loanId, interestBPS, termLength, loanAmount, creditor, debtor, description, claimToken);
  loanOfferedEvent.block.timestamp = timestamp;
  loanOfferedEvent.block.number = blockNum;

  handleLoanOffered(loanOfferedEvent);

  const loanOfferRejectedEvent = newLoanOfferRejectedEvent(loanId, ADDRESS_3);
  loanOfferRejectedEvent.block.timestamp = timestamp.plus(BigInt.fromI32(1));
  loanOfferRejectedEvent.block.number = blockNum.plus(BigInt.fromI32(1));

  const loanOfferRejectedEventId = getLoanOfferRejectedEventId(loanId, loanOfferRejectedEvent);

  handleLoanOfferRejected(loanOfferRejectedEvent);

  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "loanId", loanOfferRejectedEvent.params.loanId.toString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "version", "V1");
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "rejectedBy", loanOfferRejectedEvent.params.rejectedBy.toHexString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "eventName", "LoanOfferRejected");
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "blockNumber", loanOfferRejectedEvent.block.number.toString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "transactionHash", loanOfferRejectedEvent.transaction.hash.toHexString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "timestamp", loanOfferRejectedEvent.block.timestamp.toString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "logIndex", loanOfferRejectedEvent.logIndex.toString());

  // Denormalized LoanOffer flipped to Rejected
  assert.fieldEquals("LoanOffer", "1-v1", "status", "Rejected");
  assert.fieldEquals("LoanOffer", "1-v1", "rejectedBy", ADDRESS_3.toHexString());
  assert.fieldEquals("LoanOffer", "1-v1", "rejectedDate", loanOfferRejectedEvent.block.timestamp.toString());
  assert.fieldEquals("LoanOffer", "1-v1", "rejectedTxHash", loanOfferRejectedEvent.transaction.hash.toHexString());
  log.info("✅ should create a LoanOfferRejected event", []);

  afterEach();
});

test("it handles FrendLendV2 events", () => {
  setupContracts();

  const offerId = BigInt.fromI32(2);
  const interestRateBps = BigInt.fromI32(1000); // 10%
  const termLength = BigInt.fromI32(60 * 24 * 60 * 60); // 60 days
  const loanAmount = BigInt.fromString(ONE_ETH);
  const creditor = ADDRESS_1;
  const debtor = ADDRESS_2;
  const description = "Test Loan Offered V2 Event";
  const token = MOCK_WETH_ADDRESS;
  const impairmentGracePeriod = BigInt.fromI32(7 * 24 * 60 * 60); // 7 days
  const expiresAt = BigInt.fromI32(1000000000); // Some future timestamp

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  // Create the loan offer
  const loanOfferedEventV2 = newLoanOfferedEventV2(
    offerId,
    interestRateBps,
    termLength,
    loanAmount,
    creditor,
    debtor,
    description,
    token,
    impairmentGracePeriod,
    expiresAt,
  );
  loanOfferedEventV2.block.timestamp = timestamp;
  loanOfferedEventV2.block.number = blockNum;

  handleLoanOfferedV2(loanOfferedEventV2);

  const loanOfferedEventId = getLoanOfferedEventId(offerId, "v2");

  // Test LoanOffered event creation
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "loanId", loanOfferedEventV2.params.offerId.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "version", "V2");
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "offeredBy", loanOfferedEventV2.params.offeredBy.toHexString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "interestBPS", loanOfferedEventV2.params.loanOffer.interestConfig.interestRateBps.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "numberOfPeriodsPerYear", "12"); // As set in test tools
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "termLength", loanOfferedEventV2.params.loanOffer.termLength.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "loanAmount", loanOfferedEventV2.params.loanOffer.loanAmount.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "creditor", loanOfferedEventV2.params.loanOffer.creditor.toHexString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "debtor", loanOfferedEventV2.params.loanOffer.debtor.toHexString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "description", loanOfferedEventV2.params.loanOffer.description);
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "claimToken", loanOfferedEventV2.params.loanOffer.token.toHexString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "tokenURI", loanOfferedEventV2.params.metadata.tokenURI);
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "attachmentURI", loanOfferedEventV2.params.metadata.attachmentURI);
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "impairmentGracePeriod", loanOfferedEventV2.params.loanOffer.impairmentGracePeriod.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "expiresAt", loanOfferedEventV2.params.loanOffer.expiresAt.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "eventName", "LoanOffered");
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "blockNumber", loanOfferedEventV2.block.number.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "transactionHash", loanOfferedEventV2.transaction.hash.toHexString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "timestamp", loanOfferedEventV2.block.timestamp.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "logIndex", loanOfferedEventV2.logIndex.toString());

  // Denormalized LoanOffer in the Offered state (v2)
  assert.fieldEquals("LoanOffer", "2-v2", "loanId", offerId.toString());
  assert.fieldEquals("LoanOffer", "2-v2", "version", "V2");
  assert.fieldEquals("LoanOffer", "2-v2", "status", "Offered");
  assert.fieldEquals("LoanOffer", "2-v2", "offeredBy", loanOfferedEventV2.params.offeredBy.toHexString());
  assert.fieldEquals("LoanOffer", "2-v2", "creditor", creditor.toHexString());
  assert.fieldEquals("LoanOffer", "2-v2", "debtor", debtor.toHexString());
  assert.fieldEquals("LoanOffer", "2-v2", "loanAmount", loanAmount.toString());
  assert.fieldEquals("LoanOffer", "2-v2", "token", token.toHexString());
  assert.fieldEquals("LoanOffer", "2-v2", "interestBPS", interestRateBps.toString());
  assert.fieldEquals("LoanOffer", "2-v2", "numberOfPeriodsPerYear", "12");
  assert.fieldEquals("LoanOffer", "2-v2", "termLength", termLength.toString());
  assert.fieldEquals("LoanOffer", "2-v2", "expiresAt", expiresAt.toString());
  assert.fieldEquals("LoanOffer", "2-v2", "description", description);
  assert.fieldEquals("LoanOffer", "2-v2", "attachmentURI", loanOfferedEventV2.params.metadata.attachmentURI);
  assert.fieldEquals("LoanOffer", "2-v2", "tokenURI", loanOfferedEventV2.params.metadata.tokenURI);
  assert.fieldEquals("LoanOffer", "2-v2", "impairmentGracePeriod", impairmentGracePeriod.toString());
  assert.fieldEquals("LoanOffer", "2-v2", "offerDate", timestamp.toString());
  assert.fieldEquals("LoanOffer", "2-v2", "offerTxHash", loanOfferedEventV2.transaction.hash.toHexString());

  // loan acceptance flow
  const claimId = BigInt.fromI32(2);
  const fee = BigInt.fromI32(50000); // 0.05 ETH fee
  const processingFee = BigInt.fromI32(10000); // 0.01 ETH processing fee

  const loanOfferAcceptedEventV2 = newLoanOfferAcceptedEventV2(offerId, claimId, debtor, fee, processingFee);
  loanOfferAcceptedEventV2.block.timestamp = timestamp;
  loanOfferAcceptedEventV2.block.number = blockNum;

  // The v2 loan claim is created on-chain by BullaClaimV2 before acceptance.
  const claimCreatedEvent = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;

  handleClaimCreatedV2(claimCreatedEvent);
  handleLoanOfferAcceptedV2(loanOfferAcceptedEventV2);

  const loanOfferAcceptedEventId = getLoanOfferAcceptedEventId(offerId, claimId, loanOfferAcceptedEventV2);

  // Test LoanOfferAccepted event creation
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "loanId", loanOfferAcceptedEventV2.params.offerId.toString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "version", "V2");
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "claimId", loanOfferAcceptedEventV2.params.claimId.toString() + "-v2");
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "receiver", loanOfferAcceptedEventV2.params.receiver.toHexString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "fee", loanOfferAcceptedEventV2.params.fee.toString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "processingFee", loanOfferAcceptedEventV2.params.processingFee.toString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "tokenURI", loanOfferAcceptedEventV2.params.metadata.tokenURI);
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "attachmentURI", loanOfferAcceptedEventV2.params.metadata.attachmentURI);
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "eventName", "LoanOfferAccepted");
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "blockNumber", loanOfferAcceptedEventV2.block.number.toString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "transactionHash", loanOfferAcceptedEventV2.transaction.hash.toHexString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "timestamp", loanOfferAcceptedEventV2.block.timestamp.toString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "logIndex", loanOfferAcceptedEventV2.logIndex.toString());

  // Denormalized ClaimFinancing on the accepted v2 loan claim ("2-v2").
  // Original terms are read through the loanOffer link, not duplicated here.
  assert.fieldEquals("Claim", claimId.toString() + "-v2", "financing", claimId.toString() + "-v2");

  // Denormalized LoanOffer flipped to Accepted, linked to the minted v2 claim
  assert.fieldEquals("LoanOffer", "2-v2", "status", "Accepted");
  assert.fieldEquals("LoanOffer", "2-v2", "claim", claimId.toString() + "-v2");
  assert.fieldEquals("LoanOffer", "2-v2", "claimId", claimId.toString() + "-v2");
  assert.fieldEquals("LoanOffer", "2-v2", "tokenId", claimId.toString());
  assert.fieldEquals("LoanOffer", "2-v2", "receiver", debtor.toHexString());
  assert.fieldEquals("LoanOffer", "2-v2", "processingFee", processingFee.toString());
  assert.fieldEquals("LoanOffer", "2-v2", "acceptedDate", timestamp.toString());
  assert.fieldEquals("LoanOffer", "2-v2", "acceptedTxHash", loanOfferAcceptedEventV2.transaction.hash.toHexString());
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v2", "loanOffer", "2-v2");

  // loan rejection flow
  const rejectionOfferId = BigInt.fromI32(3);
  const rejectionInterestRateBps = BigInt.fromI32(1200); // 12%
  const rejectionTermLength = BigInt.fromI32(45 * 24 * 60 * 60); // 45 days
  const rejectionDescription = "Test Loan Offered V2 Event for Rejection";
  const rejectionImpairmentGracePeriod = BigInt.fromI32(10 * 24 * 60 * 60); // 10 days
  const rejectionExpiresAt = BigInt.fromI32(2000000000); // Some future timestamp

  // Create another loan offer for rejection
  const rejectionLoanOfferedEventV2 = newLoanOfferedEventV2(
    rejectionOfferId,
    rejectionInterestRateBps,
    rejectionTermLength,
    loanAmount,
    creditor,
    debtor,
    rejectionDescription,
    token,
    rejectionImpairmentGracePeriod,
    rejectionExpiresAt,
  );
  rejectionLoanOfferedEventV2.block.timestamp = timestamp.plus(BigInt.fromI32(1));
  rejectionLoanOfferedEventV2.block.number = blockNum.plus(BigInt.fromI32(1));

  handleLoanOfferedV2(rejectionLoanOfferedEventV2);

  // Now test the rejection
  const loanOfferRejectedEventV2 = newLoanOfferRejectedEventV2(rejectionOfferId, ADDRESS_3);
  loanOfferRejectedEventV2.block.timestamp = timestamp.plus(BigInt.fromI32(2));
  loanOfferRejectedEventV2.block.number = blockNum.plus(BigInt.fromI32(2));

  const loanOfferRejectedEventId = getLoanOfferRejectedEventId(rejectionOfferId, loanOfferRejectedEventV2);

  handleLoanOfferRejectedV2(loanOfferRejectedEventV2);

  // Test LoanOfferRejected event creation
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "loanId", loanOfferRejectedEventV2.params.offerId.toString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "version", "V2");
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "rejectedBy", loanOfferRejectedEventV2.params.rejectedBy.toHexString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "eventName", "LoanOfferRejected");
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "blockNumber", loanOfferRejectedEventV2.block.number.toString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "transactionHash", loanOfferRejectedEventV2.transaction.hash.toHexString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "timestamp", loanOfferRejectedEventV2.block.timestamp.toString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "logIndex", loanOfferRejectedEventV2.logIndex.toString());

  // Denormalized LoanOffer flipped to Rejected (v2)
  assert.fieldEquals("LoanOffer", "3-v2", "status", "Rejected");
  assert.fieldEquals("LoanOffer", "3-v2", "rejectedBy", ADDRESS_3.toHexString());
  assert.fieldEquals("LoanOffer", "3-v2", "rejectedDate", loanOfferRejectedEventV2.block.timestamp.toString());
  assert.fieldEquals("LoanOffer", "3-v2", "rejectedTxHash", loanOfferRejectedEventV2.transaction.hash.toHexString());

  log.info("✅ should create all FrendLendV2 events", []);

  afterEach();
});

test("it handles LoanPayment events", () => {
  setupContracts();

  const claimId = BigInt.fromI32(5);
  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const claimCreatedEvent = newClaimCreatedEventV2(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;

  handleClaimCreatedV2(claimCreatedEvent);

  // Wire a v2 LoanOffer accepted onto claim 5 so handleLoanPayment can fold aggregates
  const offerId = BigInt.fromI32(5);
  const offerInterestRateBps = BigInt.fromI32(1000);
  const offerTermLength = BigInt.fromI32(60 * 24 * 60 * 60);
  const offerImpairmentGracePeriod = BigInt.fromI32(7 * 24 * 60 * 60);
  const offerExpiresAt = BigInt.fromI32(1000000000);
  const offerProcessingFee = BigInt.fromI32(10000);

  const offeredEvent = newLoanOfferedEventV2(
    offerId,
    offerInterestRateBps,
    offerTermLength,
    BigInt.fromString(ONE_ETH),
    ADDRESS_1,
    ADDRESS_2,
    "LoanPayment fold offer",
    MOCK_WETH_ADDRESS,
    offerImpairmentGracePeriod,
    offerExpiresAt,
  );
  offeredEvent.block.timestamp = timestamp;
  offeredEvent.block.number = blockNum;
  handleLoanOfferedV2(offeredEvent);

  const acceptedEvent = newLoanOfferAcceptedEventV2(offerId, claimId, ADDRESS_2, BigInt.fromI32(50000), offerProcessingFee);
  acceptedEvent.block.timestamp = timestamp;
  acceptedEvent.block.number = blockNum;
  handleLoanOfferAcceptedV2(acceptedEvent);

  // Create the loan payment event
  const grossInterestPaid = BigInt.fromString("50000000000000000"); // 0.05 ETH
  const principalPaid = BigInt.fromString("250000000000000000"); // 0.25 ETH
  const protocolFee = BigInt.fromString("5000000000000000"); // 0.005 ETH

  const loanPaymentEvent = newLoanPaymentEvent(claimId, grossInterestPaid, principalPaid, protocolFee);
  loanPaymentEvent.block.timestamp = timestamp.plus(BigInt.fromI32(1));
  loanPaymentEvent.block.number = blockNum.plus(BigInt.fromI32(1));

  handleLoanPayment(loanPaymentEvent);

  const loanPaymentEventId = getLoanPaymentEventId(claimId, loanPaymentEvent);

  // Test LoanPaymentEvent creation
  assert.fieldEquals("LoanPaymentEvent", loanPaymentEventId, "claim", claimId.toString() + "-v2");
  assert.fieldEquals("LoanPaymentEvent", loanPaymentEventId, "grossInterestPaid", grossInterestPaid.toString());
  assert.fieldEquals("LoanPaymentEvent", loanPaymentEventId, "principalPaid", principalPaid.toString());
  assert.fieldEquals("LoanPaymentEvent", loanPaymentEventId, "protocolFee", protocolFee.toString());
  assert.fieldEquals("LoanPaymentEvent", loanPaymentEventId, "eventName", "LoanPayment");
  assert.fieldEquals("LoanPaymentEvent", loanPaymentEventId, "blockNumber", loanPaymentEvent.block.number.toString());
  assert.fieldEquals("LoanPaymentEvent", loanPaymentEventId, "transactionHash", loanPaymentEvent.transaction.hash.toHexString());
  assert.fieldEquals("LoanPaymentEvent", loanPaymentEventId, "timestamp", loanPaymentEvent.block.timestamp.toString());
  assert.fieldEquals("LoanPaymentEvent", loanPaymentEventId, "logIndex", loanPaymentEvent.logIndex.toString());

  // handleLoanPayment does not update the claim principal or status since it is handled in the ClaimPayment event
  assert.fieldEquals("Claim", claimId.toString() + "-v2", "lastUpdatedBlockNumber", loanPaymentEvent.block.number.toString());
  assert.fieldEquals("Claim", claimId.toString() + "-v2", "lastUpdatedTimestamp", loanPaymentEvent.block.timestamp.toString());

  // Folded ClaimFinancing aggregates after the first payment
  assert.fieldEquals("Claim", claimId.toString() + "-v2", "financing", claimId.toString() + "-v2");
  assert.fieldEquals("Claim", claimId.toString() + "-v2", "lastPaymentDate", loanPaymentEvent.block.timestamp.toString());
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v2", "totalGrossInterestPaid", grossInterestPaid.toString());
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v2", "totalPrincipalPaid", principalPaid.toString());
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v2", "totalProtocolFee", protocolFee.toString());
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v2", "paymentCount", "1");
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v2", "lastPaymentDate", loanPaymentEvent.block.timestamp.toString());

  // Folded LoanOffer aggregates after the first payment
  assert.fieldEquals("LoanOffer", "5-v2", "grossInterestPaid", grossInterestPaid.toString());
  assert.fieldEquals("LoanOffer", "5-v2", "principalPaid", principalPaid.toString());
  assert.fieldEquals("LoanOffer", "5-v2", "protocolFee", protocolFee.toString());
  assert.fieldEquals("LoanOffer", "5-v2", "lastPaymentDate", loanPaymentEvent.block.timestamp.toString());

  // Test that creditor and debtor users have the event in their frendLendEvents arrays
  // For CLAIM_TYPE_INVOICE: creditor = ADDRESS_1, debtor = ADDRESS_2
  const creditorUserEntity = User.load(ADDRESS_1.toHexString());
  const debtorUserEntity = User.load(ADDRESS_2.toHexString());
  assert.assertNotNull(creditorUserEntity);
  assert.assertNotNull(debtorUserEntity);

  // Check that both users have the loan payment event in their frendLendEvents
  assert.assertTrue(creditorUserEntity!.frendLendEvents.includes(loanPaymentEventId));
  assert.assertTrue(debtorUserEntity!.frendLendEvents.includes(loanPaymentEventId));

  // Test full payment scenario - remaining principal from 1 ETH claim
  const remainingPrincipal = BigInt.fromString(ONE_ETH).minus(principalPaid); // 0.75 ETH remaining
  const fullPrincipalPayment = remainingPrincipal;
  const additionalInterest = BigInt.fromString("25000000000000000"); // 0.025 ETH
  const additionalProtocolFee = BigInt.fromString("2500000000000000"); // 0.0025 ETH

  const fullPaymentEvent = newLoanPaymentEvent(claimId, additionalInterest, fullPrincipalPayment, additionalProtocolFee);
  fullPaymentEvent.block.timestamp = timestamp.plus(BigInt.fromI32(2));
  fullPaymentEvent.block.number = blockNum.plus(BigInt.fromI32(2));

  handleLoanPayment(fullPaymentEvent);

  // After full payment, claim should be marked as PAID
  assert.fieldEquals("Claim", claimId.toString() + "-v2", "lastUpdatedBlockNumber", fullPaymentEvent.block.number.toString());
  assert.fieldEquals("Claim", claimId.toString() + "-v2", "lastUpdatedTimestamp", fullPaymentEvent.block.timestamp.toString());

  // ClaimFinancing aggregates accumulate across both payments
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v2", "totalGrossInterestPaid", grossInterestPaid.plus(additionalInterest).toString());
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v2", "totalPrincipalPaid", principalPaid.plus(fullPrincipalPayment).toString());
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v2", "totalProtocolFee", protocolFee.plus(additionalProtocolFee).toString());
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v2", "paymentCount", "2");
  assert.fieldEquals("ClaimFinancing", claimId.toString() + "-v2", "lastPaymentDate", fullPaymentEvent.block.timestamp.toString());
  assert.fieldEquals("Claim", claimId.toString() + "-v2", "lastPaymentDate", fullPaymentEvent.block.timestamp.toString());

  // LoanOffer aggregates accumulate across both payments
  assert.fieldEquals("LoanOffer", "5-v2", "grossInterestPaid", grossInterestPaid.plus(additionalInterest).toString());
  assert.fieldEquals("LoanOffer", "5-v2", "principalPaid", principalPaid.plus(fullPrincipalPayment).toString());
  assert.fieldEquals("LoanOffer", "5-v2", "protocolFee", protocolFee.plus(additionalProtocolFee).toString());
  assert.fieldEquals("LoanOffer", "5-v2", "lastPaymentDate", fullPaymentEvent.block.timestamp.toString());

  // Test that both users also have the second loan payment event
  const fullPaymentEventId = getLoanPaymentEventId(claimId, fullPaymentEvent);
  const updatedCreditorUserEntity = User.load(ADDRESS_1.toHexString());
  const updatedDebtorUserEntity = User.load(ADDRESS_2.toHexString());
  assert.assertNotNull(updatedCreditorUserEntity);
  assert.assertNotNull(updatedDebtorUserEntity);

  assert.assertTrue(updatedCreditorUserEntity!.frendLendEvents.includes(fullPaymentEventId));
  assert.assertTrue(updatedDebtorUserEntity!.frendLendEvents.includes(fullPaymentEventId));

  log.info("✅ should handle LoanPayment events and update claim state", []);

  afterEach();
});

test("it handles FeeWithdrawn events", () => {
  setupContracts();

  const admin = ADDRESS_1;
  const token = MOCK_WETH_ADDRESS;
  const amount = BigInt.fromString("500000000000000000"); // 0.5 ETH

  const timestamp = BigInt.fromI32(100);
  const blockNum = BigInt.fromI32(100);

  const feeWithdrawnEvent = newFeeWithdrawnEvent(admin, token, amount);
  feeWithdrawnEvent.block.timestamp = timestamp;
  feeWithdrawnEvent.block.number = blockNum;

  handleFeeWithdrawn(feeWithdrawnEvent);

  const feeWithdrawnEventId = getFeeWithdrawnEventId(feeWithdrawnEvent);

  // Test FeeWithdrawnEvent creation
  assert.fieldEquals("FeeWithdrawnEvent", feeWithdrawnEventId, "admin", feeWithdrawnEvent.params.admin.toHexString());
  assert.fieldEquals("FeeWithdrawnEvent", feeWithdrawnEventId, "token", feeWithdrawnEvent.params.token.toHexString());
  assert.fieldEquals("FeeWithdrawnEvent", feeWithdrawnEventId, "amount", feeWithdrawnEvent.params.amount.toString());
  assert.fieldEquals("FeeWithdrawnEvent", feeWithdrawnEventId, "eventName", "FeeWithdrawn");
  assert.fieldEquals("FeeWithdrawnEvent", feeWithdrawnEventId, "blockNumber", feeWithdrawnEvent.block.number.toString());
  assert.fieldEquals("FeeWithdrawnEvent", feeWithdrawnEventId, "transactionHash", feeWithdrawnEvent.transaction.hash.toHexString());
  assert.fieldEquals("FeeWithdrawnEvent", feeWithdrawnEventId, "timestamp", feeWithdrawnEvent.block.timestamp.toString());
  assert.fieldEquals("FeeWithdrawnEvent", feeWithdrawnEventId, "logIndex", feeWithdrawnEvent.logIndex.toString());

  // Test that the admin user is created and has the event in their frendLendEvents
  assert.fieldEquals("User", admin.toHexString(), "address", admin.toHexString());

  // Check that the event is added to the admin's frendLendEvents array
  const userEntity = User.load(admin.toHexString());
  assert.assertNotNull(userEntity);
  assert.i32Equals(1, userEntity!.frendLendEvents.length);
  assert.stringEquals(feeWithdrawnEventId, userEntity!.frendLendEvents[0]);

  log.info("✅ should create FeeWithdrawnEvent and associate with admin user", []);

  afterEach();
});

// exporting for test coverage
export {
  handleBullaTagUpdated,
  handleFeeWithdrawn,
  handleLoanOfferAccepted,
  handleLoanOfferAcceptedV2,
  handleLoanOffered,
  handleLoanOfferedV2,
  handleLoanOfferRejected,
  handleLoanOfferRejectedV2,
  handleLoanPayment,
};
