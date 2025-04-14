import { useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { fetchData } from "../services/api";

interface Bet {
  data: string;
}

function useClaimWinnings() {
  const [loading, setLoading] = useState(false);
  const [userWinnings, setUserWinnings] = useState(false);
  const { requestTransaction, requestTransactionHistory, publicKey } =
    useWallet();

  const claimWinnings = async (bet: Bet) => {
    if (!publicKey || !requestTransaction) {
      console.warn("Wallet not connected or requestTransaction unavailable.");
      return;
    }

    setLoading(true);
    try {
      const result = await requestTransaction({
        address: publicKey,
        chainId: "testnetbeta",
        transitions: [
          {
            program: "raize_market_new_aleo.aleo",
            functionName: "set_user_winnings",
            inputs: [bet],
          },
        ],
        fee: 300_000, // microcredits
        feePrivate: false,
      });

      setUserWinnings(true);
      console.log("Winnings claimed:", result);

      const transactions = await requestTransactionHistory?.(
        "raize_market_new_aleo.aleo"
      );
      console.log("Transaction history:", transactions);
    } catch (error) {
      console.error("Error during claimWinnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const claimTransfer = async () => {
    if (!publicKey || !requestTransaction) {
      console.warn("Wallet not connected or requestTransaction unavailable.");
      return;
    }

    setLoading(true);
    try {
      const rawAmount = await fetchData("user_winnings", publicKey);
      const amountMatch = rawAmount?.match(/\s*(\d+)u64/);
      const parsedAmount = amountMatch?.[1];

      if (!parsedAmount) {
        throw new Error("Unable to parse user winnings amount.");
      }

      const result = await requestTransaction({
        address: publicKey,
        chainId: "testnetbeta",
        transitions: [
          {
            program: "raize_market_new_aleo.aleo",
            functionName: "claim_winnings",
            inputs: [`${parsedAmount}u64`],
          },
        ],
        fee: 300_000,
        feePrivate: false,
      });

      console.log("Transfer claimed:", result);

      const transactions = await requestTransactionHistory?.(
        "raize_market_new_aleo.aleo"
      );
      console.log("Transaction history:", transactions);
    } catch (error) {
      console.error("Error during claimTransfer:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    userWinnings,
    claimWinnings,
    claimTransfer,
  };
}

export default useClaimWinnings;
