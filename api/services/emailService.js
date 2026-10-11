const nodemailer = require('nodemailer');

/**
 * Cria ou recupera o transporte SMTP configurado por variáveis de ambiente.
 * Se nenhuma configuração for fornecida, opera em modo log/simulado para desenvolvimento.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  return null;
}

/**
 * Gera o template HTML profissional com a identidade visual do IFPE Olinda Conecta
 */
function getVerificationHtml({ nome, confirmationUrl }) {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Cadastro - IFPE Olinda Conecta</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f3f4f6;
        color: #1f2937;
      }
      .container {
        max-width: 600px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        border: 1px solid #e5e7eb;
      }
      .header {
        background: linear-gradient(135deg, #15803d 0%, #16a34a 100%);
        padding: 32px 24px;
        text-align: center;
        color: #ffffff;
      }
      .logo-badge {
        display: inline-block;
        background-color: #ffffff;
        padding: 10px 18px;
        border-radius: 8px;
        font-weight: 800;
        font-size: 20px;
        letter-spacing: -0.5px;
        color: #15803d;
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      }
      .logo-badge span {
        color: #dc2626;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
      }
      .header p {
        margin: 6px 0 0 0;
        font-size: 14px;
        opacity: 0.9;
      }
      .content {
        padding: 32px 28px;
        line-height: 1.6;
        color: #374151;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 14px;
      }
      .info-box {
        background-color: #ecfdf5;
        border-left: 4px solid #16a34a;
        padding: 14px 18px;
        margin: 20px 0;
        border-radius: 4px;
        font-size: 14px;
        color: #065f46;
      }
      .btn-container {
        text-align: center;
        margin: 32px 0;
      }
      .btn {
        display: inline-block;
        background-color: #16a34a;
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 16px;
        box-shadow: 0 4px 10px rgba(22, 163, 74, 0.35);
      }
      .link-alt {
        word-break: break-all;
        font-size: 12px;
        color: #6b7280;
        background: #f9fafb;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
      }
      .footer {
        background-color: #f9fafb;
        padding: 20px 24px;
        text-align: center;
        font-size: 12px;
        color: #6b7280;
        border-top: 1px solid #e5e7eb;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo-badge">IFPE <span>Olinda</span> Conecta</div>
        <h1>Confirmação de E-mail Institucional</h1>
        <p>Comunidade acadêmica discente do IFPE Campus Olinda</p>
      </div>
      <div class="content">
        <div class="greeting">Olá, ${nome}!</div>
        <p>
          Obrigado por se registrar no <strong>IFPE Olinda Conecta</strong>! Para garantir a segurança da nossa comunidade acadêmica e validar que você é estudante do campus, solicitamos a confirmação do seu e-mail institucional.
        </p>
        <div class="info-box">
          🔒 <strong>Atenção:</strong> Por segurança, seu acesso à plataforma só será liberado após a validação através do botão abaixo.
        </div>
        <div class="btn-container">
          <a href="${confirmationUrl}" class="btn" target="_blank">Ativar Minha Conta Agora</a>
        </div>
        <p style="font-size: 13px; color: #6b7280;">
          Se o botão acima não funcionar, copie e cole o seguinte link em seu navegador:
        </p>
        <div class="link-alt">
          ${confirmationUrl}
        </div>
        <p style="font-size: 13px; color: #9ca3af; margin-top: 24px;">
          Este link expira em 24 horas. Se você não solicitou este cadastro no IFPE Olinda Conecta, ignore esta mensagem com tranquilidade.
        </p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} IFPE Olinda Conecta - Instituto Federal de Pernambuco, Campus Olinda.<br>
        Plataforma oficial da comunidade discente.
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Envia o e-mail de confirmação ou loga em desenvolvimento
 */
async function sendVerificationEmail({ to, nome, confirmationUrl }) {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || '"IFPE Olinda Conecta" <noreply@ifpe.edu.br>';

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject: 'Confirme seu e-mail no IFPE Olinda Conecta 🎓',
        text: `Olá ${nome}!\n\nConfirme sua conta no IFPE Olinda Conecta acessando o link:\n${confirmationUrl}\n\nEste link é válido por 24 horas.`,
        html: getVerificationHtml({ nome, confirmationUrl }),
      });

      console.log(`[EMAIL ENVIADO] E-mail de confirmação despachado com sucesso para ${to}. ID: ${info.messageId}`);
      return { success: true, simulated: false, messageId: info.messageId };
    } catch (err) {
      console.error(`[ERRO SMTP] Falha ao enviar e-mail real para ${to}:`, err.message);
      // Fallback gracioso para log
    }
  }

  // Modo simulação / Desenvolvimento / Sem credenciais SMTP
  console.log(`\n======================================================`);
  console.log(`📧 [SIMULAÇÃO DE E-MAIL INSTITUCIONAL - IFPE OLINDA Conecta]`);
  console.log(`Para: ${to} (${nome})`);
  console.log(`Assunto: Confirme seu e-mail no IFPE Olinda Conecta 🎓`);
  console.log(`🔗 Link de Confirmação:`);
  console.log(`${confirmationUrl}`);
  console.log(`======================================================\n`);

  return { success: true, simulated: true, link: confirmationUrl };
}

module.exports = {
  sendVerificationEmail,
};
