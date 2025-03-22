"use client";
import { NextPage } from "next";
import "./styles.scss";

import { useState } from "react";
import { useConnect } from "@starknet-react/core";

import WalletModal from "./WalletModal";

import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import "@demox-labs/aleo-wallet-adapter-reactui/dist/styles.css";

interface Props {}

const ConnectWallet: NextPage<Props> = ({}) => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false);
  const handleOpen = () => setOpenWalletModal(true);
  const handleClose = () => {
    setOpenWalletModal(false);
  };
  return (
    <>
      <WalletMultiButton />
      {/* <WalletModal open={openWalletModal} handleClose={handleClose} /> */}
    </>
  );
};

export default ConnectWallet;
