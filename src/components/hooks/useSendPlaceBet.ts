import { useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";

interface Props {
  market_id: string;
  outcome_id: string;
  amount: string;
}

function useSendPlaceBet({ market_id, outcome_id, amount }: Props) {
  const [loading, setLoading] = useState(false);
  const { requestTransaction, requestTransactionHistory, publicKey } =
    useWallet();

  const placeBet = async () => {
    console.log([`${market_id}u64`, `${outcome_id}u8`, `${amount}u64`]);
    setLoading(true);
    try {
      const result = await requestTransaction?.({
        address: publicKey || "",
        chainId: "testnetbeta",
        transitions: [
          {
            program: "raize_market_new_aleo.aleo",
            functionName: "place_bet",
            inputs: [
              `${market_id}u64`,
              `${outcome_id}u8`,
              `${Number(amount) * 10 ** 5}u64`,
            ],
          },
        ],
        fee: 300000, // fees in microcredits
        feePrivate: false,
      });
      console.log(result);
      const transactions = await requestTransactionHistory?.("raize_aleo.aleo");
      console.log("Transactions: " + transactions);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, placeBet };
}

export default useSendPlaceBet;
