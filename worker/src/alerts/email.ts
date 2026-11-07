import nodemailer from "nodemailer";
import { logger } from "../lib/logger";
import type { AlertEmailJobData } from "../lib/queues";

export async function sendAlertEmail(data: AlertEmailJobData): Promise<boolean> {
  const {
    monitorName,
    url,
    eventType,
    destination,
    timestamp,
    httpStatus,
    failureReason,
  } = data;

  const isConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD;

  const subject =
    eventType === "DOWN"
      ? `🚨 [ALERT DOWN] Monitor "${monitorName}" is DOWN`
      : `✅ [RECOVERED] Monitor "${monitorName}" is back UP`;

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: ${eventType === "DOWN" ? "#ef4444" : "#10b981"};">${subject}</h2>
      <p>Your monitored service experienced a status change.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Monitor:</td><td>${monitorName}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">URL:</td><td><a href="${url}">${url}</a></td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Event:</td><td><span style="font-weight: bold; color: ${eventType === "DOWN" ? "#ef4444" : "#10b981"};">${eventType}</span></td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Timestamp:</td><td>${timestamp}</td></tr>
        ${httpStatus ? `<tr><td style="padding: 8px 0; font-weight: bold;">HTTP Status:</td><td>${httpStatus}</td></tr>` : ""}
        ${failureReason ? `<tr><td style="padding: 8px 0; font-weight: bold;">Reason:</td><td style="color: #ef4444;">${failureReason}</td></tr>` : ""}
      </table>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; color: #64748b;">Sent automatically by APIWatch Monitoring System.</p>
    </div>
  `;

  if (!isConfigured) {
    logger.info("EMAIL_DISPATCH_MOCK", {
      to: destination,
      subject,
      eventType,
      monitorName,
      status: "SMTP_NOT_CONFIGURED_DEV_SIMULATED",
    });
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "alerts@apiwatch.dev",
    to: destination,
    subject,
    html: htmlBody,
  });

  logger.info("EMAIL_SENT", { to: destination, eventType, monitorName });
  return true;
}
