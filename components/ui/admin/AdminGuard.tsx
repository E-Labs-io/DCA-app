/** @format */

import React, { useEffect, useState } from "react";
import { Card, CardBody, Spinner, Button, Chip } from "@nextui-org/react";
import { useExecutorAdmin } from "@/hooks/useExecutorAdmin";
import { Shield, AlertCircle, RefreshCw, Crown } from "lucide-react";

interface AdminGuardProps {
  userAddress: string | undefined;
  children: React.ReactNode;
}

interface AccessStatus {
  isOwner: boolean;
  isAdmin: boolean;
  hasAccess: boolean;
}

export function AdminGuard({ userAddress, children }: AdminGuardProps) {
  const { checkIfAdminOrOwner } = useExecutorAdmin();
  const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyAccess() {
      if (!userAddress) {
        setAccessStatus({ isOwner: false, isAdmin: false, hasAccess: false });
        setChecking(false);
        setError("No wallet address provided");
        return;
      }

      // Wait a bit for signer to be ready
      setChecking(true);
      setError(null);

      try {
        console.log("Checking admin/owner status for:", userAddress);
        const status = await checkIfAdminOrOwner(userAddress);
        console.log("Access status result:", status);
        setAccessStatus(status);
      } catch (error) {
        console.error("Error checking admin/owner status:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to check access permissions"
        );
        setAccessStatus({ isOwner: false, isAdmin: false, hasAccess: false });
      } finally {
        setChecking(false);
      }
    }

    if (userAddress) {
      // Add a delay to ensure signer is ready
      const timer = setTimeout(() => {
        verifyAccess();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setAccessStatus({ isOwner: false, isAdmin: false, hasAccess: false });
      setChecking(false);
    }
  }, [userAddress, checkIfAdminOrOwner]);

  const handleRetry = () => {
    setChecking(true);
    setError(null);
    setAccessStatus(null);
    // Trigger re-check by updating the dependency
    setTimeout(() => {
      if (userAddress) {
        checkIfAdminOrOwner(userAddress)
          .then(setAccessStatus)
          .catch((err) => {
            setError(err.message);
            setAccessStatus({
              isOwner: false,
              isAdmin: false,
              hasAccess: false,
            });
          })
          .finally(() => setChecking(false));
      }
    }, 100);
  };

  if (checking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center p-8">
            <Spinner size="lg" className="mb-4" color="primary" />
            <h3 className="text-lg font-semibold mb-2">
              Verifying Access Permissions
            </h3>
            <p className="text-gray-500">
              Checking your admin/owner privileges on the DCA Executor
              contract...
            </p>
            <p className="text-sm text-gray-400 mt-2">Address: {userAddress}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center p-8">
            <AlertCircle size={48} className="mx-auto mb-4 text-orange-500" />
            <h1 className="text-2xl font-bold mb-4 text-orange-500">
              Verification Error
            </h1>
            <p className="text-gray-500 mb-4">
              Unable to verify your access permissions.
            </p>
            <p className="text-sm text-red-500 mb-6 font-mono bg-red-50 p-2 rounded">
              {error}
            </p>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">
                This could be due to network issues or contract connectivity
                problems.
              </p>
              <Button
                color="primary"
                variant="flat"
                startContent={<RefreshCw size={16} />}
                onPress={handleRetry}
              >
                Retry Verification
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!accessStatus?.hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center p-8">
            <Shield size={48} className="mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-4 text-red-500">
              Access Denied
            </h1>
            <p className="text-gray-500 mb-4">
              You do not have the required privileges to access this dashboard.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Your Address:</strong>
              </p>
              <p className="text-xs font-mono text-gray-500 break-all">
                {userAddress}
              </p>
              <div className="mt-3 flex gap-2 justify-center">
                <Chip
                  size="sm"
                  color={accessStatus?.isOwner ? "success" : "default"}
                >
                  {accessStatus?.isOwner ? "✓ Owner" : "✗ Not Owner"}
                </Chip>
                <Chip
                  size="sm"
                  color={accessStatus?.isAdmin ? "success" : "default"}
                >
                  {accessStatus?.isAdmin ? "✓ Admin" : "✗ Not Admin"}
                </Chip>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                Only the contract owner or authorized administrators can access
                the DCA system controls.
              </p>
              <p className="text-xs text-gray-400">
                If you believe this is an error, please contact the system
                administrator.
              </p>
              <Button
                color="default"
                variant="flat"
                size="sm"
                startContent={<RefreshCw size={14} />}
                onPress={handleRetry}
              >
                Check Again
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Show access granted with role information
  return (
    <>
      {/* Access Status Banner */}
      <div className="container mx-auto px-4 py-2">
        <Card className="mb-4">
          <CardBody className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {accessStatus.isOwner ? (
                  <Crown size={20} className="text-yellow-500" />
                ) : (
                  <Shield size={20} className="text-blue-500" />
                )}
                <div>
                  <h4 className="font-semibold text-sm">
                    {accessStatus.isOwner
                      ? "Contract Owner Access"
                      : "Admin Access"}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {accessStatus.isOwner
                      ? "You have full ownership privileges"
                      : "You have administrator privileges"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {accessStatus.isOwner && (
                  <Chip
                    size="sm"
                    color="warning"
                    startContent={<Crown size={12} />}
                  >
                    Owner
                  </Chip>
                )}
                {accessStatus.isAdmin && (
                  <Chip
                    size="sm"
                    color="primary"
                    startContent={<Shield size={12} />}
                  >
                    Admin
                  </Chip>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      {children}
    </>
  );
}
