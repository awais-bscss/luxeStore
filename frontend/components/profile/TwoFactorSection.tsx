import React, { useState, useEffect } from 'react';
import { Shield, Copy, Check, AlertTriangle } from 'lucide-react';
import QRCode from 'qrcode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface TwoFactorModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ user, isOpen, onClose }) => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [isEnabling, setIsEnabling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    setIs2FAEnabled(user?.twoFactorEnabled || false);
  }, [user]);

  if (!isOpen) return null;

  const handleEnable2FA = async () => {
    setIsEnabling(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/2fa/enable`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setSecret(data.data.secret);
        const qrCodeUrl = await QRCode.toDataURL(data.data.qrCode);
        setQrCode(qrCodeUrl);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to enable 2FA' });
      }
    } catch (error) {
      console.error('Enable 2FA error:', error);
      setMessage({ type: 'error', text: 'Failed to enable 2FA' });
    } finally {
      setIsEnabling(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit code' });
      return;
    }

    setIsVerifying(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: verificationCode }),
      });

      const data = await response.json();

      if (data.success) {
        setBackupCodes(data.data.backupCodes);
        setIs2FAEnabled(true);
        setMessage({ type: 'success', text: '2FA enabled successfully!' });
        setVerificationCode('');
        setTimeout(() => {
          setQrCode('');
          setSecret('');
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Invalid verification code' });
      }
    } catch (error) {
      console.error('Verify 2FA error:', error);
      setMessage({ type: 'error', text: 'Failed to verify code' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!password) {
      setMessage({ type: 'error', text: 'Please enter your password' });
      return;
    }

    setIsDisabling(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_URL}/2fa/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIs2FAEnabled(false);
        setBackupCodes([]);
        setPassword('');
        setShowDisableConfirm(false);
        setMessage({ type: 'success', text: '2FA disabled successfully' });
        setTimeout(() => onClose(), 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to disable 2FA' });
      }
    } catch (error) {
      console.error('Disable 2FA error:', error);
      setMessage({ type: 'error', text: 'Failed to disable 2FA' });
    } finally {
      setIsDisabling(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 z-[60]">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add an extra layer of security</p>
            </div>
            <button onClick={onClose} className="text-2xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">×</button>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'}`}>
              {message.text}
            </div>
          )}

          <div className={`p-4 rounded-xl mb-6 ${is2FAEnabled ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'}`}>
            <div className="flex items-center gap-3">
              <Shield className={`w-6 h-6 ${is2FAEnabled ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
              <div>
                <p className={`font-semibold ${is2FAEnabled ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                  {is2FAEnabled ? '2FA is Enabled' : '2FA is Disabled'}
                </p>
                <p className={`text-sm ${is2FAEnabled ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                  {is2FAEnabled ? 'Your account is protected' : 'Enable 2FA for extra security'}
                </p>
              </div>
            </div>
          </div>

          {!is2FAEnabled && !qrCode && (
            <button onClick={handleEnable2FA} disabled={isEnabling} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50">
              {isEnabling ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating...</> : <><Shield className="w-5 h-5" />Enable 2FA</>}
            </button>
          )}

          {qrCode && !is2FAEnabled && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Step 1: Scan QR Code</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Scan with Google Authenticator or Authy</p>
                <div className="flex justify-center mb-4">
                  <img src={qrCode} alt="2FA QR Code" className="w-64 h-64 bg-white p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700" />
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Or enter manually:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded font-mono text-sm bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border border-gray-200 dark:border-gray-700">{secret}</code>
                    <button onClick={() => copyToClipboard(secret)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      {copiedCode === secret ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Step 2: Verify Code</h3>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Enter 6-digit code</label>
                <div className="flex gap-3">
                  <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-center text-2xl font-mono tracking-widest bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500" maxLength={6} />
                  <button onClick={handleVerify2FA} disabled={isVerifying || verificationCode.length !== 6} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50">
                    {isVerifying ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {backupCodes.length > 0 && (
            <div className="mt-6 p-6 rounded-xl border-2 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Save Your Backup Codes</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Store these safely. Use them if you lose your authenticator.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800">
                    <code className="font-mono text-sm text-green-600 dark:text-green-400">{code}</code>
                    <button onClick={() => copyToClipboard(code)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      {copiedCode === code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {is2FAEnabled && (
            <div className="mt-6">
              {!showDisableConfirm ? (
                <button onClick={() => setShowDisableConfirm(true)} className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors">Disable 2FA</button>
              ) : (
                <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm Disable 2FA</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Enter your password to disable</p>
                  <div className="space-y-4">
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-red-500" />
                    <div className="flex gap-3">
                      <button onClick={handleDisable2FA} disabled={isDisabling || !password} className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50">
                        {isDisabling ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />Disabling...</> : 'Confirm Disable'}
                      </button>
                      <button onClick={() => { setShowDisableConfirm(false); setPassword(''); }} disabled={isDisabling} className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold transition-colors">Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
