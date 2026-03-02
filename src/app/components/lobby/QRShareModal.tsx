'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '../ui/Modal';
import { haptic } from '../../utils/haptic';

interface QRShareModalProps {
  open: boolean;
  onClose: () => void;
  roomCode: string;
}

export function QRShareModal({ open, onClose, roomCode }: QRShareModalProps) {
  const [copied, setCopied] = useState(false);

  const url = `https://coup.chuds.dev/lobby/${roomCode}`;

  const handleCopyLink = () => {
    haptic();
    try {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Share Room">
      <div className="flex flex-col items-center space-y-4">
        {/* QR Code */}
        <div className="bg-white rounded-xl p-4">
          <QRCodeSVG value={url} size={200} />
        </div>

        {/* Link */}
        <p className="text-gray-400 text-sm text-center break-all">{url}</p>

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="btn-primary w-full"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={() => { haptic(); onClose(); }}
          className="btn-secondary w-full"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
