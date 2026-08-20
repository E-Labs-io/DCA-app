/** @format */

"use client";

import React, { useMemo, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Divider,
  Chip,
} from "@nextui-org/react";
import { ethers, Signer } from "ethers";
import { toast } from "sonner";
import { IDCADataStructures } from "@/types/contracts/contracts/base/DCAAccount";
import { DCAAccount } from "@/types/contracts";
import { useDCAAccount } from "@/hooks/useDCAAccount";
import { useAppKitAccount } from "@reown/appkit/react";
import { intervalOptions } from "@/constants/intervals";
import {
  reinvestOptions,
  buildReinvest,
  describeReinvest,
  REINVEST_FORWARD,
  REINVEST_NONE,
} from "@/helpers/reinvest";
import { formatUnits } from "viem";

interface StrategySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: IDCADataStructures.StrategyStruct | null;
  accountContract: DCAAccount;
  signer: Signer;
}

export function StrategySettingsModal({
  isOpen,
  onClose,
  strategy,
  accountContract,
  signer,
}: StrategySettingsModalProps) {
  const { address } = useAppKitAccount();
  const { setStrategyReinvest } = useDCAAccount(accountContract, signer);

  const currentCode = strategy?.reinvest?.active
    ? Number(strategy.reinvest.investCode)
    : REINVEST_NONE;

  // Receiver currently encoded on-chain (Forward strategies only).
  const currentReceiver = useMemo(() => {
    if (!strategy?.reinvest?.active) return "";
    if (Number(strategy.reinvest.investCode) !== REINVEST_FORWARD) return "";
    try {
      const [, receiver] = ethers.AbiCoder.defaultAbiCoder().decode(
        ["uint8", "address", "address"],
        strategy.reinvest.reinvestData as string
      );
      return String(receiver);
    } catch {
      return "";
    }
  }, [strategy]);

  const [reinvestCode, setReinvestCode] = useState<number | null>(null);
  const [receiver, setReceiver] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const effectiveCode = reinvestCode ?? currentCode;
  const needsReceiver = effectiveCode === REINVEST_FORWARD;
  // Empty receiver keeps the on-chain one, else defaults to the wallet.
  const effectiveReceiver = receiver || currentReceiver || address || "";
  const receiverValid = !needsReceiver || ethers.isAddress(effectiveReceiver);
  // Dirty when the module changed OR (still Forward and) the receiver
  // differs from what's encoded on-chain — receiver-only amendments are
  // the most common edit this modal exists for.
  const dirty =
    effectiveCode !== currentCode ||
    (needsReceiver &&
      effectiveReceiver.toLowerCase() !== currentReceiver.toLowerCase());

  const summary = useMemo(() => {
    if (!strategy) return null;
    return {
      pair: `${strategy.baseToken.ticker} → ${strategy.targetToken.ticker}`,
      amount: `${formatUnits(
        BigInt(strategy.amount),
        Number(strategy.baseToken.decimals)
      )} ${strategy.baseToken.ticker}`,
      interval:
        intervalOptions.find((o) => o.value === Number(strategy.interval))
          ?.label ?? `Interval ${strategy.interval}`,
      active: Boolean(strategy.active),
      reinvestNow: describeReinvest(strategy.reinvest),
    };
  }, [strategy]);

  const handleClose = () => {
    setReinvestCode(null);
    setReceiver("");
    setSaving(false);
    onClose();
  };

  const handleSave = async () => {
    if (!strategy) return;
    setSaving(true);
    try {
      const reinvest = buildReinvest(
        String(accountContract.target),
        effectiveCode,
        {
          receiver: effectiveReceiver,
          targetTokenAddress: String(strategy.targetToken.tokenAddress),
        }
      );
      const result = await setStrategyReinvest(strategy.strategyId, reinvest);
      if (result) {
        // Reuse the provider's strategy refresh path so the row updates.
        window.dispatchEvent(
          new CustomEvent("strategy-created", {
            detail: {
              accountAddress: String(accountContract.target),
              strategyId: strategy.strategyId.toString(),
            },
          })
        );
        handleClose();
      }
    } catch (error: any) {
      if (!(error?.code === 4001 || error?.message?.includes("rejected"))) {
        toast.error(error?.message ?? "Failed to update reinvest settings");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!strategy || !summary) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isDismissable={!saving}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          Strategy #{strategy.strategyId.toString()} Settings
          <Chip size="sm" color={summary.active ? "success" : "default"}>
            {summary.active ? "Active" : "Inactive"}
          </Chip>
        </ModalHeader>
        <ModalBody className="gap-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-gray-400">Pair</span>
            <span>{summary.pair}</span>
            <span className="text-gray-400">Amount per execution</span>
            <span>{summary.amount}</span>
            <span className="text-gray-400">Interval</span>
            <span>{summary.interval}</span>
            <span className="text-gray-400">Reinvest</span>
            <span>{summary.reinvestNow}</span>
          </div>

          <Divider />

          <Select
            label="Reinvest bought tokens"
            disallowEmptySelection
            selectedKeys={[String(effectiveCode)]}
            onChange={(e) => setReinvestCode(Number(e.target.value))}
            isDisabled={saving}
          >
            {reinvestOptions.map((o) => (
              <SelectItem
                key={String(o.code)}
                value={String(o.code)}
                description={o.description}
              >
                {o.label}
              </SelectItem>
            ))}
          </Select>

          {needsReceiver && (
            <Input
              label="Receiver address"
              placeholder={currentReceiver || address || "0x…"}
              description="Each buy is sent here immediately after the swap"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              isInvalid={receiver.length > 0 && !ethers.isAddress(receiver)}
              errorMessage="Not a valid address"
              isDisabled={saving}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose} isDisabled={saving}>
            Close
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={saving}
            isDisabled={!dirty || !receiverValid}
          >
            Save Reinvest
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
