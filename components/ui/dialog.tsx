'use client';

import * as React from 'react';
import {
  Modal as NextUIModal,
  ModalContent as NextUIModalContent,
  ModalHeader as NextUIModalHeader,
  ModalBody as NextUIModalBody,
  ModalFooter as NextUIModalFooter,
  ModalProps as NextUIModalProps,
} from "@nextui-org/react";

export type DialogProps = NextUIModalProps;

const Dialog = NextUIModal;
const DialogContent = NextUIModalContent;
const DialogHeader = NextUIModalHeader;
const DialogBody = NextUIModalBody;
const DialogFooter = NextUIModalFooter;

export { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter };
