import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckPaymentRequest {
  transactionId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get('SYNCPAYMENTS_CLIENT_ID');
    const clientSecret = Deno.env.get('SYNCPAYMENTS_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Payment service not configured');
    }

    const { transactionId }: CheckPaymentRequest = await req.json();

    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    console.log('Checking payment status for transaction:', transactionId);

    // Step 1: Get access token
    const authResponse = await fetch('https://api.syncpayments.com.br/api/partner/v1/auth-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!authResponse.ok) {
      console.error('Auth failed:', await authResponse.text());
      throw new Error('Falha na autenticação');
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    console.log('Got access token, checking transaction status...');

    // Step 2: Check payment status
    // Docs: GET /api/partner/v1/transaction/{identifier}
    const statusResponse = await fetch(
      `https://api.syncpayments.com.br/api/partner/v1/transaction/${transactionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('Status check failed:', errorText);
      throw new Error('Falha ao verificar status do pagamento');
    }

    const statusData = await statusResponse.json();
    console.log('Payment status response:', JSON.stringify(statusData));

    const status = statusData?.data?.status || 'unknown';
    const isPaid = status === 'completed';

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: transactionId,
        status: status,
        isPaid: isPaid,
        rawStatus: statusData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Error checking payment:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage, isPaid: false }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
