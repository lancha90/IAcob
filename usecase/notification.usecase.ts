import OpenAI from "openai";
import Twilio from "twilio";

/*
* OpenAI client (debe ser inyectada)
 */
let client: OpenAI;

export const setOpenAIClient = (clientInstance: OpenAI) => {
  client = clientInstance;
};

/**
 * Función de logging externa (debe ser inyectada)
 */
let log: (message: string) => void = console.log;

export const setLogFunction = (fn: (message: string) => void) => {
  log = fn;
};

/**
 * Envía un mensaje a WhatsApp usando Twilio
 * @param message - Mensaje a enviar
 * @param phoneNumber - Número de teléfono destino (formato internacional)
 * @returns Resultado del envío
 */
export const sendWhatsAppMessage = async (message: string, phoneNumber?: string): Promise<boolean> => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const contentSid = process.env.TWILIO_CONTENT_SID;

  const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  const recipientNumber = phoneNumber || process.env.WHATSAPP_RECIPIENT_NUMBER;

  if (!accountSid || !authToken || !recipientNumber) {
    log(`⚠️ Configuración de Twilio incompleta. AccountSid: ${!!accountSid}, AuthToken: ${!!authToken}, Recipient: ${!!recipientNumber}`);
    return false;
  }

  try {
    log(`📱 Enviando mensaje a WhatsApp via Twilio: ${recipientNumber}`);

    const client = Twilio(accountSid, authToken);
    
    const messageResult = await client.messages.create({
      contentVariables: '{"message":"' + message + '"}',
      contentSid: contentSid,
      from: twilioWhatsAppNumber,
      to: `whatsapp:${recipientNumber}`
    });

    log(`✅ Mensaje enviado exitosamente: ${messageResult.sid}`);
    return true;

  } catch (error) {
    log(`❌ Error en sendWhatsAppMessage: ${error}`);
    return false;
  }
};

/**
 * Envía el resultado final de la ejecución del agente por WhatsApp
 * @param finalResult - Resultado final de la ejecución del agente
 * @returns Mensaje de confirmación del envío
 */
export const sendReportResume = async (finalResult: string): Promise<string> => {
  log(`✍🏻 Enviando resumen de reporte via WhatsApp`);

  try {
    // Formatear el mensaje para WhatsApp con timestamp
    const timestamp = new Date().toLocaleString('es-ES', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const formattedMessage = `🤖 *Reporte de Trading ⏰ ${timestamp}*\n\n${finalResult}`;

    const sent = await sendWhatsAppMessage(formattedMessage);

    if (sent) {
      log(`✅ Reporte enviado exitosamente por WhatsApp`);
      return "Reporte de trading enviado exitosamente por WhatsApp";
    } else {
      log(`⚠️ No se pudo enviar el reporte por WhatsApp`);
      return "No se pudo enviar el reporte por WhatsApp - verifica la configuración";
    }

  } catch (error) {
    log(`❌ Error enviando reporte: ${error}`);
    return `Error enviando reporte por WhatsApp: ${error}`;
  }
};