import { validateAddress, ValidationResult } from "@taquito/utils";

enum TokenType {
  PROTOCOL = "PROTOCOL",
  CONTRACT = "CONTRACT",
  NETWORK = "NETWORK",
  PATH = "PATH",
}

enum TezosNetwork {
  MAINNET = "mainnet",
  GHOSTNET = "ghostnet",
  // update this with more networks
}

interface Token {
  tokenType: TokenType;
  value: string;
}

export function parseTezosUri(
  uri: string,
  currentContract: string,
  currentNetwork: string
): { tokens: Token[]; error?: string } {
  const tokens: Token[] = [];
  let pointer = 0;

  function peek(offset: number) {
    return uri[pointer + offset];
  }

  try {
    // grab protocol
    const protocolEndIndex = uri.indexOf("://");
    if (protocolEndIndex !== -1) {
      const protocol = uri.substring(0, protocolEndIndex);
      if (
        ["tezos-storage", "sha256", "http", "https", "ipfs"].includes(protocol)
      ) {
        tokens.push({
          tokenType: TokenType.PROTOCOL,
          value: protocol,
        });
        pointer = protocolEndIndex + 3; // Move pointer past "://"
      } else {
        throw new Error(
          "Invalid Protocol, must be one of tezos-storage, sha256, http, https, or ipfs"
        );
      }
    } else {
      throw new Error("Invalid URI: Missing protocol");
    }

    // grab contract
    let contract = "";
    if (peek(0) !== "." && peek(0) !== "/" && pointer < uri.length) {
      while (peek(0) !== "." && peek(0) !== "/" && pointer < uri.length) {
        contract += uri[pointer];
        pointer++;
      }
    }
    // Use default if no contract in URI
    if (!contract) {
      contract = currentContract;
    }
    if (validateAddress(contract) !== ValidationResult.VALID) {
      throw new Error("Invalid Tezos contract address");
    }
    tokens.push({
      tokenType: TokenType.CONTRACT,
      value: contract,
    });

    // grab network
    let network = currentNetwork;
    if (peek(0) === ".") {
      pointer++;
      network = "";
      while (peek(0) !== "/" && pointer < uri.length) {
        network += uri[pointer];
        pointer++;
      }
    }
    if (!Object.values(TezosNetwork).includes(network as TezosNetwork)) {
      throw new Error("Invalid Tezos network");
    }
    tokens.push({
      tokenType: TokenType.NETWORK,
      value: network,
    });

    // grab path
    if (peek(0) === "/") {
      pointer++;
      let path = "";
      while (pointer < uri.length) {
        path += uri[pointer];
        pointer++;
      }

      // Check for empty path
      if (path === "") {
        throw new Error("Invalid URI: Path cannot be empty");
      }

      // Decode percent-encoded characters, if necessary
      try {
        path = decodeURIComponent(path);
      } catch (e) {
        throw new Error("Invalid percent-encoding in path");
      }

      // Validate that the path does not contain unencoded slashes
      if (path.includes("/")) {
        throw new Error(
          "Path contains unencoded slashes, use percent encoding `%2F`"
        );
      }

      tokens.push({
        tokenType: TokenType.PATH,
        value: path,
      });
    } else {
      throw new Error("Invalid URI: Missing path");
    }

    return { tokens };
  } catch (error) {
    return { tokens, error: (error as Error).message };
  }
}
