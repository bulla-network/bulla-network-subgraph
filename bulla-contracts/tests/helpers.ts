import { Address, BigInt, ByteArray, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { ADDRESS_ZERO as addressZeroString } from "../src/functions/common";

// Add this line to make the changetype directive available
import "matchstick-as/assembly/index";

export const TX_HASH = "0x39d02b6c00bca9eecbaa7363d61f1ac1c096e2a71600af3c30108103ee846018";
export const TX_HASH_BYTES: Bytes = changetype<Bytes>(Bytes.fromHexString(TX_HASH));
export const DEFAULT_TIMESTAMP = BigInt.fromI32(1641511670);
export const IPFS_HASH = "QmUuT6LyXrN3DwQh7YvFBe63fPLcqJKD2iW4j2tJhqh5X9";
export const MULTIHASH_BYTES = "0x618d2742203889e41eaae366739084c022f7e01a34639b7f2e0af7e6eb2bf064";
export const MULTIHASH_SIZE = 32;
export const MULTIHASH_FUNCTION = 18;
// the string "testing 1234" as bytes32 encoded
export const DESCRIPTION_BYTES: Bytes = changetype<Bytes>(ByteArray.fromHexString("0x74657374696e6720313233340000000000000000000000000000000000000000"));
export const CLAIM_DESCRIPTION = "testing 1234";
export const INSTAPAY_DESCRIPTION = "insta payment: testing 1234";
export const DEFAULT_ACCOUNT_TAG = "test tag";
export const ONE_ETH = "1000000000000000000";
export const MOCK_WETH_ADDRESS = Address.fromString("0xc778417e063141139fce010982780140aa0cd5ab");
export const MOCK_MANAGER_ADDRESS = Address.fromString("0xd33abDe96F344FDe00B65650c8f68875D4c9e18B");
export const MOCK_CLAIM_ADDRRESS = Address.fromString("0xC5E586BE8C2ae78dFbeBc41CB9232f652A837330");
export const MOCK_BANKER_ADDRESS = Address.fromString("0xf1f41946c288246b2d6e4E16Cb077a07B93CBE9a");
export const MOCK_INSTANT_PAYMENT_ADDRESS = Address.fromString("0xf1f41946c288246b2d6e4E16Cb077a07B93CBE9a");
export const MOCK_SAFE_ADDRESS = Address.fromString("0x2270B1f2996327eB772351ee8c5dbF98f9FD2FcF");
export const MOCK_SAFE_MODULE_ADDRESS = Address.fromString("0x70b841D46d227D458D9396e0c90A961e2B9D7a63");
export const MOCK_BULLA_TOKEN_ADDRESS = Address.fromString("0x90104Ff9aCd8EDB22BD5D030a11A1c2c66d95142");
export const MOCK_BULLA_FACTORING_ADDRESS = Address.fromString("0xd33abDe96F344FDe00B65650c8f68875D4c9e18A");
export const MOCK_BULLA_SWAP_ADDRESS = Address.fromString("0x90104Ff9aCd8EDB22BD5D030a11A1c2c66d95142");
export const ADDRESS_ZERO = Address.fromString(addressZeroString);
export const ADDRESS_1 = Address.fromString("0xb8c18E036d46c5FB94d7DeBaAeD92aFabe65EE61");
export const ADDRESS_2 = Address.fromString("0xe2B28b58cc5d34872794E861fd1ba1982122B907");
export const ADDRESS_3 = Address.fromString("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
export const ADDRESS_4 = Address.fromString("0xd8da6bf26964af9d7eed9e03e53415d37aa96017");
export const FEE_RECEIVER = ADDRESS_1;
export const FEE_BPS = BigInt.fromU64(5);

export const getFeeAmount = (amount: BigInt): BigInt => amount.times(FEE_BPS).div(BigInt.fromU32(10000));

export const toEthString = (value: string): ethereum.Value => ethereum.Value.fromString(value);

export const toEthAddress = (value: Address): ethereum.Value => ethereum.Value.fromAddress(value);

export const toUint256 = (value: BigInt): ethereum.Value => ethereum.Value.fromUnsignedBigInt(value);

export const setupContracts = (): void => {
  /** setup WETH */
  createMockedFunction(MOCK_WETH_ADDRESS, "decimals", "decimals():(uint8)").returns([ethereum.Value.fromI32(18)]);
  createMockedFunction(MOCK_WETH_ADDRESS, "symbol", "symbol():(string)").returns([ethereum.Value.fromString("WETH")]);

  /** setup BullaToken token */
  createMockedFunction(MOCK_BULLA_TOKEN_ADDRESS, "decimals", "decimals():(uint8)").returns([ethereum.Value.fromI32(18)]);
  createMockedFunction(MOCK_BULLA_TOKEN_ADDRESS, "symbol", "symbol():(string)").returns([ethereum.Value.fromString("BULLA")]);

  /** setup mock decimals and symbols for ADDRESS_2 and ADDRESS_4 */
  createMockedFunction(ADDRESS_2, "decimals", "decimals():(uint8)").returns([ethereum.Value.fromI32(18)]);
  createMockedFunction(ADDRESS_2, "symbol", "symbol():(string)").returns([ethereum.Value.fromString("TKN2")]);

  createMockedFunction(ADDRESS_4, "decimals", "decimals():(uint8)").returns([ethereum.Value.fromI32(18)]);
  createMockedFunction(ADDRESS_4, "symbol", "symbol():(string)").returns([ethereum.Value.fromString("TKN4")]);

  /** setup BullaManager */
  createMockedFunction(MOCK_MANAGER_ADDRESS, "description", "description():(bytes32)").returns([ethereum.Value.fromBytes(DESCRIPTION_BYTES)]);

  createMockedFunction(MOCK_BULLA_FACTORING_ADDRESS, "pricePerShare", "pricePerShare():(uint256)").returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000))]);

  createMockedFunction(MOCK_BULLA_FACTORING_ADDRESS, "calculateTargetFees", "calculateTargetFees(uint256,uint16):(uint256,uint256,uint256,uint256,uint256)")
    .withArgs([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)), // invoiceId
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)), // upfrontBps
    ])
    .returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100000)), // fundedAmountGross
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)), // adminFee
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(5000)), // targetInterest
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000)), // targetProtocolFee
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(116000)), // netFundedAmount
    ]);

  // Add another mock for invoice ID 2
  createMockedFunction(MOCK_BULLA_FACTORING_ADDRESS, "calculateTargetFees", "calculateTargetFees(uint256,uint16):(uint256,uint256,uint256,uint256,uint256)")
    .withArgs([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2)), // invoiceId
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)), // upfrontBps
    ])
    .returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100000)), // fundedAmountGross
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)), // adminFee
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(5000)), // targetInterest
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000)), // targetProtocolFee
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(116000)), // netFundedAmount
    ]);

  createMockedFunction(MOCK_BULLA_FACTORING_ADDRESS, "taxBps", "taxBps():(uint16)").returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(500))]); // Assuming a 5% tax (500 basis points)

  createMockedFunction(
    MOCK_BULLA_FACTORING_ADDRESS,
    "approvedInvoices",
    "approvedInvoices(uint256):(bool,(uint256,address,address,uint256,address,uint256,bool),uint256,uint256,uint16,uint16,uint256,uint256,uint16,uint256,uint16,uint16)",
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))])
    .returns([
      ethereum.Value.fromBoolean(true),
      ethereum.Value.fromTuple(
        changetype<ethereum.Tuple>([
          ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
          ethereum.Value.fromAddress(ADDRESS_1),
          ethereum.Value.fromAddress(ADDRESS_1),
          ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
          ethereum.Value.fromAddress(ADDRESS_1),
          ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
          ethereum.Value.fromBoolean(false),
        ]),
      ),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(9000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)),
    ]);

  // Add another mock for invoice ID 2
  createMockedFunction(
    MOCK_BULLA_FACTORING_ADDRESS,
    "approvedInvoices",
    "approvedInvoices(uint256):(bool,(uint256,address,address,uint256,address,uint256,bool),uint256,uint256,uint16,uint16,uint256,uint256,uint16,uint256,uint16,uint16)",
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2))])
    .returns([
      ethereum.Value.fromBoolean(true),
      ethereum.Value.fromTuple(
        changetype<ethereum.Tuple>([
          ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
          ethereum.Value.fromAddress(ADDRESS_1),
          ethereum.Value.fromAddress(ADDRESS_1),
          ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
          ethereum.Value.fromAddress(ADDRESS_1),
          ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
          ethereum.Value.fromBoolean(false),
        ]),
      ),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(9000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)),
    ]);

  createMockedFunction(
    MOCK_BULLA_FACTORING_ADDRESS,
    "approvedInvoices",
    "approvedInvoices(uint256):(bool,(uint256,address,address,uint256,address,uint256,bool),uint256,uint256,uint16,uint16,uint256,uint256,uint256,uint16,uint256)",
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))])
    .returns([
      ethereum.Value.fromBoolean(true),
      ethereum.Value.fromTuple(
        changetype<ethereum.Tuple>([
          ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
          ethereum.Value.fromAddress(ADDRESS_1),
          ethereum.Value.fromAddress(ADDRESS_1),
          ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
          ethereum.Value.fromAddress(ADDRESS_1),
          ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
          ethereum.Value.fromBoolean(false),
        ]),
      ),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)), // fundedAmountGross
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)), // fundedAmountNet
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(9000)), // upfrontBps
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)), // adminFeeBps
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)), // adminFee
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)), // targetInterest
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)), // targetProtocolFee
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)), // protocolFeeBps
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)), // timestamp
    ]);

  // Add another mock for invoice ID 2
  createMockedFunction(
    MOCK_BULLA_FACTORING_ADDRESS,
    "approvedInvoices",
    "approvedInvoices(uint256):(bool,(uint256,address,address,uint256,address,uint256,bool),uint256,uint256,uint16,uint16,uint256,uint256,uint256,uint16,uint256)",
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2))])
    .returns([
      ethereum.Value.fromBoolean(true),
      ethereum.Value.fromTuple(
        changetype<ethereum.Tuple>([
          ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
          ethereum.Value.fromAddress(ADDRESS_1),
          ethereum.Value.fromAddress(ADDRESS_1),
          ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
          ethereum.Value.fromAddress(ADDRESS_1),
          ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
          ethereum.Value.fromBoolean(false),
        ]),
      ),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)), // fundedAmountGross
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)), // fundedAmountNet
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(9000)), // upfrontBps
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)), // adminFeeBps
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)), // adminFee
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)), // targetInterest
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)), // targetProtocolFee
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)), // protocolFeeBps
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)), // timestamp
    ]);

  createMockedFunction(MOCK_BULLA_FACTORING_ADDRESS, "protocolFeeBps", "protocolFeeBps():(uint16)").returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(500))]); // Example: 5% protocol fee (500 basis points)

  updateFundInfoMock(BigInt.fromI32(10000), BigInt.fromI32(5000), BigInt.fromI32(15000));
};

export const updatePricePerShareMock = (newPrice: BigInt): void => {
  createMockedFunction(MOCK_BULLA_FACTORING_ADDRESS, "pricePerShare", "pricePerShare():(uint256)").returns([ethereum.Value.fromUnsignedBigInt(newPrice)]);
};

createMockedFunction(
  MOCK_BULLA_FACTORING_ADDRESS,
  "getFundInfo",
  "getFundInfo():((string,uint256,uint256,uint256,int256,uint256,uint256,uint256,uint16,uint256,uint256))",
).returns([
  ethereum.Value.fromTuple(
    changetype<ethereum.Tuple>([
      ethereum.Value.fromString("MockFundName"),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)), // creationTimestamp
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10000)), // fundBalance
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(5000)), // deployedCapital
      ethereum.Value.fromSignedBigInt(BigInt.fromI32(15000)), // capitalAccount
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(20000)), // totalFundedAmount
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(18000)), // totalRepaidAmount
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2000)), // totalDefaultedAmount
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(500)), // defaultRate
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000)), // averageInterestRate
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(30)), // averageDuration
    ]),
  ),
]);

export function updateFundInfoMock(
  fundBalance: BigInt,
  deployedCapital: BigInt,
  capitalAccount: BigInt,
  creationTimestamp: BigInt = BigInt.fromI32(1000000),
  totalFundedAmount: BigInt = BigInt.fromI32(0),
  totalRepaidAmount: BigInt = BigInt.fromI32(0),
  defaultRate: number = 0,
  averageInterestRate: BigInt = BigInt.fromI32(0),
  averageDuration: BigInt = BigInt.fromI32(0),
): void {
  // Convert defaultRate to a BigInt first
  const defaultRateBigInt = BigInt.fromI32(changetype<i32>(defaultRate));

  createMockedFunction(
    MOCK_BULLA_FACTORING_ADDRESS,
    "getFundInfo",
    "getFundInfo():((string,uint256,uint256,uint256,uint256,uint256,uint256,uint16,uint256,uint256))",
  ).returns([
    ethereum.Value.fromTuple(
      changetype<ethereum.Tuple>([
        ethereum.Value.fromString("MockFundName"),
        ethereum.Value.fromUnsignedBigInt(creationTimestamp),
        ethereum.Value.fromUnsignedBigInt(fundBalance), // This is the fundBalance
        ethereum.Value.fromUnsignedBigInt(deployedCapital), // This is deployedCapital
        ethereum.Value.fromUnsignedBigInt(capitalAccount), // This is capitalAccount
        ethereum.Value.fromUnsignedBigInt(totalFundedAmount),
        ethereum.Value.fromUnsignedBigInt(totalRepaidAmount),
        ethereum.Value.fromUnsignedBigInt(defaultRateBigInt),
        ethereum.Value.fromUnsignedBigInt(averageInterestRate),
        ethereum.Value.fromUnsignedBigInt(averageDuration),
      ]),
    ),
  ]);
}

export const afterEach = (): void => {
  clearStore();
};
