import type { NextFunction, Request, Response } from "express";

const FIRST_NAME_TOKEN = "{{First Name}}";

type Recipient = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  tags: string[];
};

type SendEmailBody = {
  graphToken: string;
  recipients: Recipient[];
  subject: string;
  message: string;
};

type GraphErrorResponse = {
  error?: { message?: string };
};

export const sendEmails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { graphToken, recipients, subject, message } = req.body as SendEmailBody;

    if (
      !graphToken ||
      !Array.isArray(recipients) ||
      recipients.length === 0 ||
      !subject ||
      !message
    ) {
      res.status(400).json({ error: "graphToken, recipients, subject, and message are required" });
      return;
    }

    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const personalizedBody = message.replaceAll(FIRST_NAME_TOKEN, recipient.firstName);

        const graphRes = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${graphToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              subject,
              body: {
                contentType: "Text",
                content: personalizedBody,
              },
              toRecipients: [
                {
                  emailAddress: {
                    address: recipient.email,
                    name: `${recipient.firstName} ${recipient.lastName}`,
                  },
                },
              ],
            },
            saveToSentItems: true,
          }),
        });

        if (!graphRes.ok) {
          const errBody = (await graphRes.json()) as GraphErrorResponse;
          throw new Error(errBody?.error?.message ?? `Failed to send email to ${recipient.email}`);
        }
      }),
    );

    const failures = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => (r.reason instanceof Error ? r.reason.message : "Unknown error"));

    if (failures.length > 0) {
      res.status(207).json({
        sent: recipients.length - failures.length,
        failed: failures.length,
        errors: failures,
      });
      return;
    }

    res.status(200).json({ sent: recipients.length });
  } catch (error) {
    next(error);
  }
};
