import {
  TezosToolkit,
  ContractAbstraction,
  Wallet,
  BigMapAbstraction,
} from "@taquito/taquito";
import axios from "axios";

interface ExecResult {
  protocol?: string;
  contract?: string;
  network?: string;
  path?: string;
  rpcUrl?: string;
  error?: string;
  result?: any;
}

enum TokenType {
  PROTOCOL = "PROTOCOL",
  CONTRACT = "CONTRACT",
  NETWORK = "NETWORK",
  PATH = "PATH",
}

interface Token {
  tokenType: TokenType;
  value: string;
}

const rpcMap: Record<string, string> = {
  mainnet: "https://mainnet.smartpy.io",
  ghostnet: "https://ghostnet.smartpy.io",
  // Add more networks and their RPC URLs as needed
};

// Function to convert hex to string
function hexToString(hex: string): string {
  const hexWithoutPrefix = hex.startsWith("0x") ? hex.slice(2) : hex;
  let str = "";
  for (let i = 0; i < hexWithoutPrefix.length; i += 2) {
    const charCode = parseInt(hexWithoutPrefix.substr(i, 2), 16);
    str += String.fromCharCode(charCode);
  }
  return str;
}

async function fetchBigMapEntries(bigMapId: number, rpcUrl: string) {
  const bigMapEndpoint = `${rpcUrl}/chains/main/blocks/head/context/big_maps/${bigMapId}`;
  try {
    const response = await axios.get(bigMapEndpoint);
    console.log("Big Map Entries:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Big Map contents:", (error as Error).message);
    throw error;
  }
}

export async function executeTokens(tokens: Token[]): Promise<ExecResult> {
  const result: ExecResult = {};

  for (const token of tokens) {
    switch (token.tokenType) {
      case TokenType.PROTOCOL:
        result.protocol = token.value;
        break;
      case TokenType.CONTRACT:
        result.contract = token.value;
        break;
      case TokenType.NETWORK:
        result.network = token.value;
        result.rpcUrl = rpcMap[token.value];
        break;
      case TokenType.PATH:
        result.path = token.value;
        break;
      default:
        result.error = `Unknown token type: ${token.tokenType}`;
    }
  }

  if (result.contract && result.path && result.rpcUrl) {
    try {
      const tezos = new TezosToolkit(result.rpcUrl);
      const contract: ContractAbstraction<Wallet> = await tezos.wallet.at(
        result.contract
      );
      const storage: any = await contract.storage();

      console.log("Contract Storage:", storage);

      if (storage instanceof BigMapAbstraction) {
        // Convert bigMapId to a number if it's a string
        const bigMapId = Number(storage.toString()); // Ensure bigMapId is a number

        // Use axios to fetch the big map entries
        const entries = await fetchBigMapEntries(bigMapId, result.rpcUrl);

        // Log the entire entry to inspect its structure
        console.log("Big Map Entries Structure:", entries);

        // Decode the bytes to access the key
        const availableKeys = entries.map((entry: any) => {
          const decodedValue = hexToString(entry.bytes);
          console.log("Decoded Value:", decodedValue);
          return decodedValue;
        });

        // Log the available keys in the big map
        console.log("Available Big Map Keys:", availableKeys);

        // Find the entry for the given path
        const metadataEntry = entries.find((entry: any) => {
          const decodedValue = hexToString(entry.bytes);
          // Ensure result.path is defined before comparison
          return result.path ? decodedValue.includes(result.path) : false;
        });

        if (metadataEntry) {
          result.result = hexToString(metadataEntry.bytes);
        } else {
          console.error(`Metadata not found for path: ${result.path}`);
          result.error = `Metadata not found for path: ${result.path}`;
        }
      } else {
        result.error = "Metadata big-map not found in storage.";
      }
    } catch (error) {
      result.error = `Failed to fetch metadata: ${(error as Error).message}`;
    }
  }

  return result;
}
