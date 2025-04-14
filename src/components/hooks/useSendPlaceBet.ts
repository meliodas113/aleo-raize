import { useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";

interface Props {
  market_id: string;
  outcome_id: string;
  amount: string; // Expected to be numeric string (e.g. "10")
}

function useSendPlaceBet({ market_id, outcome_id, amount }: Props) {
  const [loading, setLoading] = useState(false);
  const { publicKey, requestTransaction, requestTransactionHistory } =
    useWallet();

  const placeBet = async () => {
    if (!publicKey || !requestTransaction) {
      console.warn("Wallet not connected or transaction function unavailable.");
      return;
    }

    const formattedInputs = [
      `${market_id}u64`,
      `${outcome_id}u8`,
      `${Math.floor(Number(amount) * 10 ** 5)}u64`,
    ];

    console.log("Placing bet with inputs:", formattedInputs);

    setLoading(true);

    try {
      const result = await requestTransaction({
        address: publicKey,
        chainId: "testnetbeta",
        transitions: [
          {
            program: "raize_market_new_aleo.aleo",
            functionName: "place_bet",
            inputs: formattedInputs,
          },
        ],
        fee: 300_000, // microcredits
        feePrivate: false,
      });

      console.log("Transaction result:", result);

      const transactions = await requestTransactionHistory?.("raize_aleo.aleo");
      console.log("Transaction history:", transactions);
    } catch (error) {
      console.error("Error placing bet:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    placeBet,
  };
}

export default useSendPlaceBet;
