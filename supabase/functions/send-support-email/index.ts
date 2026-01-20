import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const CHAT_URL = Deno.env.get('CHAT_URL') || 'https://tastyfood.be/support'

interface EmailRequest {
  type: 'created' | 'agent_reply'
  requestId: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { type, requestId }: EmailRequest = await req.json()

    // Fetch the support request
    const { data: request, error: requestError } = await supabaseClient
      .from('support_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      throw new Error('Support request not found')
    }

    let emailSubject = ''
    let emailHtml = ''

    if (type === 'created') {
      // Confirmation email when ticket is created
      emailSubject = '🍔 Tasty Food - Votre demande a été reçue'
      emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .ticket-box { background: #f8f9fa; padding: 20px; border-left: 4px solid #fbbf24; margin: 20px 0; border-radius: 4px; }
              .button { display: inline-block; background: #fbbf24; color: #1a1a1a; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🍔 Tasty Food</h1>
                <p>Support Client</p>
              </div>
              <div class="content">
                <h2>Votre demande a été reçue !</h2>
                <p>Bonjour,</p>
                <p>Nous avons bien reçu votre demande d'assistance. Notre équipe va l'examiner et vous répondre dans les plus brefs délais.</p>
                
                <div class="ticket-box">
                  <strong>Votre message :</strong><br>
                  ${request.message.replace(/\n/g, '<br>')}
                </div>

                <p>Pour suivre votre conversation et recevoir des réponses, cliquez sur le bouton ci-dessous :</p>
                
                <div style="text-align: center;">
                  <a href="${CHAT_URL}?ticket=${requestId}" class="button">
                    💬 Accéder à la conversation
                  </a>
                </div>

                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  <strong>Astuce :</strong> Gardez ce lien pour revenir à votre conversation à tout moment.
                </p>
              </div>
              <div class="footer">
                <p>Tasty Food - Burgers Halal & Frites Fraîches à Liège</p>
                <p>Vous recevez cet email car vous avez contacté notre support.</p>
              </div>
            </div>
          </body>
        </html>
      `
    } else if (type === 'agent_reply') {
      // Notification email when agent replies
      emailSubject = '🍔 Tasty Food - Nouvelle réponse à votre demande'
      emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
              .alert-box { background: #ecfdf5; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px; }
              .button { display: inline-block; background: #fbbf24; color: #1a1a1a; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🍔 Tasty Food</h1>
                <p>Support Client</p>
              </div>
              <div class="content">
                <h2>Vous avez une nouvelle réponse ! 💬</h2>
                <p>Bonjour,</p>
                
                <div class="alert-box">
                  <strong>✅ Un agent a répondu à votre demande</strong><br>
                  Consultez la réponse complète dans votre conversation.
                </div>

                <p>Cliquez sur le bouton ci-dessous pour lire la réponse et continuer la conversation :</p>
                
                <div style="text-align: center;">
                  <a href="${CHAT_URL}?ticket=${requestId}" class="button">
                    💬 Lire la réponse
                  </a>
                </div>

                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Notre équipe est là pour vous aider. N'hésitez pas à poser d'autres questions !
                </p>
              </div>
              <div class="footer">
                <p>Tasty Food - Burgers Halal & Frites Fraîches à Liège</p>
                <p>Vous recevez cet email car vous avez une conversation active avec notre support.</p>
              </div>
            </div>
          </body>
        </html>
      `
    }

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Tasty Food Support <support@tastyfood.be>',
        to: [request.email],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text()
      throw new Error(`Failed to send email: ${errorData}`)
    }

    const data = await resendResponse.json()

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
