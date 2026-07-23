import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { CLAIM_TYPE_INVOICE } from "../src/functions/common";
import {
  handleClaimCreatedV1,
  handleClaimCreatedV2,
  handleClaimPayment,
  handleClaimPaymentV2,
  handleClaimRejected,
  handleTransferV1,
} from "../src/mappings/BullaClaimERC721";
import { handleLoanOffered, handleLoanOfferRejected } from "../src/mappings/FrendLend";
import {
  newClaimCreatedEventV1,
  newClaimCreatedEventV2,
  newClaimPaymentEvent,
  newClaimPaymentEventV2,
  newClaimRejectedEvent,
  newPartialClaimPaymentEvent,
  newTransferEvent,
} from "./functions/BullaClaimERC721.testtools";
import { newLoanOfferedEvent, newLoanOfferRejectedEvent } from "./functions/FrendLend.testtools";
import { ADDRESS_1, ADDRESS_2, ADDRESS_3, afterEach, MOCK_WETH_ADDRESS, ONE_ETH, setupContracts } from "./helpers";

const advance = (base: BigInt): BigInt => base.plus(BigInt.fromI32(20));

// UserTokenTotal id = `${userHex}-${tokenId}`; V2 claims use MOCK_WETH_ADDRESS.
const wethTotalId = (user: string): string => user + "-" + MOCK_WETH_ADDRESS.toHexString();

test("creation buckets a pending claim by creditor/debtor", () => {
  setupContracts();

  handleClaimCreatedV1(newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE));

  // creditor (ADDRESS_1) -> pending receivable; debtor (ADDRESS_2) -> pending payable
  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "pendingReceivables", "1");
  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "receivableLoans", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "pendingPayables", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "pendingPayables", "1");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "payableLoans", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "pendingReceivables", "0");
  log.info("✅ creation splits a pending claim by role", []);

  afterEach();
});

test("full payment clears the pending buckets", () => {
  setupContracts();

  const created = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const fullPayment = newClaimPaymentEvent(created);
  fullPayment.block.timestamp = advance(created.block.timestamp);
  fullPayment.block.number = advance(created.block.number);

  handleClaimCreatedV1(created);
  handleClaimPayment(fullPayment);

  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "pendingReceivables", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "pendingPayables", "0");
  log.info("✅ paid claims leave the pending tabs", []);

  afterEach();
});

test("partial payment (Repaying, no financing) is in neither tab", () => {
  setupContracts();

  const created = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const partial = newPartialClaimPaymentEvent(created);
  partial.block.timestamp = advance(created.block.timestamp);
  partial.block.number = advance(created.block.number);

  handleClaimCreatedV1(created);
  handleClaimPayment(partial);

  // Repaying without accepted financing counts as neither pending nor loan.
  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "pendingReceivables", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "receivableLoans", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "pendingPayables", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "payableLoans", "0");
  log.info("✅ a repaying non-loan claim is in neither tab", []);

  afterEach();
});

test("reject clears the pending buckets", () => {
  setupContracts();

  const created = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const rejected = newClaimRejectedEvent(created);
  rejected.block.timestamp = advance(created.block.timestamp);
  rejected.block.number = advance(created.block.number);

  handleClaimCreatedV1(created);
  handleClaimRejected(rejected);

  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "pendingReceivables", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "pendingPayables", "0");
  log.info("✅ rejected claims leave the pending tabs", []);

  afterEach();
});

test("transfer moves the pending receivable (factoring drop-off proxy)", () => {
  setupContracts();

  const created = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  // non-mint transfer: creditor ADDRESS_1 -> new owner ADDRESS_3 (e.g. a factoring pool)
  const transfer = newTransferEvent(created, false);
  transfer.block.timestamp = advance(created.block.timestamp);
  transfer.block.number = advance(created.block.number);

  handleClaimCreatedV1(created);
  handleTransferV1(transfer);

  // original creditor drops the pending receivable; new holder gains it
  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "pendingReceivables", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_3.toHexString(), "pendingReceivables", "1");
  // debtor's payable is unaffected by a creditor-side transfer
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "pendingPayables", "1");
  log.info("✅ a factored/transferred claim leaves the original creditor's tab", []);

  afterEach();
});

test("V2 creation seeds per-token outstanding; full payment zeroes it", () => {
  setupContracts();

  const created = newClaimCreatedEventV2(1, CLAIM_TYPE_INVOICE);
  handleClaimCreatedV2(created);

  // creditor receivable + debtor payable outstanding = full claim amount
  assert.fieldEquals("UserTokenTotal", wethTotalId(ADDRESS_1.toHexString()), "receivableOutstanding", ONE_ETH);
  assert.fieldEquals("UserTokenTotal", wethTotalId(ADDRESS_2.toHexString()), "payableOutstanding", ONE_ETH);

  const fullPayment = newClaimPaymentEventV2(created);
  fullPayment.block.timestamp = advance(created.block.timestamp);
  fullPayment.block.number = advance(created.block.number);
  handleClaimPaymentV2(fullPayment);

  assert.fieldEquals("UserTokenTotal", wethTotalId(ADDRESS_1.toHexString()), "receivableOutstanding", "0");
  assert.fieldEquals("UserTokenTotal", wethTotalId(ADDRESS_2.toHexString()), "payableOutstanding", "0");
  log.info("✅ per-token outstanding tracks amount − paidAmount", []);

  afterEach();
});

test("loan offer increments then rejection decrements offeredLoanOffers for both parties", () => {
  setupContracts();

  const loanId = BigInt.fromI32(1);
  const offered = newLoanOfferedEvent(
    loanId,
    BigInt.fromI32(875),
    BigInt.fromI32(30 * 24 * 60 * 60),
    BigInt.fromString(ONE_ETH),
    ADDRESS_1,
    ADDRESS_2,
    "Test Loan Offer",
    MOCK_WETH_ADDRESS,
  );
  offered.block.timestamp = BigInt.fromI32(100);
  offered.block.number = BigInt.fromI32(100);
  handleLoanOffered(offered);

  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "offeredLoanOffers", "1");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "offeredLoanOffers", "1");

  const rejected = newLoanOfferRejectedEvent(loanId, ADDRESS_2);
  rejected.block.timestamp = BigInt.fromI32(120);
  rejected.block.number = BigInt.fromI32(120);
  handleLoanOfferRejected(rejected);

  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "offeredLoanOffers", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "offeredLoanOffers", "0");
  log.info("✅ offeredLoanOffers tracks the open offer for both parties", []);

  afterEach();
});
