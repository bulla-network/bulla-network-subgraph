import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, logStore, test } from "matchstick-as/assembly/index";
import { CLAIM_TYPE_INVOICE } from "../src/functions/common";
import { getLoanOfferAcceptedEventId, getLoanOfferedEventId, getLoanOfferRejectedEventId } from "../src/functions/FrendLend";
import { handleLoanOffered, handleBullaTagUpdated, handleLoanOfferAccepted, handleLoanOfferRejected } from "../src/mappings/FrendLend";
import { handleClaimCreated } from "./BullaFinance.test";
import { newClaimCreatedEvent } from "./functions/BullaClaimERC721.testtools";
import { newBullaTagUpdatedEvent, newLoanOfferAcceptedEvent, newLoanOfferedEvent, newLoanOfferRejectedEvent } from "./functions/FrendLend.testtools";
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
  const claimCreatedEvent = newClaimCreatedEvent(claimId.toU32(), CLAIM_TYPE_INVOICE);
  claimCreatedEvent.block.timestamp = timestamp;
  claimCreatedEvent.block.number = blockNum;
  const bullaTagUpdatedEvent = newBullaTagUpdatedEvent(claimId, ADDRESS_1, DEFAULT_ACCOUNT_TAG);
  bullaTagUpdatedEvent.block.timestamp = timestamp;
  bullaTagUpdatedEvent.block.number = blockNum;

  handleClaimCreated(claimCreatedEvent);
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

// exporting for test coverage
export { handleLoanOffered, handleBullaTagUpdated, handleLoanOfferAccepted, handleLoanOfferRejected };
