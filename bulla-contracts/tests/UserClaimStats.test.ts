import { BigInt, log } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as/assembly/index";
import { CLAIM_TYPE_INVOICE } from "../src/functions/common";
import {
  handleClaimCreatedV1,
  handleClaimCreatedV2,
  handleClaimImpaired,
  handleClaimMarkedAsPaid,
  handleClaimPayment,
  handleClaimPaymentV2,
  handleClaimRejected,
  handleClaimRescinded,
  handleTransferV1,
} from "../src/mappings/BullaClaimERC721";
import {
  newClaimCreatedEventV1,
  newClaimCreatedEventV2,
  newClaimImpairedEvent,
  newClaimMarkedAsPaidEvent,
  newClaimPaymentEvent,
  newClaimPaymentEventV2,
  newClaimRejectedEvent,
  newClaimRescindedEvent,
  newPartialClaimPaymentEvent,
  newTransferEvent,
} from "./functions/BullaClaimERC721.testtools";
import { ADDRESS_1, ADDRESS_2, ADDRESS_3, afterEach, setupContracts } from "./helpers";

const advance = (base: BigInt): BigInt => base.plus(BigInt.fromI32(20));

test("creation increments open payable/receivable counts by direction", () => {
  setupContracts();

  // Invoice => creditor = ADDRESS_1 (sender), debtor = ADDRESS_2 (receiver)
  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  handleClaimCreatedV1(claimCreatedEvent);

  // creditor sees a receivable, no payable
  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "openReceivableCount", "1");
  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "openPayableCount", "0");
  // debtor sees a payable, no receivable
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "openPayableCount", "1");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "openReceivableCount", "0");
  log.info("✅ creation splits the open claim by creditor/debtor role", []);

  afterEach();
});

test("full payment closes the claim and zeroes both counts", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const fullPaymentEvent = newClaimPaymentEvent(claimCreatedEvent);
  fullPaymentEvent.block.timestamp = advance(claimCreatedEvent.block.timestamp);
  fullPaymentEvent.block.number = advance(claimCreatedEvent.block.number);

  handleClaimCreatedV1(claimCreatedEvent);
  handleClaimPayment(fullPaymentEvent);

  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "openReceivableCount", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "openPayableCount", "0");
  log.info("✅ full payment removes the open claim from both sides", []);

  afterEach();
});

test("partial payment keeps the claim open (repaying still counts)", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const partialPaymentEvent = newPartialClaimPaymentEvent(claimCreatedEvent);
  partialPaymentEvent.block.timestamp = advance(claimCreatedEvent.block.timestamp);
  partialPaymentEvent.block.number = advance(claimCreatedEvent.block.number);

  handleClaimCreatedV1(claimCreatedEvent);
  handleClaimPayment(partialPaymentEvent);

  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "openReceivableCount", "1");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "openPayableCount", "1");
  log.info("✅ a repaying claim remains an open soft-blocker", []);

  afterEach();
});

test("reject closes the claim and zeroes both counts", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const rejectedEvent = newClaimRejectedEvent(claimCreatedEvent);
  rejectedEvent.block.timestamp = advance(claimCreatedEvent.block.timestamp);
  rejectedEvent.block.number = advance(claimCreatedEvent.block.number);

  handleClaimCreatedV1(claimCreatedEvent);
  handleClaimRejected(rejectedEvent);

  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "openReceivableCount", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "openPayableCount", "0");
  log.info("✅ rejected claims drop out of the open counts", []);

  afterEach();
});

test("rescind closes the claim and zeroes both counts", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  const rescindedEvent = newClaimRescindedEvent(claimCreatedEvent);
  rescindedEvent.block.timestamp = advance(claimCreatedEvent.block.timestamp);
  rescindedEvent.block.number = advance(claimCreatedEvent.block.number);

  handleClaimCreatedV1(claimCreatedEvent);
  handleClaimRescinded(rescindedEvent);

  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "openReceivableCount", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "openPayableCount", "0");
  log.info("✅ rescinded claims drop out of the open counts", []);

  afterEach();
});

test("transfer moves the receivable to the new creditor", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV1(1, CLAIM_TYPE_INVOICE);
  // non-mint transfer: from ADDRESS_1 (creditor) -> ADDRESS_3 (new owner)
  const transferEvent = newTransferEvent(claimCreatedEvent, false);
  transferEvent.block.timestamp = advance(claimCreatedEvent.block.timestamp);
  transferEvent.block.number = advance(claimCreatedEvent.block.number);

  handleClaimCreatedV1(claimCreatedEvent);
  handleTransferV1(transferEvent);

  // old creditor no longer holds the receivable
  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "openReceivableCount", "0");
  // new creditor now holds it
  assert.fieldEquals("UserClaimStats", ADDRESS_3.toHexString(), "openReceivableCount", "1");
  // debtor's payable is unaffected by a creditor-side transfer
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "openPayableCount", "1");
  log.info("✅ transferring an open claim moves the receivable", []);

  afterEach();
});

test("V2 markAsPaid closes the claim", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV2(1, CLAIM_TYPE_INVOICE);
  const markedAsPaidEvent = newClaimMarkedAsPaidEvent(1);
  markedAsPaidEvent.block.timestamp = advance(claimCreatedEvent.block.timestamp);
  markedAsPaidEvent.block.number = advance(claimCreatedEvent.block.number);

  handleClaimCreatedV2(claimCreatedEvent);
  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "openReceivableCount", "1");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "openPayableCount", "1");

  handleClaimMarkedAsPaid(markedAsPaidEvent);
  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "openReceivableCount", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "openPayableCount", "0");
  log.info("✅ V2 markAsPaid removes the open claim", []);

  afterEach();
});

test("V2 impaired stays open (not Paid/Rejected/Rescinded)", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV2(1, CLAIM_TYPE_INVOICE);
  const impairedEvent = newClaimImpairedEvent(1);
  impairedEvent.block.timestamp = advance(claimCreatedEvent.block.timestamp);
  impairedEvent.block.number = advance(claimCreatedEvent.block.number);

  handleClaimCreatedV2(claimCreatedEvent);
  handleClaimImpaired(impairedEvent);

  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "openReceivableCount", "1");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "openPayableCount", "1");
  log.info("✅ impaired claims remain open soft-blockers", []);

  afterEach();
});

test("V2 full payment closes the claim", () => {
  setupContracts();

  const claimCreatedEvent = newClaimCreatedEventV2(1, CLAIM_TYPE_INVOICE);
  const fullPaymentEvent = newClaimPaymentEventV2(claimCreatedEvent);
  fullPaymentEvent.block.timestamp = advance(claimCreatedEvent.block.timestamp);
  fullPaymentEvent.block.number = advance(claimCreatedEvent.block.number);

  handleClaimCreatedV2(claimCreatedEvent);
  handleClaimPaymentV2(fullPaymentEvent);

  assert.fieldEquals("UserClaimStats", ADDRESS_1.toHexString(), "openReceivableCount", "0");
  assert.fieldEquals("UserClaimStats", ADDRESS_2.toHexString(), "openPayableCount", "0");
  log.info("✅ V2 full payment removes the open claim", []);

  afterEach();
});
