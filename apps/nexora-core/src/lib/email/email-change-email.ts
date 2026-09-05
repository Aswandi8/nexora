import { Resend } from "resend";

interface SendEmailChangeVerificationInput {
  to: string;
  name: string;
  verificationUrl: string;
}

function requireEmailEnv(name: string, value: string | undefined): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`${name} is not configured`);
  }

  return normalized;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendEmailChangeVerification({
  to,
  name,
  verificationUrl,
}: SendEmailChangeVerificationInput): Promise<void> {
  const apiKey = requireEmailEnv("RESEND_API_KEY", process.env.RESEND_API_KEY);

  const from = requireEmailEnv(
    "NEXORA_EMAIL_FROM",
    process.env.NEXORA_EMAIL_FROM,
  );

  const resend = new Resend(apiKey);

  const safeName = escapeHtml(name);

  const safeUrl = escapeHtml(verificationUrl);

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Verifikasi email baru Nexora",
    html: `
        <!doctype html>
        <html lang="id">
          <body style="margin:0;background:#f5f5f5;padding:32px 16px;font-family:Arial,sans-serif;color:#171717">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border:1px solid #e5e5e5;border-radius:12px;background:#ffffff">
                    <tr>
                      <td style="padding:32px">
                        <div style="margin-bottom:24px;font-size:20px;font-weight:700">
                          Nexora
                        </div>

                        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.4">
                          Verifikasi email baru Anda
                        </h1>

                        <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#525252">
                          Halo ${safeName},
                        </p>

                        <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#525252">
                          Kami menerima permintaan untuk menggunakan alamat email ini pada akun Nexora Anda.
                          Verifikasi alamat email dengan tombol berikut.
                        </p>

                        <a
                          href="${safeUrl}"
                          style="display:inline-block;border-radius:8px;background:#171717;padding:11px 18px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600"
                        >
                          Verifikasi Email
                        </a>

                        <p style="margin:24px 0 0;font-size:12px;line-height:1.7;color:#737373">
                          Link ini berlaku selama 1 jam. Jika Anda tidak meminta perubahan email,
                          abaikan email ini.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
  });

  if (error) {
    throw new Error("EMAIL_DELIVERY_FAILED");
  }
}
