import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { assert, newMockEvent, test } from "matchstick-as/assembly/index";
import { Transfer } from "../generated/BullaClaimERC721/BullaClaimERC721";
import { CLAIM_TYPE_INVOICE, CLAIM_TYPE_PAYMENT } from "../src/functions/common";
import { handleClaimCreatedV1, handleClaimPayment, handleTransferV1 } from "../src/mappings/BullaClaimERC721";
import { handleDepositV1, handleInvoiceFundedV1, handleInvoiceUnfactoredV1 } from "../src/mappings/BullaFactoring";
import { newClaimCreatedEventV1, newPartialClaimPaymentEvent } from "./functions/BullaClaimERC721.testtools";
import { newDepositMadeEvent, newInvoiceFundedEventV1, newInvoiceUnfactoredEventV1 } from "./functions/BullaFactoring.testtools";
import { ADDRESS_1, ADDRESS_2, ADDRESS_3, MOCK_BULLA_FACTORING_ADDRESS, afterEach, setupContracts, toEthAddress, toUint256 } from "./helpers";

// The shared fixture always transfers ADDRESS_1 -> ADDRESS_3; these tests need
// to pick the destination (an ordinary wallet vs. the factoring pool), which is
// the whole distinction condition 2 turns on.
const newTransferBetween = (tokenId: u32, from: Address, to: Address): Transfer => {
  const event: Transfer = changetype<Transfer>(newMockEvent());
  event.parameters = [
    new ethereum.EventParam("from", toEthAddress(from)),
    new ethereum.EventParam("to", toEthAddress(to)),
    new ethereum.EventParam("tokenId", toUint256(BigInt.fromU32(tokenId))),
  ];
  return event;
};

// Registers the FactoringPool entity at MOCK_BULLA_FACTORING_ADDRESS — the same
// set the client passes as `creditor_in`, and what makes a transfer into that
// address read as factoring rather than an ordinary sale.
const registerFactoringPool = (): void => {
  handleDepositV1(newDepositMadeEvent(ADDRESS_3, BigInt.fromI32(1000), BigInt.fromI32(1000)));
};

const assertTotals = (address: string, receivable: string, payable: string, factoringOnly: string): void => {
  assert.fieldEquals("UserClaimStats", address, "totalReceivableCount", receivable);
  assert.fieldEquals("UserClaimStats", address, "totalPayableCount", payable);
  assert.fieldEquals("UserClaimStats", address, "factoringOnlyReceivableCount", factoringOnly);
};

test("totals: creation splits by direction and survives status changes", () => {
  setupContracts();

  const claimCreated = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  handleClaimCreatedV1(claimCreated);

  assertTotals(ADDRESS_1.toHexString(), "1", "0", "0");
  assertTotals(ADDRESS_2.toHexString(), "0", "1", "0");

  // Unlike pendingPayables/openPayableCount, the totals are not status-scoped:
  // a payment must not move them, or the page count stops matching the table.
  const payment = newPartialClaimPaymentEvent(claimCreated);
  handleClaimPayment(payment);

  assertTotals(ADDRESS_1.toHexString(), "1", "0", "0");
  assertTotals(ADDRESS_2.toHexString(), "0", "1", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "pendingPayables", "1");
  log.info("✅ totals count every status, unlike the status-scoped tab counters", []);

  afterEach();
});

test("totals: transfer to an ordinary wallet moves the receivable — originalCreditor alone does not count", () => {
  setupContracts();

  const claimCreated = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  handleClaimCreatedV1(claimCreated);

  handleTransferV1(newTransferBetween(1, ADDRESS_1, ADDRESS_3));

  // ADDRESS_1 is still originalCreditor and isTransferred is now true, but
  // ADDRESS_3 is not a pool — condition 2 must not fire.
  assertTotals(ADDRESS_1.toHexString(), "0", "0", "0");
  assertTotals(ADDRESS_3.toHexString(), "1", "0", "0");
  log.info("✅ an ordinary transfer hands the receivable over rather than duplicating it", []);

  afterEach();
});

test("totals: a payment received before transferring away keeps the claim in the ex-creditor's set", () => {
  setupContracts();

  const claimCreated = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  handleClaimCreatedV1(claimCreated);
  handleClaimPayment(newPartialClaimPaymentEvent(claimCreated));

  handleTransferV1(newTransferBetween(1, ADDRESS_1, ADDRESS_3));

  // Condition 3: ADDRESS_1 has a ClaimPayment with recipient == ADDRESS_1, so
  // the claim stays in their table even though they no longer hold the NFT.
  assertTotals(ADDRESS_1.toHexString(), "1", "0", "0");
  assertTotals(ADDRESS_3.toHexString(), "1", "0", "0");
  log.info("✅ the payment latch keeps a partially-paid-then-sold claim visible", []);

  afterEach();
});

test("totals: factoring keeps the claim on the original creditor and marks it as factoring-only", () => {
  setupContracts();
  registerFactoringPool();

  const claimId = BigInt.fromI32(1);
  const claimCreated = newClaimCreatedEventV1(claimId.toU32(), CLAIM_TYPE_INVOICE);
  handleClaimCreatedV1(claimCreated);

  // The NFT lands in the pool earlier in the same tx than InvoiceFunded.
  handleTransferV1(newTransferBetween(claimId.toU32(), ADDRESS_1, MOCK_BULLA_FACTORING_ADDRESS));
  handleInvoiceFundedV1(newInvoiceFundedEventV1(claimId, BigInt.fromI32(10000), ADDRESS_1));

  // Condition 2: counted once for the original creditor, and flagged as
  // reachable only via the factoring branch so a client built without the
  // factoring pool feature can subtract it.
  assertTotals(ADDRESS_1.toHexString(), "1", "0", "1");
  // Condition 1 for the pool itself, which is what the pool's own table shows.
  assertTotals(MOCK_BULLA_FACTORING_ADDRESS.toHexString(), "1", "0", "0");

  // Unfactor: the NFT returns and the claim is a plain receivable again.
  handleTransferV1(newTransferBetween(claimId.toU32(), MOCK_BULLA_FACTORING_ADDRESS, ADDRESS_1));
  handleInvoiceUnfactoredV1(newInvoiceUnfactoredEventV1(claimId, ADDRESS_1, BigInt.fromI32(7500), BigInt.fromI32(150)));

  assertTotals(ADDRESS_1.toHexString(), "1", "0", "0");
  assertTotals(MOCK_BULLA_FACTORING_ADDRESS.toHexString(), "0", "0", "0");
  log.info("✅ factoring and unfactoring round-trip without double-counting", []);

  afterEach();
});

test("totals: a claim matching two receivable conditions is counted once", () => {
  setupContracts();
  registerFactoringPool();

  const claimId = BigInt.fromI32(1);
  const claimCreated = newClaimCreatedEventV1(claimId.toU32(), CLAIM_TYPE_INVOICE);
  handleClaimCreatedV1(claimCreated);
  // Partially paid while ADDRESS_1 still held it -> condition 3 latched.
  handleClaimPayment(newPartialClaimPaymentEvent(claimCreated));

  handleTransferV1(newTransferBetween(claimId.toU32(), ADDRESS_1, MOCK_BULLA_FACTORING_ADDRESS));
  handleInvoiceFundedV1(newInvoiceFundedEventV1(claimId, BigInt.fromI32(10000), ADDRESS_1));

  // Conditions 2 AND 3 both hold. The claim is one row in the table, so it is
  // one unit of the count — and it is NOT factoring-only, because dropping the
  // factoring branch would leave condition 3 holding it in place.
  assertTotals(ADDRESS_1.toHexString(), "1", "0", "0");
  log.info("✅ overlapping conditions dedupe instead of summing", []);

  afterEach();
});

test("totals: independent claims accumulate per direction", () => {
  setupContracts();

  // ADDRESS_1 creditor / ADDRESS_2 debtor, twice.
  handleClaimCreatedV1(newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE));
  handleClaimCreatedV1(newClaimCreatedEventV1(2, CLAIM_TYPE_INVOICE));
  // Payment type flips the roles: ADDRESS_2 creditor / ADDRESS_1 debtor.
  handleClaimCreatedV1(newClaimCreatedEventV1(3, CLAIM_TYPE_PAYMENT));

  assertTotals(ADDRESS_1.toHexString(), "2", "1", "0");
  assertTotals(ADDRESS_2.toHexString(), "1", "2", "0");
  log.info("✅ totals accumulate across claims on both sides", []);

  afterEach();
});

test("Claim.factoringStatus back-pointer is written on funding", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const claimEntityId = "1-v1";

  handleClaimCreatedV1(newClaimCreatedEventV1(claimId.toU32(), CLAIM_TYPE_INVOICE));
  handleInvoiceFundedV1(newInvoiceFundedEventV1(claimId, BigInt.fromI32(10000), ADDRESS_1));

  // Not @derivedFrom — graph-node only returns this if a mapping wrote it.
  assert.fieldEquals("Claim", claimEntityId, "factoringStatus", claimEntityId);
  assert.fieldEquals("ClaimFactoringStatus", claimEntityId, "state", "Funded");
  log.info("✅ the claim points at its factoring status once funded", []);

  afterEach();
});

test("Claim.factoringStatus back-pointer is written on the Unfactored transition", () => {
  setupContracts();

  const claimId = BigInt.fromI32(1);
  const claimEntityId = "1-v1";

  handleClaimCreatedV1(newClaimCreatedEventV1(claimId.toU32(), CLAIM_TYPE_INVOICE));
  // Unfactor with no prior funding event indexed, so the status entity is born
  // on this transition — the frontend reads Unfactored as a real state, not as
  // absence, so the pointer has to be written here too and not only on funding.
  handleInvoiceUnfactoredV1(newInvoiceUnfactoredEventV1(claimId, ADDRESS_1, BigInt.fromI32(7500), BigInt.fromI32(150)));

  assert.fieldEquals("Claim", claimEntityId, "factoringStatus", claimEntityId);
  assert.fieldEquals("ClaimFactoringStatus", claimEntityId, "state", "Unfactored");
  log.info("✅ an unfactored claim still resolves its factoring status", []);

  afterEach();
});
