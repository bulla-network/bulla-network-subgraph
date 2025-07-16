import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, logStore, test } from "matchstick-as/assembly/index";
import { CLAIM_TYPE_INVOICE } from "../src/functions/common";
import { getLoanOfferAcceptedEventId, getLoanOfferedEventId, getLoanOfferRejectedEventId } from "../src/functions/FrendLend";
import { handleLoanOffered, handleBullaTagUpdated, handleLoanOfferAccepted, handleLoanOfferRejected, handleLoanOfferedV2 } from "../src/mappings/FrendLend";
import { handleClaimCreatedV1 } from "./BullaFinance.test";
import { newClaimCreatedEventV1 } from "./functions/BullaClaimERC721.testtools";
import {
  newBullaTagUpdatedEvent,
  newLoanOfferAcceptedEvent,
  newLoanOfferedEvent,
  newLoanOfferRejectedEvent,
  newLoanOfferedEventV2,
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

  const loanOfferedEventId = getLoanOfferedEventId(loanId);

  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "loanId", loanOfferedEvent.params.loanId.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "offeredBy", loanOfferedEvent.params.offeredBy.toHexString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "interestBPS", loanOfferedEvent.params.loanOffer.interestBPS.toString());
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
  logStore();
  const loanOfferAcceptedEventId = getLoanOfferAcceptedEventId(loanId, claimId, loanOfferAcceptedEvent);

  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "loanId", loanOfferAcceptedEvent.params.loanId.toString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "claimId", loanOfferAcceptedEvent.params.claimId.toString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "eventName", "LoanOfferAccepted");
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "blockNumber", loanOfferAcceptedEvent.block.number.toString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "transactionHash", loanOfferAcceptedEvent.transaction.hash.toHexString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "timestamp", loanOfferAcceptedEvent.block.timestamp.toString());
  assert.fieldEquals("LoanOfferAcceptedEvent", loanOfferAcceptedEventId, "logIndex", loanOfferAcceptedEvent.logIndex.toString());
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
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "rejectedBy", loanOfferRejectedEvent.params.rejectedBy.toHexString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "eventName", "LoanOfferRejected");
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "blockNumber", loanOfferRejectedEvent.block.number.toString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "transactionHash", loanOfferRejectedEvent.transaction.hash.toHexString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "timestamp", loanOfferRejectedEvent.block.timestamp.toString());
  assert.fieldEquals("LoanOfferRejectedEvent", loanOfferRejectedEventId, "logIndex", loanOfferRejectedEvent.logIndex.toString());
  log.info("✅ should create a LoanOfferRejected event", []);

  afterEach();
});

test("it handles LoanOfferedV2 events", () => {
  setupContracts();

  const loanId = BigInt.fromI32(2);
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

  const loanOfferedEventV2 = newLoanOfferedEventV2(
    loanId,
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

  const loanOfferedEventId = getLoanOfferedEventId(loanId);

  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "loanId", loanOfferedEventV2.params.loanId.toString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "offeredBy", loanOfferedEventV2.params.offeredBy.toHexString());
  assert.fieldEquals("LoanOfferedEvent", loanOfferedEventId, "interestBPS", loanOfferedEventV2.params.loanOffer.interestConfig.interestRateBps.toString());
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
  log.info("✅ should create a LoanOfferedV2 event", []);

  afterEach();
});

// exporting for test coverage
export { handleLoanOffered, handleBullaTagUpdated, handleLoanOfferAccepted, handleLoanOfferRejected, handleLoanOfferedV2 };
