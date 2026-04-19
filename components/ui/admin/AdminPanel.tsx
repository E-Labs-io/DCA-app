/** @format */

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
} from "@nextui-org/react";
import { useExecutorAdmin } from "@/hooks/useExecutorAdmin";
import { toast } from "sonner";

export function AdminPanel() {
  const { loading, addAdmin, removeAdmin, checkIfAdmin } = useExecutorAdmin();

  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [removeAdminAddress, setRemoveAdminAddress] = useState("");
  const [checkAdminAddress, setCheckAdminAddress] = useState("");
  const [adminCheckResult, setAdminCheckResult] = useState<boolean | null>(
    null
  );

  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();
  const {
    isOpen: isRemoveModalOpen,
    onOpen: onRemoveModalOpen,
    onClose: onRemoveModalClose,
  } = useDisclosure();

  const handleAddAdmin = async () => {
    if (!newAdminAddress) {
      toast.error("Please enter an admin address");
      return;
    }

    try {
      const result = await addAdmin(newAdminAddress);
      if (result.success) {
        toast.success("Admin added successfully");
        setNewAdminAddress("");
        onAddModalClose();
      } else {
        toast.error("Failed to add admin");
      }
    } catch (error) {
      toast.error("Error adding admin");
    }
  };

  const handleRemoveAdmin = async () => {
    if (!removeAdminAddress) {
      toast.error("Please enter an admin address");
      return;
    }

    try {
      const result = await removeAdmin(removeAdminAddress);
      if (result.success) {
        toast.success("Admin removed successfully");
        setRemoveAdminAddress("");
        onRemoveModalClose();
      } else {
        toast.error("Failed to remove admin");
      }
    } catch (error) {
      toast.error("Error removing admin");
    }
  };

  const handleCheckAdmin = async () => {
    if (!checkAdminAddress) {
      toast.error("Please enter an address");
      return;
    }

    try {
      const isAdmin = await checkIfAdmin(checkAdminAddress);
      setAdminCheckResult(isAdmin);
    } catch (error) {
      toast.error("Error checking admin status");
      setAdminCheckResult(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-xl font-semibold">Admin Management</h3>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Admin Actions */}
        <div>
          <h4 className="font-medium mb-4">Admin Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              color="success"
              variant="solid"
              onPress={onAddModalOpen}
              isDisabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-medium"
            >
              Add Admin
            </Button>
            <Button
              color="danger"
              variant="solid"
              onPress={onRemoveModalOpen}
              isDisabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-medium"
            >
              Remove Admin
            </Button>
          </div>
        </div>

        <Divider />

        {/* Check Admin Status */}
        <div>
          <h4 className="font-medium mb-4">Check Admin Status</h4>
          <div className="flex gap-3">
            <Input
              placeholder="Enter address to check..."
              value={checkAdminAddress}
              onValueChange={setCheckAdminAddress}
              variant="flat"
              color="default"
              className="flex-1"
              classNames={{
                input: "bg-transparent",
                innerWrapper: "bg-transparent",
                inputWrapper:
                  "bg-default-100 dark:bg-default-50 hover:bg-default-200 dark:hover:bg-default-100",
              }}
            />
            <Button
              color="primary"
              variant="solid"
              onPress={handleCheckAdmin}
              isDisabled={loading || !checkAdminAddress}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium"
            >
              Check
            </Button>
          </div>
          {adminCheckResult !== null && (
            <div className="mt-3">
              <Chip
                color={adminCheckResult ? "success" : "default"}
                variant="flat"
              >
                {adminCheckResult ? "Is Admin" : "Not Admin"}
              </Chip>
            </div>
          )}
        </div>

        <Divider />

        {/* Admin Guidelines */}
        <div>
          <h4 className="font-medium mb-4">Admin Guidelines</h4>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li>• Admins can pause/unpause the executor contract</li>
              <li>• Admins can enable/disable trading intervals</li>
              <li>• Admins can manage base token allowances</li>
              <li>• Admins can add/remove other admins</li>
              <li>• Always verify addresses before adding as admins</li>
              <li>• Consider using multi-sig wallets for admin accounts</li>
            </ul>
          </div>
        </div>

        {/* Add Admin Modal */}
        <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
          <ModalContent>
            <ModalHeader>Add New Admin</ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Adding an admin will grant them full control over the DCA
                executor contract. Make sure you trust this address and verify
                it`s correct.
              </p>
              <Input
                label="Admin Address"
                placeholder="0x..."
                value={newAdminAddress}
                onValueChange={setNewAdminAddress}
                variant="flat"
                color="default"
                classNames={{
                  input: "bg-transparent",
                  innerWrapper: "bg-transparent",
                  inputWrapper:
                    "bg-default-100 dark:bg-default-50 hover:bg-default-200 dark:hover:bg-default-100",
                }}
              />
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  ⚠️ Warning: Admin privileges include the ability to pause the
                  system, modify intervals, and manage token allowances. Only
                  add trusted addresses.
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onAddModalClose}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Cancel
              </Button>
              <Button
                color="success"
                variant="solid"
                onPress={handleAddAdmin}
                isLoading={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-medium"
              >
                Add Admin
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Remove Admin Modal */}
        <Modal isOpen={isRemoveModalOpen} onClose={onRemoveModalClose}>
          <ModalContent>
            <ModalHeader>Remove Admin</ModalHeader>
            <ModalBody>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This will remove admin privileges from the specified address.
                They will no longer be able to control the DCA executor
                contract.
              </p>
              <Input
                label="Admin Address to Remove"
                placeholder="0x..."
                value={removeAdminAddress}
                onValueChange={setRemoveAdminAddress}
                variant="flat"
                color="default"
                classNames={{
                  input: "bg-transparent",
                  innerWrapper: "bg-transparent",
                  inputWrapper:
                    "bg-default-100 dark:bg-default-50 hover:bg-default-200 dark:hover:bg-default-100",
                }}
              />
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">
                  ⚠️ Warning: This action cannot be undone. Make sure you want
                  to remove admin privileges from this address.
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={onRemoveModalClose}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Cancel
              </Button>
              <Button
                color="danger"
                variant="solid"
                onPress={handleRemoveAdmin}
                isLoading={loading}
                className="bg-red-500 hover:bg-red-600 text-white font-medium"
              >
                Remove Admin
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
}
