import { useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { fetchData } from "../services/api";
import { bigIntToString, stringToBigInt } from "leostringer";

function useClaimWinnings() {
  const [loading, setLoading] = useState(false);
  const [userWinnings, setUserWinnings] = useState(false);
  const { requestTransaction, requestTransactionHistory, publicKey } =
    useWallet();

  const ClaimWinnings = async (bet: any) => {
    setLoading(true);
    console.log(
      JSON.stringify(bet.data),
      bet,
      typeof JSON.stringify(bet.data),
      bigIntToString(
        BigInt(
          1224480463811635783132078430968584093512141773606571953954052417473122091549
        )
      ),
      stringToBigInt(JSON.stringify(bet.data)),
      "bet"
    );
    try {
      const result = await requestTransaction?.({
        address: publicKey || "",
        chainId: "testnetbeta",
        transitions: [
          {
            program: "raize_market_new_aleo.aleo",
            functionName: "set_user_winnings",
            inputs: [bet],
          },
        ],
        fee: 300000, // fees in microcredits
        feePrivate: false,
      });
      setUserWinnings(true);
      console.log(result);
      const transactions = await requestTransactionHistory?.(
        "raize_market_new_aleo.aleo"
      );
      console.log("Transactions: " + transactions);
    } catch (error) {
      console.log(error, "ClaimWinnings");
    } finally {
      setLoading(false);
    }
  };

  const ClaimTransfer = async () => {
    try {
      const amount = await fetchData(
        "user_winnings",
        publicKey?.toString() as string
      );
      console.log(amount, amount.match(/\s*(\d+)u64/)[1]);
      const result = await requestTransaction?.({
        address: publicKey || "",
        chainId: "testnetbeta",
        transitions: [
          {
            program: "raize_market_new_aleo.aleo",
            functionName: "claim_winnings",
            inputs: [`${amount.match(/\s*(\d+)u64/)[1]}u64`],
          },
        ],
        fee: 300000, // fees in microcredits
        feePrivate: false,
      });
      console.log(result);
      const transactions = await requestTransactionHistory?.(
        "raize_market_new_aleo.aleo"
      );
      console.log("Transactions: " + transactions);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, ClaimWinnings, userWinnings, ClaimTransfer };
}

export default useClaimWinnings;
