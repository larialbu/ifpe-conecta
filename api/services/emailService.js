const nodemailer = require('nodemailer');

/**
 * Cria ou recupera o transporte SMTP configurado por variáveis de ambiente.
 * Suporta Gmail (smtp.gmail.com), portas 465 (SSL) ou 587 (TLS), ou modo simulado.
 */
function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  // Se SMTP_HOST não for definido explicitamente, mas SMTP_USER for gmail, usa smtp.gmail.com por padrão
  const host = process.env.SMTP_HOST || (user && user.includes('@gmail.com') ? 'smtp.gmail.com' : 'smtp.gmail.com');

  if (user && pass) {
    const port = parseInt(process.env.SMTP_PORT || (host === 'smtp.gmail.com' ? '465' : '587'), 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: user.trim(),
        // Remove quaisquer espaços extras que o Google gera nas Senhas de App (ex: 'abcd efgh ijkl mnop')
        pass: pass.replace(/\s+/g, ''),
      },
    });
  }

  return null;
}

/**
 * Gera o template HTML profissional com a identidade visual do IFPE Chega Junto
 */
function getVerificationHtml({ nome, confirmationUrl }) {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Cadastro - IFPE Chega Junto</title>
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
        background-color: #f0fdf4;
        border-left: 4px solid #16a34a;
        padding: 14px 16px;
        border-radius: 4px;
        margin: 20px 0;
        font-size: 14px;
        color: #166534;
      }
      .btn-container {
        text-align: center;
        margin: 32px 0;
      }
      .btn-confirm {
        display: inline-block;
        background-color: #16a34a;
        color: #ffffff !important;
        text-decoration: none;
        font-weight: 700;
        font-size: 16px;
        padding: 14px 32px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
      }
      .fallback-text {
        font-size: 13px;
        color: #6b7280;
        word-break: break-all;
        margin-top: 24px;
        border-top: 1px solid #f3f4f6;
        padding-top: 16px;
      }
      .footer {
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #9ca3af;
        border-top: 1px solid #e5e7eb;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo-badge">IFPE <span>Chega Junto</span></div>
        <h1>Bem-vindo(a) à nossa rede!</h1>
        <p>Campus Olinda - Instituto Federal de Pernambuco</p>
      </div>
      <div class="content">
        <div class="greeting">Olá, ${nome}!</div>
        <p>Recebemos sua solicitação de cadastro no <strong>IFPE Chega Junto</strong>, a plataforma colaborativa de estudantes dos cursos de Artes Visuais, Computação Gráfica e Produção em Multimídia.</p>
        
        <div class="info-box">
          🔒 Para garantir a segurança e a integridade da nossa comunidade acadêmica, clique no botão abaixo para ativar a sua conta discente:
        </div>

        <div class="btn-container">
          <a href="${confirmationUrl}" class="btn-confirm" target="_blank">Ativar Minha Conta</a>
        </div>

        <div class="fallback-text">
          Se o botão não funcionar, copie e cole o link no seu navegador:<br>
          <a href="${confirmationUrl}" style="color: #16a34a;">${confirmationUrl}</a>
        </div>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} IFPE Chega Junto - Instituto Federal de Pernambuco, Campus Olinda.<br>
        Plataforma oficial da comunidade discente.
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Gera o template HTML para comunicados e disparos de e-mails institucionais
 */
function getBroadcastHtml({ titulo, mensagem, destinatarioNome }) {
  const mensagemFormatada = mensagem.replace(/\n/g, '<br>');
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titulo} - IFPE Chega Junto</title>
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
        padding: 28px 24px;
        text-align: center;
        color: #ffffff;
      }
      .logo-badge {
        display: inline-block;
        background-color: #ffffff;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 800;
        font-size: 18px;
        color: #15803d;
        margin-bottom: 10px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      }
      .header h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
      }
      .badge-aviso {
        display: inline-block;
        background: rgba(255,255,255,0.2);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin-top: 6px;
      }
      .content {
        padding: 32px 28px;
        line-height: 1.7;
        color: #374151;
        font-size: 15px;
      }
      .greeting {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 16px;
      }
      .card-mensagem {
        background-color: #f9fafb;
        border-left: 4px solid #16a34a;
        padding: 18px 20px;
        border-radius: 6px;
        margin: 20px 0;
        color: #1f2937;
      }
      .footer {
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #9ca3af;
        border-top: 1px solid #e5e7eb;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo-badge">IFPE Chega Junto</div>
        <h1>${titulo}</h1>
        <div class="badge-aviso">📢 Comunicado da Administração</div>
      </div>
      <div class="content">
        <div class="greeting">Olá, ${destinatarioNome || 'Estudante'}!</div>
        <div class="card-mensagem">
          ${mensagemFormatada}
        </div>
        <p style="font-size: 13px; color: #6b7280; margin-top: 24px;">
          Este comunicado foi enviado pela coordenação/administração da plataforma <strong>IFPE Chega Junto</strong> do Campus Olinda.
        </p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} IFPE Chega Junto - Instituto Federal de Pernambuco, Campus Olinda.<br>
        Campus Olinda: Av. Transamazônica, 405 - Jardim Brasil, Olinda - PE.
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
  const from = process.env.SMTP_FROM || `"IFPE Chega Junto" <${process.env.SMTP_USER || 'noreply@ifpe.edu.br'}>`;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject: 'Confirme seu e-mail no IFPE Chega Junto 🎓',
        text: `Olá ${nome}!\n\nConfirme sua conta no IFPE Chega Junto acessando o link:\n${confirmationUrl}\n\nEste link é válido por 24 horas.`,
        html: getVerificationHtml({ nome, confirmationUrl }),
      });

      console.log(`[EMAIL ENVIADO] E-mail de confirmação despachado com sucesso para ${to}. ID: ${info.messageId}`);
      return { success: true, simulated: false, messageId: info.messageId };
    } catch (err) {
      console.error(`[ERRO SMTP] Falha ao enviar e-mail real para ${to}:`, err.message);
    }
  }

  // Modo simulação / Desenvolvimento / Sem credenciais SMTP
  console.log(`\n======================================================`);
  console.log(`📧 [SIMULAÇÃO DE E-MAIL INSTITUCIONAL - IFPE CHEGA JUNTO]`);
  console.log(`Para: ${to} (${nome})`);
  console.log(`Assunto: Confirme seu e-mail no IFPE Chega Junto 🎓`);
  console.log(`🔗 Link de Confirmação:`);
  console.log(`${confirmationUrl}`);
  console.log(`======================================================\n`);

  return { success: true, simulated: true, link: confirmationUrl };
}

/**
 * Envia um e-mail de comunicado/disparo institucional
 */
async function sendBroadcastEmail({ to, subject, message, destinatarioNome }) {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || `"IFPE Chega Junto" <${process.env.SMTP_USER || 'noreply@ifpe.edu.br'}>`;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject: subject || 'Comunicado Oficial - IFPE Chega Junto',
        text: `Olá ${destinatarioNome || 'Estudante'}!\n\n${message}\n\nIFPE Chega Junto - Campus Olinda`,
        html: getBroadcastHtml({
          titulo: subject || 'Comunicado Oficial',
          mensagem: message,
          destinatarioNome,
        }),
      });

      console.log(`[BROADCAST ENVIADO] E-mail enviado com sucesso para ${to}. ID: ${info.messageId}`);
      return { success: true, simulated: false, messageId: info.messageId, email: to };
    } catch (err) {
      console.error(`[ERRO BROADCAST] Falha ao enviar e-mail para ${to}:`, err.message);
      return { success: false, simulated: false, error: err.message, email: to };
    }
  }

  // Modo simulação
  console.log(`\n======================================================`);
  console.log(`📢 [SIMULAÇÃO DISPARO DE E-MAIL - IFPE CHEGA JUNTO]`);
  console.log(`Para: ${to} (${destinatarioNome})`);
  console.log(`Assunto: ${subject}`);
  console.log(`Mensagem:\n${message}`);
  console.log(`======================================================\n`);

  return { success: true, simulated: true, email: to };
}

module.exports = {
  sendVerificationEmail,
  sendBroadcastEmail,
};
