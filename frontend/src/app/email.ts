async function sendOneEmail(accessToken: string, toEmail: string, bodyHtml: string) {
  const resp = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject: "Title of the email",
        body: { contentType: "HTML", content: bodyHtml },
        toRecipients: [{ emailAddress: { address: toEmail } }],
      },
      saveToSentItems: true,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`sendMail failed: ${resp.status} ${text}`);
  }
}

// Here is the place where the general email is taken and is converted into several personalized emails
export async function sendPersonalized(
  accessToken: string,
  recipients: { email: string; name: string }[],
) {
  for (const r of recipients) {
    const html = `Hello ${r.name}`;
    await sendOneEmail(accessToken, r.email, html);
  }
}
