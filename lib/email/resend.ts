import { Resend } from 'resend';
import { SITE } from '@/lib/config/site';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder');
}

const FROM_EMAIL = 'Yoga Founders Network <hello@yogafoundersnetwork.com>';
const ADMIN_EMAIL = 'hello@yogafoundersnetwork.com';

// ── Brand styles (inline, for email client compatibility) ──────────────────
const SAGE = '#111111';
const BG = '#ffffff';
const BORDER = '#e8e8e0';

function baseTemplate(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG};padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid ${BORDER};border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:${SAGE};padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Yoga Founders Network</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:normal;font-family:Georgia,'Times New Roman',serif;">${title}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;color:#2d2d2d;font-size:16px;line-height:1.7;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid ${BORDER};text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;font-family:Arial,sans-serif;">
                Yoga Founders Network &mdash; Connecting the global yoga community<br/>
                <a href="https://yogafoundersnetwork.com" style="color:${SAGE};text-decoration:none;">yogafoundersnetwork.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Welcome Email ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  const subject = 'Welcome to Yoga Founders Network — your listing is under review';
  const body = `
    <p style="margin:0 0 16px;">Dear ${name},</p>
    <p style="margin:0 0 16px;">Thank you for submitting your listing to <strong>Yoga Founders Network</strong>. We are delighted to welcome you to our growing community of yoga studios, teachers, schools, and retreat centers.</p>
    <p style="margin:0 0 16px;">Your listing is currently under review by our team. We aim to review all submissions within 1–2 business days. You will receive an email as soon as your listing is approved and live on the directory.</p>
    <p style="margin:0 0 16px;">In the meantime, if you have any questions or would like to make changes to your submission, please reply to this email or reach out to us at <a href="mailto:${ADMIN_EMAIL}" style="color:${SAGE};">${ADMIN_EMAIL}</a>.</p>
    <p style="margin:0;">With gratitude,<br/>The Yoga Founders Network Team</p>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: baseTemplate('Your Listing is Being Reviewed', body),
  });
}

// ── "You're Featured" Email ────────────────────────────────────────────────

export async function sendFeaturedEmail(to: string, name: string, listingUrl: string) {
  const subject = `✨ ${name}, you're featured on Yoga Founders Network today`;
  const body = `
    <p style="margin:0 0 16px;">Dear ${name},</p>
    <p style="margin:0 0 16px;">Wonderful news — <strong>${name}</strong> is today's featured spotlight on the Yoga Founders Network Instagram &amp; social channels. 🪷</p>
    <p style="margin:0 0 16px;">We'd love for you to <strong>share the post to your own story or feed</strong> — your community would enjoy seeing it, and it helps more practitioners discover you. Head to <a href="https://instagram.com/yogafoundersnetwork" style="color:${SAGE};">@yogafoundersnetwork</a> to find today's post and reshare.</p>
    <p style="margin:0 0 16px;">Your listing: <a href="${listingUrl}" style="color:${SAGE};">${listingUrl}</a></p>
    <p style="margin:0 0 16px;">Thank you for being part of our global yoga community.</p>
    <p style="margin:0;">With gratitude,<br/>The Yoga Founders Network Team</p>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: baseTemplate("You're Featured Today", body),
  });
}

// ── Approval Email ─────────────────────────────────────────────────────────

export async function sendApprovalEmail(
  to: string,
  name: string,
  listingName: string,
  listingUrl: string,
  storyUrl?: string
) {
  const subject = storyUrl
    ? `You're live — and so is your Spotlight, ${name}`
    : `Your listing "${listingName}" is now live on Yoga Founders Network`;

  const storySection = storyUrl
    ? `
    <p style="margin:0 0 16px;">There's more — your <strong>Member Spotlight</strong> is live in The Journal too. It's your welcome story, told in your own words, published for the whole network to read.</p>
    <p style="margin:0 0 24px;text-align:center;">
      <a href="${storyUrl}" style="display:inline-block;background-color:${SAGE};color:#ffffff;padding:14px 32px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;letter-spacing:0.5px;">Read Your Spotlight</a>
    </p>
    <p style="margin:0 0 16px;">We'd love for you to share it with your own community — it's the easiest way to introduce yourself to the network.</p>
    `
    : '';

  const body = `
    <p style="margin:0 0 16px;">Dear ${name},</p>
    <p style="margin:0 0 16px;">Wonderful news — <strong>${listingName}</strong> has been approved and is now live on Yoga Founders Network!</p>
    <p style="margin:0 0 24px;">Students and practitioners can now discover your space, connect with your teachings, and find their way to your community.</p>
    <p style="margin:0 0 24px;text-align:center;">
      <a href="${listingUrl}" style="display:inline-block;background-color:${SAGE};color:#ffffff;padding:14px 32px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;letter-spacing:0.5px;">View Your Listing</a>
    </p>
    ${storySection}
    <p style="margin:0 0 16px;">To maximize your visibility, consider upgrading to a <strong>Verified</strong> or <strong>Pro</strong> plan for a featured placement and enhanced profile options.</p>
    <p style="margin:0;">With gratitude,<br/>The Yoga Founders Network Team</p>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: baseTemplate(`${listingName} is Live`, body),
  });
}

// ── Spotlight Live Email (retry / manual "story" action path) ──────────────

export async function sendSpotlightLiveEmail(to: string, name: string, storyUrl: string) {
  const subject = `Your Member Spotlight is live, ${name}`;
  const body = `
    <p style="margin:0 0 16px;">Dear ${name},</p>
    <p style="margin:0 0 16px;">Your welcome story — the <strong>Member Spotlight</strong> the network puts together from your own words — is now published in The Journal.</p>
    <p style="margin:0 0 24px;text-align:center;">
      <a href="${storyUrl}" style="display:inline-block;background-color:${SAGE};color:#ffffff;padding:14px 32px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;letter-spacing:0.5px;">Read Your Spotlight</a>
    </p>
    <p style="margin:0;">We'd love for you to share it with your own community — it's the easiest way to introduce yourself to the network.</p>
    <p style="margin:16px 0 0;">With gratitude,<br/>The Yoga Founders Network Team</p>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: baseTemplate('Your Spotlight is Live', body),
  });
}

// ── Get Featured outreach: spotlight invite (DISARMED engine — see
// app/api/admin/spotlight-invites/route.ts) ─────────────────────────────────

export async function sendSpotlightInviteEmail(
  to: string,
  listingName: string,
  inviteUrl: string,
  listingUrl: string,
  unsubscribeUrl: string,
  exampleUrl?: string
) {
  const subject = `${listingName} is on Yoga Founders Network — we'd love to feature you`;

  const exampleSection = exampleUrl
    ? `<p style="margin:0 0 16px;">Here&rsquo;s a recent spotlight to give you a feel for it: <a href="${exampleUrl}" style="color:${SAGE};">${exampleUrl}</a></p>`
    : '';

  const body = `
    <p style="margin:0 0 16px;">Dear ${listingName},</p>
    <p style="margin:0 0 16px;">Your listing is live on Yoga Founders Network, the global directory of yoga studios, teachers, schools, and retreats. You can see your page here: <a href="${listingUrl}" style="color:${SAGE};">${listingUrl}</a></p>
    <p style="margin:0 0 16px;">We&rsquo;d like to introduce you properly. Every founder in the network can receive a Member Spotlight — a welcome feature in The Journal, told in your own words, shared with our audience on Instagram and beyond.</p>
    ${exampleSection}
    <p style="margin:0 0 16px;">It takes about five minutes: five short questions, answered in your own voice, plus a photo or two of you and your space.</p>
    <p style="margin:0 0 24px;text-align:center;">
      <a href="${inviteUrl}" style="display:inline-block;background-color:${SAGE};color:#ffffff;padding:14px 32px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;letter-spacing:0.5px;">Get Featured — Answer 5 Questions</a>
    </p>
    <p style="margin:0 0 16px;">There&rsquo;s no cost and no account to create. We&rsquo;ll shape your answers into your feature, and you&rsquo;ll receive the link the moment it&rsquo;s live.</p>
    <p style="margin:0 0 24px;">With gratitude,<br/>The Yoga Founders Network Team</p>
    <p style="margin:0;font-size:12px;color:#888;font-family:Arial,sans-serif;">You&rsquo;re receiving this because ${listingName} is listed on yogafoundersnetwork.com. If you&rsquo;d rather we didn&rsquo;t email you about this, <a href="${unsubscribeUrl}" style="color:#888;">one click and we won&rsquo;t</a>.</p>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: baseTemplate('Get Featured in The Journal', body),
  });
}

// ── Get Featured outreach: confirmation to the founder after they submit ───

export async function sendStoryReceivedEmail(to: string, name: string) {
  const subject = 'Your spotlight is on its way';
  const body = `
    <p style="margin:0 0 16px;">Dear ${name},</p>
    <p style="margin:0 0 16px;">Thank you — we&rsquo;ve received your answers and photos. We&rsquo;re shaping them into your Member Spotlight now.</p>
    <p style="margin:0;">We&rsquo;ll email you the link the moment it&rsquo;s live.</p>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: baseTemplate('Your Spotlight is on Its Way', body),
  });
}

// ── Get Featured outreach: notify the admin a story was submitted ──────────

export async function sendAdminStorySubmittedEmail(listingName: string) {
  const subject = `Spotlight story submitted: ${listingName}`;
  const body = `
    <p style="margin:0 0 16px;">Story answers were submitted via the get-featured link for <strong>${listingName}</strong>.</p>
    <p style="margin:0 0 24px;text-align:center;">
      <a href="${SITE.url}/admin" style="display:inline-block;background-color:${SAGE};color:#ffffff;padding:14px 32px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;letter-spacing:0.5px;">Review in Admin</a>
    </p>
    <p style="margin:0;font-size:13px;color:#888;font-family:Arial,sans-serif;">Review the answers and click &ldquo;Generate spotlight&rdquo; in the admin dashboard to publish.</p>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject,
    html: baseTemplate('Spotlight Story Submitted', body),
  });
}

// ── Rejection Email ────────────────────────────────────────────────────────

export async function sendRejectionEmail(
  to: string,
  name: string,
  listingName: string,
  reason: string
) {
  const subject = `Update on your listing "${listingName}" — action needed`;
  const body = `
    <p style="margin:0 0 16px;">Dear ${name},</p>
    <p style="margin:0 0 16px;">Thank you for your interest in listing <strong>${listingName}</strong> on Yoga Founders Network. After review, we were unable to approve your submission at this time.</p>
    <p style="margin:0 0 8px;"><strong>Reason:</strong></p>
    <p style="margin:0 0 16px;padding:16px;background-color:${BG};border-left:3px solid ${SAGE};border-radius:2px;">${reason}</p>
    <p style="margin:0 0 16px;">You are welcome to make the necessary updates and resubmit your listing. Our team is happy to help guide you through the process — simply reply to this email with any questions.</p>
    <p style="margin:0;">With gratitude,<br/>The Yoga Founders Network Team</p>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: baseTemplate('Listing Review Update', body),
  });
}

// ── Lead Notification Email ────────────────────────────────────────────────

export async function sendLeadEmail(
  to: string,
  senderName: string,
  senderEmail: string,
  message: string,
  listingName: string
) {
  const subject = `New inquiry for ${listingName} via Yoga Founders Network`;
  const body = `
    <p style="margin:0 0 16px;">You have received a new inquiry through your <strong>${listingName}</strong> listing on Yoga Founders Network.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${BORDER};border-radius:4px;overflow:hidden;">
      <tr>
        <td style="padding:16px;background-color:${BG};">
          <p style="margin:0 0 8px;font-size:14px;font-family:Arial,sans-serif;"><strong>From:</strong> ${senderName}</p>
          <p style="margin:0 0 8px;font-size:14px;font-family:Arial,sans-serif;"><strong>Email:</strong> <a href="mailto:${senderEmail}" style="color:${SAGE};">${senderEmail}</a></p>
          <p style="margin:0 0 8px;font-size:14px;font-family:Arial,sans-serif;"><strong>Message:</strong></p>
          <p style="margin:0;font-size:15px;line-height:1.6;">${message}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 24px;">Reply directly to <a href="mailto:${senderEmail}" style="color:${SAGE};">${senderEmail}</a> to respond to this inquiry.</p>
    <p style="margin:0;font-size:13px;color:#888;font-family:Arial,sans-serif;">This inquiry was sent through your listing on Yoga Founders Network.</p>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: baseTemplate(`New Inquiry — ${listingName}`, body),
  });
}

// ── Newsletter Confirmation Email ──────────────────────────────────────────

export async function sendNewsletterConfirmation(to: string, confirmUrl: string) {
  const subject = 'Confirm your subscription to Yoga Founders Network';
  const body = `
    <p style="margin:0 0 16px;">Thank you for your interest in the Yoga Founders Network newsletter.</p>
    <p style="margin:0 0 24px;">Please confirm your subscription to start receiving updates on new studios, teachers, retreats, and articles from the global yoga community.</p>
    <p style="margin:0 0 24px;text-align:center;">
      <a href="${confirmUrl}" style="display:inline-block;background-color:${SAGE};color:#ffffff;padding:14px 32px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;letter-spacing:0.5px;">Confirm Subscription</a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#888;font-family:Arial,sans-serif;">If you did not sign up for this newsletter, you can safely ignore this email — you will not be subscribed.</p>
    <p style="margin:0;font-size:13px;color:#888;font-family:Arial,sans-serif;">This link will expire in 48 hours.</p>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: baseTemplate('Confirm Your Subscription', body),
  });
}

// ── Admin: New Listing Notification ───────────────────────────────────────

export async function sendAdminNewListing(
  listingName: string,
  listingType: string,
  submitterEmail: string
) {
  const subject = `New listing submitted: ${listingName}`;
  const body = `
    <p style="margin:0 0 16px;">A new listing has been submitted to Yoga Founders Network and is awaiting review.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${BORDER};border-radius:4px;overflow:hidden;">
      <tr>
        <td style="padding:16px;background-color:${BG};">
          <p style="margin:0 0 8px;font-size:14px;font-family:Arial,sans-serif;"><strong>Listing Name:</strong> ${listingName}</p>
          <p style="margin:0 0 8px;font-size:14px;font-family:Arial,sans-serif;"><strong>Type:</strong> ${listingType}</p>
          <p style="margin:0;font-size:14px;font-family:Arial,sans-serif;"><strong>Submitted By:</strong> <a href="mailto:${submitterEmail}" style="color:${SAGE};">${submitterEmail}</a></p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 24px;text-align:center;">
      <a href="https://yogafoundersnetwork.com/admin" style="display:inline-block;background-color:${SAGE};color:#ffffff;padding:14px 32px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;letter-spacing:0.5px;">Review in Admin</a>
    </p>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject,
    html: baseTemplate('New Listing Submission', body),
  });
}

// ── Admin: Listing Claim Request ──────────────────────────────────────────

export async function sendAdminClaimRequest(opts: {
  listingId: string;
  listingName: string;
  listingSlug: string;
  listingType: string;
  claimerEmail: string;
  claimerUserId: string;
  yogaAllianceId: string | null;
  relationship: string;
}) {
  const { listingId, listingName, listingSlug, listingType, claimerEmail, claimerUserId, yogaAllianceId, relationship } = opts;
  const subject = `Claim request: ${listingName}`;
  const body = `
    <p style="margin:0 0 16px;">A signed-in user has requested to claim a listing on Yoga Founders Network.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${BORDER};border-radius:4px;overflow:hidden;">
      <tr><td style="padding:16px;background-color:${BG};">
        <p style="margin:0 0 8px;font-size:14px;font-family:Arial,sans-serif;"><strong>Listing:</strong> ${listingName} (${listingType})</p>
        <p style="margin:0 0 8px;font-size:14px;font-family:Arial,sans-serif;"><strong>Listing ID:</strong> ${listingId}</p>
        <p style="margin:0 0 8px;font-size:14px;font-family:Arial,sans-serif;"><strong>Slug:</strong> ${listingSlug}</p>
        <p style="margin:0 0 8px;font-size:14px;font-family:Arial,sans-serif;"><strong>Claimer:</strong> <a href="mailto:${claimerEmail}" style="color:${SAGE};">${claimerEmail}</a></p>
        <p style="margin:0 0 8px;font-size:14px;font-family:Arial,sans-serif;"><strong>User ID:</strong> ${claimerUserId}</p>
        <p style="margin:0 0 8px;font-size:14px;font-family:Arial,sans-serif;"><strong>Yoga Alliance ID:</strong> ${yogaAllianceId ?? '—'}</p>
        <p style="margin:0;font-size:14px;font-family:Arial,sans-serif;"><strong>Relationship:</strong><br/>${relationship.replace(/\n/g, '<br/>')}</p>
      </td></tr>
    </table>
    <p style="margin:0 0 24px;text-align:center;">
      <a href="https://yogafoundersnetwork.com/admin" style="display:inline-block;background-color:${SAGE};color:#ffffff;padding:14px 32px;border-radius:4px;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;letter-spacing:0.5px;">Review in Admin</a>
    </p>
    <p style="margin:0;font-size:12px;color:#888;font-family:Arial,sans-serif;">To approve: set listings.owner_id = '${claimerUserId}' (and listings.yoga_alliance_id if provided) in Supabase.</p>
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject,
    html: baseTemplate('Listing Claim Request', body),
    replyTo: claimerEmail,
  });
}

// ── Chatbot escalation — sent when Lotus can't help or a password reset is requested ──

export async function sendEscalationEmail({
  sessionId,
  messages,
  userEmail,
}: {
  sessionId?: string;
  messages: { role: string; content: string }[];
  /** Account email the user shared in chat (e.g. password reset requests). */
  userEmail?: string;
}) {
  const transcript = messages
    .map(
      (m) =>
        `<p style="margin:8px 0;font-size:14px;font-family:Arial,sans-serif;"><strong>${m.role === 'user' ? '👤 User' : '🪷 Lotus'}:</strong> ${m.content}</p>`
    )
    .join('');

  const body = `
    <p style="margin:0 0 16px;">Lotus ${userEmail ? 'received a password reset request' : 'was unable to fully help a user and directed them to contact support'}.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid ${BORDER};border-radius:4px;overflow:hidden;">
      <tr><td style="padding:16px;background-color:${BG};">
        ${userEmail ? `<p style="margin:0 0 8px;font-size:15px;font-family:Arial,sans-serif;"><strong>🔑 User needs a password reset:</strong> <a href="mailto:${userEmail}" style="color:${SAGE};">${userEmail}</a></p>` : ''}
        <p style="margin:0 0 8px;font-size:14px;font-family:Arial,sans-serif;"><strong>Session ID:</strong> ${sessionId ?? 'n/a'}</p>
        <p style="margin:0;font-size:14px;font-family:Arial,sans-serif;"><strong>Time:</strong> ${new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' })} ET</p>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;font-size:14px;font-family:Arial,sans-serif;"><strong>Conversation transcript:</strong></p>
    ${transcript}
  `;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: [ADMIN_EMAIL, 'hi@arce.ca'],
    subject: userEmail
      ? `🔑 Password help requested by ${userEmail} — Yoga Founders Network`
      : `⚠️ Lotus escalated a conversation — Yoga Founders Network`,
    html: baseTemplate('Conversation Needs Follow-Up', body),
  });
}
