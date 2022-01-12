// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class TransferEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("from", Value.fromBytes(Bytes.empty()));
    this.set("to", Value.fromBytes(Bytes.empty()));
    this.set("tokenId", Value.fromString(""));
    this.set("eventName", Value.fromString(""));
    this.set("blockNumber", Value.fromBigInt(BigInt.zero()));
    this.set("transactionHash", Value.fromBytes(Bytes.empty()));
    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save TransferEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save TransferEvent entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("TransferEvent", id.toString(), this);
    }
  }

  static load(id: string): TransferEvent | null {
    return changetype<TransferEvent | null>(store.get("TransferEvent", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value!.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get to(): Bytes {
    let value = this.get("to");
    return value!.toBytes();
  }

  set to(value: Bytes) {
    this.set("to", Value.fromBytes(value));
  }

  get tokenId(): string {
    let value = this.get("tokenId");
    return value!.toString();
  }

  set tokenId(value: string) {
    this.set("tokenId", Value.fromString(value));
  }

  get eventName(): string {
    let value = this.get("eventName");
    return value!.toString();
  }

  set eventName(value: string) {
    this.set("eventName", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    return value!.toBytes();
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class BullaTagUpdatedEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("bullaManager", Value.fromBytes(Bytes.empty()));
    this.set("tokenId", Value.fromString(""));
    this.set("updatedBy", Value.fromBytes(Bytes.empty()));
    this.set("tag", Value.fromString(""));
    this.set("eventName", Value.fromString(""));
    this.set("blockNumber", Value.fromBigInt(BigInt.zero()));
    this.set("transactionHash", Value.fromBytes(Bytes.empty()));
    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save BullaTagUpdatedEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save BullaTagUpdatedEvent entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("BullaTagUpdatedEvent", id.toString(), this);
    }
  }

  static load(id: string): BullaTagUpdatedEvent | null {
    return changetype<BullaTagUpdatedEvent | null>(
      store.get("BullaTagUpdatedEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get bullaManager(): Bytes {
    let value = this.get("bullaManager");
    return value!.toBytes();
  }

  set bullaManager(value: Bytes) {
    this.set("bullaManager", Value.fromBytes(value));
  }

  get tokenId(): string {
    let value = this.get("tokenId");
    return value!.toString();
  }

  set tokenId(value: string) {
    this.set("tokenId", Value.fromString(value));
  }

  get updatedBy(): Bytes {
    let value = this.get("updatedBy");
    return value!.toBytes();
  }

  set updatedBy(value: Bytes) {
    this.set("updatedBy", Value.fromBytes(value));
  }

  get tag(): string {
    let value = this.get("tag");
    return value!.toString();
  }

  set tag(value: string) {
    this.set("tag", Value.fromString(value));
  }

  get eventName(): string {
    let value = this.get("eventName");
    return value!.toString();
  }

  set eventName(value: string) {
    this.set("eventName", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    return value!.toBytes();
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class FeePaidEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("bullaManager", Value.fromBytes(Bytes.empty()));
    this.set("tokenId", Value.fromString(""));
    this.set("collectionAddress", Value.fromBytes(Bytes.empty()));
    this.set("paymentAmount", Value.fromBigInt(BigInt.zero()));
    this.set("transactionFee", Value.fromBigInt(BigInt.zero()));
    this.set("eventName", Value.fromString(""));
    this.set("blockNumber", Value.fromBigInt(BigInt.zero()));
    this.set("transactionHash", Value.fromBytes(Bytes.empty()));
    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save FeePaidEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save FeePaidEvent entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("FeePaidEvent", id.toString(), this);
    }
  }

  static load(id: string): FeePaidEvent | null {
    return changetype<FeePaidEvent | null>(store.get("FeePaidEvent", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get bullaManager(): Bytes {
    let value = this.get("bullaManager");
    return value!.toBytes();
  }

  set bullaManager(value: Bytes) {
    this.set("bullaManager", Value.fromBytes(value));
  }

  get tokenId(): string {
    let value = this.get("tokenId");
    return value!.toString();
  }

  set tokenId(value: string) {
    this.set("tokenId", Value.fromString(value));
  }

  get collectionAddress(): Bytes {
    let value = this.get("collectionAddress");
    return value!.toBytes();
  }

  set collectionAddress(value: Bytes) {
    this.set("collectionAddress", Value.fromBytes(value));
  }

  get paymentAmount(): BigInt {
    let value = this.get("paymentAmount");
    return value!.toBigInt();
  }

  set paymentAmount(value: BigInt) {
    this.set("paymentAmount", Value.fromBigInt(value));
  }

  get transactionFee(): BigInt {
    let value = this.get("transactionFee");
    return value!.toBigInt();
  }

  set transactionFee(value: BigInt) {
    this.set("transactionFee", Value.fromBigInt(value));
  }

  get eventName(): string {
    let value = this.get("eventName");
    return value!.toString();
  }

  set eventName(value: string) {
    this.set("eventName", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    return value!.toBytes();
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class ClaimRejectedEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("managerAddress", Value.fromBytes(Bytes.empty()));
    this.set("tokenId", Value.fromString(""));
    this.set("eventName", Value.fromString(""));
    this.set("blockNumber", Value.fromBigInt(BigInt.zero()));
    this.set("transactionHash", Value.fromBytes(Bytes.empty()));
    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save ClaimRejectedEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save ClaimRejectedEvent entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("ClaimRejectedEvent", id.toString(), this);
    }
  }

  static load(id: string): ClaimRejectedEvent | null {
    return changetype<ClaimRejectedEvent | null>(
      store.get("ClaimRejectedEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get managerAddress(): Bytes {
    let value = this.get("managerAddress");
    return value!.toBytes();
  }

  set managerAddress(value: Bytes) {
    this.set("managerAddress", Value.fromBytes(value));
  }

  get tokenId(): string {
    let value = this.get("tokenId");
    return value!.toString();
  }

  set tokenId(value: string) {
    this.set("tokenId", Value.fromString(value));
  }

  get eventName(): string {
    let value = this.get("eventName");
    return value!.toString();
  }

  set eventName(value: string) {
    this.set("eventName", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    return value!.toBytes();
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class ClaimRescindedEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("bullaManager", Value.fromBytes(Bytes.empty()));
    this.set("tokenId", Value.fromString(""));
    this.set("eventName", Value.fromString(""));
    this.set("blockNumber", Value.fromBigInt(BigInt.zero()));
    this.set("transactionHash", Value.fromBytes(Bytes.empty()));
    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save ClaimRescindedEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save ClaimRescindedEvent entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("ClaimRescindedEvent", id.toString(), this);
    }
  }

  static load(id: string): ClaimRescindedEvent | null {
    return changetype<ClaimRescindedEvent | null>(
      store.get("ClaimRescindedEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get bullaManager(): Bytes {
    let value = this.get("bullaManager");
    return value!.toBytes();
  }

  set bullaManager(value: Bytes) {
    this.set("bullaManager", Value.fromBytes(value));
  }

  get tokenId(): string {
    let value = this.get("tokenId");
    return value!.toString();
  }

  set tokenId(value: string) {
    this.set("tokenId", Value.fromString(value));
  }

  get eventName(): string {
    let value = this.get("eventName");
    return value!.toString();
  }

  set eventName(value: string) {
    this.set("eventName", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    return value!.toBytes();
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class ClaimPaymentEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("bullaManager", Value.fromBytes(Bytes.empty()));
    this.set("tokenId", Value.fromString(""));
    this.set("debtor", Value.fromBytes(Bytes.empty()));
    this.set("paidBy", Value.fromBytes(Bytes.empty()));
    this.set("paymentAmount", Value.fromBigInt(BigInt.zero()));
    this.set("eventName", Value.fromString(""));
    this.set("blockNumber", Value.fromBigInt(BigInt.zero()));
    this.set("transactionHash", Value.fromBytes(Bytes.empty()));
    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save ClaimPaymentEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save ClaimPaymentEvent entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("ClaimPaymentEvent", id.toString(), this);
    }
  }

  static load(id: string): ClaimPaymentEvent | null {
    return changetype<ClaimPaymentEvent | null>(
      store.get("ClaimPaymentEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get bullaManager(): Bytes {
    let value = this.get("bullaManager");
    return value!.toBytes();
  }

  set bullaManager(value: Bytes) {
    this.set("bullaManager", Value.fromBytes(value));
  }

  get tokenId(): string {
    let value = this.get("tokenId");
    return value!.toString();
  }

  set tokenId(value: string) {
    this.set("tokenId", Value.fromString(value));
  }

  get debtor(): Bytes {
    let value = this.get("debtor");
    return value!.toBytes();
  }

  set debtor(value: Bytes) {
    this.set("debtor", Value.fromBytes(value));
  }

  get paidBy(): Bytes {
    let value = this.get("paidBy");
    return value!.toBytes();
  }

  set paidBy(value: Bytes) {
    this.set("paidBy", Value.fromBytes(value));
  }

  get paymentAmount(): BigInt {
    let value = this.get("paymentAmount");
    return value!.toBigInt();
  }

  set paymentAmount(value: BigInt) {
    this.set("paymentAmount", Value.fromBigInt(value));
  }

  get eventName(): string {
    let value = this.get("eventName");
    return value!.toString();
  }

  set eventName(value: string) {
    this.set("eventName", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    return value!.toBytes();
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class ClaimCreatedEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("tokenId", Value.fromString(""));
    this.set("bullaManager", Value.fromBytes(Bytes.empty()));
    this.set("parent", Value.fromBytes(Bytes.empty()));
    this.set("creator", Value.fromBytes(Bytes.empty()));
    this.set("debtor", Value.fromBytes(Bytes.empty()));
    this.set("creditor", Value.fromBytes(Bytes.empty()));
    this.set("claimToken", Value.fromString(""));
    this.set("description", Value.fromString(""));
    this.set("amount", Value.fromBigInt(BigInt.zero()));
    this.set("dueBy", Value.fromBigInt(BigInt.zero()));
    this.set("eventName", Value.fromString(""));
    this.set("blockNumber", Value.fromBigInt(BigInt.zero()));
    this.set("transactionHash", Value.fromBytes(Bytes.empty()));
    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save ClaimCreatedEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save ClaimCreatedEvent entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("ClaimCreatedEvent", id.toString(), this);
    }
  }

  static load(id: string): ClaimCreatedEvent | null {
    return changetype<ClaimCreatedEvent | null>(
      store.get("ClaimCreatedEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get tokenId(): string {
    let value = this.get("tokenId");
    return value!.toString();
  }

  set tokenId(value: string) {
    this.set("tokenId", Value.fromString(value));
  }

  get bullaManager(): Bytes {
    let value = this.get("bullaManager");
    return value!.toBytes();
  }

  set bullaManager(value: Bytes) {
    this.set("bullaManager", Value.fromBytes(value));
  }

  get parent(): Bytes {
    let value = this.get("parent");
    return value!.toBytes();
  }

  set parent(value: Bytes) {
    this.set("parent", Value.fromBytes(value));
  }

  get creator(): Bytes {
    let value = this.get("creator");
    return value!.toBytes();
  }

  set creator(value: Bytes) {
    this.set("creator", Value.fromBytes(value));
  }

  get debtor(): Bytes {
    let value = this.get("debtor");
    return value!.toBytes();
  }

  set debtor(value: Bytes) {
    this.set("debtor", Value.fromBytes(value));
  }

  get creditor(): Bytes {
    let value = this.get("creditor");
    return value!.toBytes();
  }

  set creditor(value: Bytes) {
    this.set("creditor", Value.fromBytes(value));
  }

  get claimToken(): string {
    let value = this.get("claimToken");
    return value!.toString();
  }

  set claimToken(value: string) {
    this.set("claimToken", Value.fromString(value));
  }

  get description(): string {
    let value = this.get("description");
    return value!.toString();
  }

  set description(value: string) {
    this.set("description", Value.fromString(value));
  }

  get ipfsHash(): string | null {
    let value = this.get("ipfsHash");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set ipfsHash(value: string | null) {
    if (!value) {
      this.unset("ipfsHash");
    } else {
      this.set("ipfsHash", Value.fromString(<string>value));
    }
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value!.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }

  get dueBy(): BigInt {
    let value = this.get("dueBy");
    return value!.toBigInt();
  }

  set dueBy(value: BigInt) {
    this.set("dueBy", Value.fromBigInt(value));
  }

  get eventName(): string {
    let value = this.get("eventName");
    return value!.toString();
  }

  set eventName(value: string) {
    this.set("eventName", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    return value!.toBytes();
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class BullaManagerSetEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("prevBullaManager", Value.fromBytes(Bytes.empty()));
    this.set("newBullaManager", Value.fromBytes(Bytes.empty()));
    this.set("eventName", Value.fromString(""));
    this.set("blockNumber", Value.fromBigInt(BigInt.zero()));
    this.set("transactionHash", Value.fromBytes(Bytes.empty()));
    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save BullaManagerSetEvent entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save BullaManagerSetEvent entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("BullaManagerSetEvent", id.toString(), this);
    }
  }

  static load(id: string): BullaManagerSetEvent | null {
    return changetype<BullaManagerSetEvent | null>(
      store.get("BullaManagerSetEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get prevBullaManager(): Bytes {
    let value = this.get("prevBullaManager");
    return value!.toBytes();
  }

  set prevBullaManager(value: Bytes) {
    this.set("prevBullaManager", Value.fromBytes(value));
  }

  get newBullaManager(): Bytes {
    let value = this.get("newBullaManager");
    return value!.toBytes();
  }

  set newBullaManager(value: Bytes) {
    this.set("newBullaManager", Value.fromBytes(value));
  }

  get eventName(): string {
    let value = this.get("eventName");
    return value!.toString();
  }

  set eventName(value: string) {
    this.set("eventName", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    return value!.toBytes();
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class BullaBankerCreatedEvent extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("bullaManager", Value.fromBytes(Bytes.empty()));
    this.set("bullaClaimERC721", Value.fromBytes(Bytes.empty()));
    this.set("bullaBanker", Value.fromBytes(Bytes.empty()));
    this.set("eventName", Value.fromString(""));
    this.set("blockNumber", Value.fromBigInt(BigInt.zero()));
    this.set("transactionHash", Value.fromBytes(Bytes.empty()));
    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id != null,
      "Cannot save BullaBankerCreatedEvent entity without an ID"
    );
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save BullaBankerCreatedEvent entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("BullaBankerCreatedEvent", id.toString(), this);
    }
  }

  static load(id: string): BullaBankerCreatedEvent | null {
    return changetype<BullaBankerCreatedEvent | null>(
      store.get("BullaBankerCreatedEvent", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get bullaManager(): Bytes {
    let value = this.get("bullaManager");
    return value!.toBytes();
  }

  set bullaManager(value: Bytes) {
    this.set("bullaManager", Value.fromBytes(value));
  }

  get bullaClaimERC721(): Bytes {
    let value = this.get("bullaClaimERC721");
    return value!.toBytes();
  }

  set bullaClaimERC721(value: Bytes) {
    this.set("bullaClaimERC721", Value.fromBytes(value));
  }

  get bullaBanker(): Bytes {
    let value = this.get("bullaBanker");
    return value!.toBytes();
  }

  set bullaBanker(value: Bytes) {
    this.set("bullaBanker", Value.fromBytes(value));
  }

  get eventName(): string {
    let value = this.get("eventName");
    return value!.toString();
  }

  set eventName(value: string) {
    this.set("eventName", Value.fromString(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    return value!.toBytes();
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class AccountTag extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("tokenId", Value.fromString(""));
    this.set("userAddress", Value.fromBytes(Bytes.empty()));
    this.set("tag", Value.fromString(""));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save AccountTag entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save AccountTag entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("AccountTag", id.toString(), this);
    }
  }

  static load(id: string): AccountTag | null {
    return changetype<AccountTag | null>(store.get("AccountTag", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get tokenId(): string {
    let value = this.get("tokenId");
    return value!.toString();
  }

  set tokenId(value: string) {
    this.set("tokenId", Value.fromString(value));
  }

  get userAddress(): Bytes {
    let value = this.get("userAddress");
    return value!.toBytes();
  }

  set userAddress(value: Bytes) {
    this.set("userAddress", Value.fromBytes(value));
  }

  get tag(): string {
    let value = this.get("tag");
    return value!.toString();
  }

  set tag(value: string) {
    this.set("tag", Value.fromString(value));
  }
}

export class Claim extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("tokenId", Value.fromString(""));
    this.set("creator", Value.fromBytes(Bytes.empty()));
    this.set("creditor", Value.fromBytes(Bytes.empty()));
    this.set("debtor", Value.fromBytes(Bytes.empty()));
    this.set("amount", Value.fromBigInt(BigInt.zero()));
    this.set("paidAmount", Value.fromBigInt(BigInt.zero()));
    this.set("description", Value.fromString(""));
    this.set("created", Value.fromBigInt(BigInt.zero()));
    this.set("dueBy", Value.fromBigInt(BigInt.zero()));
    this.set("claimType", Value.fromString(""));
    this.set("token", Value.fromString(""));
    this.set("status", Value.fromString(""));
    this.set("transactionHash", Value.fromBytes(Bytes.empty()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Claim entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Claim entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Claim", id.toString(), this);
    }
  }

  static load(id: string): Claim | null {
    return changetype<Claim | null>(store.get("Claim", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get tokenId(): string {
    let value = this.get("tokenId");
    return value!.toString();
  }

  set tokenId(value: string) {
    this.set("tokenId", Value.fromString(value));
  }

  get logs(): Array<string> {
    let value = this.get("logs");
    return value!.toStringArray();
  }

  set logs(value: Array<string>) {
    this.set("logs", Value.fromStringArray(value));
  }

  get accountTag(): Array<string> {
    let value = this.get("accountTag");
    return value!.toStringArray();
  }

  set accountTag(value: Array<string>) {
    this.set("accountTag", Value.fromStringArray(value));
  }

  get ipfsHash(): string | null {
    let value = this.get("ipfsHash");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set ipfsHash(value: string | null) {
    if (!value) {
      this.unset("ipfsHash");
    } else {
      this.set("ipfsHash", Value.fromString(<string>value));
    }
  }

  get creator(): Bytes {
    let value = this.get("creator");
    return value!.toBytes();
  }

  set creator(value: Bytes) {
    this.set("creator", Value.fromBytes(value));
  }

  get creditor(): Bytes {
    let value = this.get("creditor");
    return value!.toBytes();
  }

  set creditor(value: Bytes) {
    this.set("creditor", Value.fromBytes(value));
  }

  get debtor(): Bytes {
    let value = this.get("debtor");
    return value!.toBytes();
  }

  set debtor(value: Bytes) {
    this.set("debtor", Value.fromBytes(value));
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value!.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }

  get paidAmount(): BigInt {
    let value = this.get("paidAmount");
    return value!.toBigInt();
  }

  set paidAmount(value: BigInt) {
    this.set("paidAmount", Value.fromBigInt(value));
  }

  get isTransferred(): boolean {
    let value = this.get("isTransferred");
    return value!.toBoolean();
  }

  set isTransferred(value: boolean) {
    this.set("isTransferred", Value.fromBoolean(value));
  }

  get description(): string {
    let value = this.get("description");
    return value!.toString();
  }

  set description(value: string) {
    this.set("description", Value.fromString(value));
  }

  get created(): BigInt {
    let value = this.get("created");
    return value!.toBigInt();
  }

  set created(value: BigInt) {
    this.set("created", Value.fromBigInt(value));
  }

  get dueBy(): BigInt {
    let value = this.get("dueBy");
    return value!.toBigInt();
  }

  set dueBy(value: BigInt) {
    this.set("dueBy", Value.fromBigInt(value));
  }

  get claimType(): string {
    let value = this.get("claimType");
    return value!.toString();
  }

  set claimType(value: string) {
    this.set("claimType", Value.fromString(value));
  }

  get token(): string {
    let value = this.get("token");
    return value!.toString();
  }

  set token(value: string) {
    this.set("token", Value.fromString(value));
  }

  get status(): string {
    let value = this.get("status");
    return value!.toString();
  }

  set status(value: string) {
    this.set("status", Value.fromString(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    return value!.toBytes();
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
  }

  get claimActions(): Array<string> {
    let value = this.get("claimActions");
    return value!.toStringArray();
  }

  set claimActions(value: Array<string>) {
    this.set("claimActions", Value.fromStringArray(value));
  }
}

export class Token extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("address", Value.fromBytes(Bytes.empty()));
    this.set("symbol", Value.fromString(""));
    this.set("network", Value.fromString(""));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Token entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Token entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Token", id.toString(), this);
    }
  }

  static load(id: string): Token | null {
    return changetype<Token | null>(store.get("Token", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get address(): Bytes {
    let value = this.get("address");
    return value!.toBytes();
  }

  set address(value: Bytes) {
    this.set("address", Value.fromBytes(value));
  }

  get decimals(): i32 {
    let value = this.get("decimals");
    return value!.toI32();
  }

  set decimals(value: i32) {
    this.set("decimals", Value.fromI32(value));
  }

  get symbol(): string {
    let value = this.get("symbol");
    return value!.toString();
  }

  set symbol(value: string) {
    this.set("symbol", Value.fromString(value));
  }

  get network(): string {
    let value = this.get("network");
    return value!.toString();
  }

  set network(value: string) {
    this.set("network", Value.fromString(value));
  }

  get isNative(): boolean {
    let value = this.get("isNative");
    return value!.toBoolean();
  }

  set isNative(value: boolean) {
    this.set("isNative", Value.fromBoolean(value));
  }
}

export class User extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("address", Value.fromBytes(Bytes.empty()));
    this.set("claims", Value.fromStringArray(new Array(0)));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save User entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save User entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("User", id.toString(), this);
    }
  }

  static load(id: string): User | null {
    return changetype<User | null>(store.get("User", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get address(): Bytes {
    let value = this.get("address");
    return value!.toBytes();
  }

  set address(value: Bytes) {
    this.set("address", Value.fromBytes(value));
  }

  get claims(): Array<string> {
    let value = this.get("claims");
    return value!.toStringArray();
  }

  set claims(value: Array<string>) {
    this.set("claims", Value.fromStringArray(value));
  }
}

export class BullaManager extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("address", Value.fromBytes(Bytes.empty()));
    this.set("owner", Value.fromBytes(Bytes.empty()));
    this.set("description", Value.fromString(""));
    this.set("feeCollectionAddress", Value.fromBytes(Bytes.empty()));
    this.set("lastUpdatedBlockNumber", Value.fromBigInt(BigInt.zero()));
    this.set("lastUpdatedTimestamp", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save BullaManager entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save BullaManager entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("BullaManager", id.toString(), this);
    }
  }

  static load(id: string): BullaManager | null {
    return changetype<BullaManager | null>(store.get("BullaManager", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get address(): Bytes {
    let value = this.get("address");
    return value!.toBytes();
  }

  set address(value: Bytes) {
    this.set("address", Value.fromBytes(value));
  }

  get owner(): Bytes {
    let value = this.get("owner");
    return value!.toBytes();
  }

  set owner(value: Bytes) {
    this.set("owner", Value.fromBytes(value));
  }

  get description(): string {
    let value = this.get("description");
    return value!.toString();
  }

  set description(value: string) {
    this.set("description", Value.fromString(value));
  }

  get bullaTokenAddress(): Bytes | null {
    let value = this.get("bullaTokenAddress");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set bullaTokenAddress(value: Bytes | null) {
    if (!value) {
      this.unset("bullaTokenAddress");
    } else {
      this.set("bullaTokenAddress", Value.fromBytes(<Bytes>value));
    }
  }

  get feeCollectionAddress(): Bytes {
    let value = this.get("feeCollectionAddress");
    return value!.toBytes();
  }

  set feeCollectionAddress(value: Bytes) {
    this.set("feeCollectionAddress", Value.fromBytes(value));
  }

  get feeBasisPoints(): i32 {
    let value = this.get("feeBasisPoints");
    return value!.toI32();
  }

  set feeBasisPoints(value: i32) {
    this.set("feeBasisPoints", Value.fromI32(value));
  }

  get reducedFeeBasisPoints(): i32 {
    let value = this.get("reducedFeeBasisPoints");
    return value!.toI32();
  }

  set reducedFeeBasisPoints(value: i32) {
    this.set("reducedFeeBasisPoints", Value.fromI32(value));
  }

  get bullaTokenThreshold(): i32 {
    let value = this.get("bullaTokenThreshold");
    return value!.toI32();
  }

  set bullaTokenThreshold(value: i32) {
    this.set("bullaTokenThreshold", Value.fromI32(value));
  }

  get lastUpdatedBlockNumber(): BigInt {
    let value = this.get("lastUpdatedBlockNumber");
    return value!.toBigInt();
  }

  set lastUpdatedBlockNumber(value: BigInt) {
    this.set("lastUpdatedBlockNumber", Value.fromBigInt(value));
  }

  get lastUpdatedTimestamp(): BigInt {
    let value = this.get("lastUpdatedTimestamp");
    return value!.toBigInt();
  }

  set lastUpdatedTimestamp(value: BigInt) {
    this.set("lastUpdatedTimestamp", Value.fromBigInt(value));
  }
}
