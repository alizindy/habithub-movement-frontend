import { isSendableNetwork, aptosClient } from "@/utils";
import { parseTypeTag, AccountAddress, U64 } from "@aptos-labs/ts-sdk";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-core";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { TransactionHash } from "../TransactionHash";
import { CreateCampaignData } from "@/lib/type/CreateCampaign";
import { createCampaign } from "@/entry-functions/createCampaign";
import { useEffect, useState } from "react";
import { viewModuleFunction } from "@/entry-functions/viewCampaign";

const APTOS_COIN = "0x1::aptos_coin::AptosCoin";

// ✅ **New state for campaign data**
const initialCampaignData: CreateCampaignData = {
  name: "Testing Campaign Petra",
  duration: 9000,
  rewardPool: 3000,
  rewardPerSubmit: 300,
  maxParticipant: 10,
  dataType: "Image",
  dataValidateType: "Shopping Receipt",
};

export function SingleSigner() {
  const { toast } = useToast();
  const {
    connected,
    account,
    network,
    signAndSubmitTransaction,
    signMessageAndVerify,
    signMessage,
    signTransaction,
  } = useWallet();
  let sendable = isSendableNetwork(connected, network?.name);

  const [campaign, setCampaign] = useState(initialCampaignData);

  const onSignMessageAndVerify = async () => {
    const payload = {
      message: "Hello from Aptos Wallet Adapter",
      nonce: Math.random().toString(16),
    };
    const response = await signMessageAndVerify(payload);
    toast({
      title: "Success",
      description: JSON.stringify({ onSignMessageAndVerify: response }),
    });
  };

  const onSignMessage = async () => {
    const payload = {
      message: "Hello from Aptos Wallet Adapter",
      nonce: Math.random().toString(16),
    };
    const response = await signMessage(payload);
    toast({
      title: "Success",
      description: JSON.stringify({ onSignMessage: response }),
    });
  };

  const onSignAndCreateCampaign = async () => {
    if (!account) return;
    try {
      const response = await signAndSubmitTransaction(createCampaign({
        name: campaign.name,
        duration: campaign.duration,
        rewardPool: campaign.rewardPool,
        rewardPerSubmit: campaign.rewardPerSubmit,
        maxParticipant: campaign.maxParticipant,
        dataType: campaign.dataType,
        dataValidateType: campaign.dataValidateType,
      }));
      await aptosClient(network).waitForTransaction({
        transactionHash: response.hash,
      });
      toast({
        title: "Success",
        description: <TransactionHash hash={response.hash} network={network} />,
      });
    } catch (error) {
      console.error(error);
    }
  }

  const onSignAndSubmitTransaction = async () => {
    if (!account) return;
    const transaction: InputTransactionData = {
      data: {
        function: "0x1::coin::transfer",
        typeArguments: [APTOS_COIN],
        functionArguments: [account.address, 1], // 1 is in Octas
      },
    };
    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptosClient(network).waitForTransaction({
        transactionHash: response.hash,
      });
      toast({
        title: "Success",
        description: <TransactionHash hash={response.hash} network={network} />,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onSignAndSubmitScriptTransaction = async () => {
    if (!account) return;
    const transaction: InputTransactionData = {
      data: {
        bytecode:
          "0xa11ceb0b0700000a06010002030206050806070e2508334010731f010200030001000103060c050300083c53454c463e5f30046d61696e0d6170746f735f6163636f756e74087472616e73666572ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000000114636f6d70696c6174696f6e5f6d65746164617461090003322e3003322e31000001050b000b010b02110002",
        typeArguments: [],
        functionArguments: [account.address, new U64(1)], // 1 is in Octas
      },
    };
    try {
      const response = await signAndSubmitTransaction(transaction);
      await aptosClient(network).waitForTransaction({
        transactionHash: response.hash,
      });
      toast({
        title: "Success",
        description: <TransactionHash hash={response.hash} network={network} />,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onSignAndSubmitBCSTransaction = async () => {
    if (!account) return;

    try {
      const response = await signAndSubmitTransaction({
        data: {
          function: "0x1::coin::transfer",
          typeArguments: [parseTypeTag(APTOS_COIN)],
          functionArguments: [AccountAddress.from(account.address), new U64(1)], // 1 is in Octas
        },
      });
      await aptosClient(network).waitForTransaction({
        transactionHash: response.hash,
      });
      toast({
        title: "Success",
        description: <TransactionHash hash={response.hash} network={network} />,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Legacy typescript sdk support
  const onSignTransaction = async () => {
    try {
      const payload: InputTransactionData = {
        data: {
          function: "0x1::coin::transfer",
          typeArguments: [APTOS_COIN],
          functionArguments: [account?.address.toString(), 1],
        },
      };
      const response = await signTransaction({
        transactionOrPayload: payload,
      });
      toast({
        title: "Success",
        description: JSON.stringify(response),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onSignRawTransaction = async () => {
    if (!account) return;

    try {
      const transactionToSign = await aptosClient(
        network,
      ).transaction.build.simple({
        sender: account.address,
        data: {
          function: "0x1::coin::transfer",
          typeArguments: [APTOS_COIN],
          functionArguments: [account.address.toString(), 1],
        },
      });
      const response = await signTransaction({
        transactionOrPayload: transactionToSign,
      });
      toast({
        title: "Success",
        description: JSON.stringify(response),
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Single Signer Flow</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Button onClick={onSignAndSubmitTransaction} disabled={!sendable}>
          Sign and submit transaction
        </Button>
        <Button onClick={onSignAndSubmitScriptTransaction} disabled={!sendable}>
          Sign and submit script transaction
        </Button>
        <Button onClick={onSignAndSubmitBCSTransaction} disabled={!sendable}>
          Sign and submit BCS transaction
        </Button>
        <Button onClick={onSignTransaction} disabled={!sendable}>
          Sign transaction
        </Button>
        <Button onClick={onSignRawTransaction} disabled={!sendable}>
          Sign raw transaction
        </Button>
        <Button onClick={onSignMessage} disabled={!sendable}>
          Sign message
        </Button>
        <Button onClick={onSignMessageAndVerify} disabled={!sendable}>
          Sign message and verify
        </Button>
        <Button onClick={onSignAndCreateCampaign}>
          Sign and Create Campaign
        </Button>
      </CardContent>
    </Card>
  );
}
