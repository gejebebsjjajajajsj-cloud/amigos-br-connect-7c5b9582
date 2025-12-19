import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Copy, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { QRCodeSVG } from 'qrcode.react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  price: number;
  productName: string;
  deliverableLink?: string | null;
}

const PaymentModal = ({ isOpen, onClose, price, productName, deliverableLink }: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentCode: string;
    transactionId: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeliverable, setShowDeliverable] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    if (isOpen && !paymentData && !loading) {
      generatePayment();
    }
  }, [isOpen]);

  const generatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-pix-payment', {
        body: { amount: price },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      if (!data.paymentCode) {
        throw new Error('QR Code não gerado pela API');
      }

      setPaymentData({
        paymentCode: data.paymentCode,
        transactionId: data.transactionId,
      });
      toast.success('Pagamento PIX gerado!');
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Erro ao gerar pagamento');
      toast.error(error.message || 'Erro ao gerar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = async () => {
    if (paymentData?.paymentCode) {
      await navigator.clipboard.writeText(paymentData.paymentCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleClose = () => {
    setPaymentData(null);
    setError(null);
    setShowDeliverable(false);
    setVerifyingPayment(false);
    onClose();
  };

  const handleConfirmPayment = async () => {
    if (!paymentData?.transactionId) {
      toast.error('ID da transação não encontrado');
      return;
    }

    setVerifyingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke('check-pix-payment', {
        body: { transactionId: paymentData.transactionId },
      });

      if (error) throw error;

      console.log('Payment verification result:', data);

      if (data.isPaid) {
        toast.success('Pagamento confirmado!');
        setShowDeliverable(true);
      } else {
        toast.error('Pagamento ainda não confirmado. Aguarde alguns segundos após pagar e tente novamente.');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error('Erro ao verificar pagamento. Tente novamente.');
    } finally {
      setVerifyingPayment(false);
    }
  };

  // Show deliverable after payment confirmation
  if (showDeliverable && deliverableLink) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-background border-border max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-center text-lg">
              🎉 Acesso Liberado!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground text-center">
              Clique no botão abaixo para acessar seu conteúdo exclusivo:
            </p>

            <a
              href={deliverableLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                Acessar Grupo VIP
              </Button>
            </a>

            <p className="text-xs text-center text-muted-foreground">
              Salve o link! Ele é seu acesso permanente.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-background border-border max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-center text-base">
            Pagamento PIX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-center">
            <p className="text-xs text-muted-foreground line-clamp-1">{productName}</p>
            <p className="text-xl font-bold text-primary">
              R$ {price.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Gerando PIX...</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-3">
              <p className="text-xs text-destructive mb-3">{error}</p>
              <Button onClick={generatePayment} variant="outline" size="sm">
                Tentar novamente
              </Button>
            </div>
          )}

          {paymentData && !loading && (
            <>
              {/* QR Code - centralizado */}
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <QRCodeSVG 
                    value={paymentData.paymentCode} 
                    size={160}
                    level="M"
                  />
                </div>
              </div>

              {/* PIX Code - compact */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground text-center">Código PIX:</p>
                <div 
                  onClick={copyPixCode}
                  className="bg-muted/50 border border-border rounded-lg p-2 cursor-pointer hover:bg-muted/70 transition-colors"
                >
                  <p className="text-[10px] text-foreground break-all line-clamp-2 text-center">
                    {paymentData.paymentCode}
                  </p>
                </div>
              </div>

              <Button
                onClick={copyPixCode}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-9"
                size="sm"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" />
                    Copiar Código PIX
                  </>
                )}
              </Button>

              {/* Confirm Payment Button - with verification */}
              {deliverableLink && (
                <Button
                  onClick={handleConfirmPayment}
                  disabled={verifyingPayment}
                  variant="outline"
                  className="w-full h-9 border-green-600 text-green-600 hover:bg-green-600 hover:text-white disabled:opacity-50"
                  size="sm"
                >
                  {verifyingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Verificar Pagamento
                    </>
                  )}
                </Button>
              )}

              <p className="text-[10px] text-center text-muted-foreground">
                Escaneie o QR code ou copie o código PIX. Após pagar, clique em "Verificar Pagamento".
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
