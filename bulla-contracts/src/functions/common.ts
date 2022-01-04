import { Address, Bytes, dataSource } from "@graphprotocol/graph-ts";
import { encode } from "as-base58";
import { ClaimCreatedClaimAttachmentStruct } from "../../generated/BullaClaimERC721/BullaClaimERC721";
import { ERC20 } from "../../generated/BullaClaimERC721/ERC20";
import { Token, User } from "../../generated/schema";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const EMPTY_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const getOrCreateUser = (address: Address): User => {
  let user = User.load(address.toHexString());
  if (!user) {
    user = new User(address.toHexString());
    user.address = address;
  }

  return user;
};

export const getOrCreateToken = (tokenAddress: Address): Token => {
  let token = Token.load(tokenAddress.toHexString());
  if (token == null) {
    const TokenContract = ERC20.bind(tokenAddress);
    token = new Token(tokenAddress.toHexString());
    token.address = tokenAddress;
    token.decimals = TokenContract.decimals();
    token.symbol = TokenContract.symbol();
    token.isNative = tokenAddress.equals(Address.zero());
    token.chainId = dataSource.network();
    token.save();
  }
  return token;
};

export const multihashStructToBase58 = (
  hash: Bytes,
  size: u32,
  hashFunction: u32
): string => {
  const hashBuffer = new Uint8Array(34);
  hashBuffer[0] = hashFunction;
  hashBuffer[1] = size;
  hashBuffer.set(hash, 2);

  return encode(hashBuffer);
};

export const getIPFSHash = (
  attachment: ClaimCreatedClaimAttachmentStruct
): string | null => {
  if (attachment.hash.equals(Bytes.fromHexString(EMPTY_BYTES32))) return null;
  const ipfsHash = multihashStructToBase58(
    attachment.hash,
    attachment.size,
    attachment.hashFunction
  );
  return ipfsHash;
};
