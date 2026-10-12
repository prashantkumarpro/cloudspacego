import 'dotenv/config'
import { Resend } from 'resend'
import Share from '../models/share.model.js'

/**
 * Resolve the base application URL from environment variables.
 * Falls back to CORS_ORIGIN or default development URL.
 */
export function getAppUrl() {
  const url =
    process.env.APP_URL ||
    process.env.CLIENT_URL ||
    process.env.CORS_ORIGIN ||
    'http://localhost:3000'
  return url.trim().replace(/\/+$/, '')
}

/**
 * Resolve the sender address configured for CloudSpaceGo emails.
 * Defaults to the verified domain sender used by sendOtpService.
 */
export function getSenderEmail() {
  return (
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM ||
    'cloudspacego <otp@pkdev.pro>'
  )
}

/**
 * Log error details safely without leaking credentials, cookies, or secrets.
 */
function logSafeEmailError(context, err) {
  const message = err?.message || String(err)
  const code = err?.statusCode || err?.code || 'ERR_EMAIL'
  console.error(`[ShareEmailService] ${context} (code: ${code}): ${message}`)
}

/**
 * Generates an email HTML template styled with CloudSpaceGo branding.
 */
export function generateShareEmailHtml({
  ownerName,
  recipientName,
  fileName,
  role,
  openUrl
}) {
  const currentYear = new Date().getFullYear()
  const displayOwner = ownerName || 'A teammate'
  const displayFile = fileName || 'Untitled file'
  const displayRole = role?.toLowerCase() === 'editor' ? 'Editor' : 'Viewer'
  const roleBadgeBg = displayRole === 'Editor' ? '#EFF6FF' : '#EEF2FF'
  const roleBadgeBorder = displayRole === 'Editor' ? '#BFDBFE' : '#C7D2FE'
  const roleBadgeColor = displayRole === 'Editor' ? '#2563EB' : '#6E60EE'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>File shared with you on CloudSpaceGo</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f6f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #111827;
  -webkit-font-smoothing: antialiased;
">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="
          max-width: 520px;
          background-color: #ffffff;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        ">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 36px 32px 20px 32px; text-align: center; border-bottom: 1px solid #f3f4f6;">
              <h1 style="
                margin: 0 0 6px 0;
                color: #111827;
                font-size: 26px;
                font-weight: 800;
                letter-spacing: -0.5px;
              ">
                cloudspacego
              </h1>
              <p style="
                margin: 0;
                color: #6E60EE;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 1.2px;
                text-transform: uppercase;
              ">
                Secure File Sharing
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="
                margin: 0 0 12px 0;
                font-size: 19px;
                font-weight: 700;
                color: #111827;
              ">
                New file shared with you
              </h2>
              <p style="
                margin: 0 0 24px 0;
                font-size: 14px;
                line-height: 1.6;
                color: #4b5563;
              ">
                Hello${recipientName ? ' ' + recipientName : ''},<br/>
                <strong style="color: #111827;">${displayOwner}</strong> has shared a file with you on CloudSpaceGo.
              </p>

              <!-- Resource Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                margin-bottom: 28px;
              ">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="margin-bottom: 12px;">
                      <span style="
                        display: block;
                        font-size: 11px;
                        font-weight: 600;
                        color: #64748b;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-bottom: 4px;
                      ">Shared File</span>
                      <span style="
                        font-size: 15px;
                        font-weight: 700;
                        color: #0f172a;
                        word-break: break-all;
                      ">${displayFile}</span>
                    </div>

                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" valign="top">
                          <span style="
                            display: block;
                            font-size: 11px;
                            font-weight: 600;
                            color: #64748b;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 4px;
                          ">Shared By</span>
                          <span style="font-size: 13px; font-weight: 600; color: #334155;">
                            ${displayOwner}
                          </span>
                        </td>
                        <td width="50%" valign="top">
                          <span style="
                            display: block;
                            font-size: 11px;
                            font-weight: 600;
                            color: #64748b;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            margin-bottom: 4px;
                          ">Permission Level</span>
                          <span style="
                            display: inline-block;
                            background-color: ${roleBadgeBg};
                            color: ${roleBadgeColor};
                            border: 1px solid ${roleBadgeBorder};
                            font-size: 12px;
                            font-weight: 700;
                            padding: 2px 10px;
                            border-radius: 16px;
                          ">
                            ${displayRole}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call To Action Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${openUrl}" target="_blank" rel="noopener noreferrer" style="
                      display: inline-block;
                      background-color: #6E60EE;
                      color: #ffffff;
                      font-size: 14px;
                      font-weight: 600;
                      text-decoration: none;
                      padding: 13px 32px;
                      border-radius: 8px;
                      box-shadow: 0 2px 8px rgba(110, 96, 238, 0.35);
                    ">
                      Open in CloudSpaceGo
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Direct URL Fallback -->
              <p style="
                margin: 0;
                font-size: 12px;
                line-height: 1.6;
                color: #6b7280;
                text-align: center;
              ">
                Or copy and paste this URL into your browser:<br/>
                <a href="${openUrl}" target="_blank" rel="noopener noreferrer" style="
                  color: #6E60EE;
                  word-break: break-all;
                  text-decoration: underline;
                ">${openUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding: 20px 32px 28px 32px;
              background-color: #fafbfc;
              border-top: 1px solid #e5e7eb;
              text-align: center;
            ">
              <p style="
                margin: 0 0 6px 0;
                font-size: 11px;
                line-height: 1.5;
                color: #9ca3af;
              ">
                You received this notification because a file was shared with your CloudSpaceGo account.
              </p>
              <p style="
                margin: 0;
                font-size: 11px;
                color: #9ca3af;
              ">
                &copy; ${currentYear} cloudspacego. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Send a file sharing notification email using Resend.
 * Includes safe retry logic for transient failures.
 */
export async function sendShareNotificationEmail({
  ownerName,
  recipientEmail,
  recipientName,
  fileName,
  role,
  fileId,
  appUrl
}) {
  const targetAppUrl = appUrl || getAppUrl()
  const openUrl = `${targetAppUrl}/dashboard?section=Shared`
  const permissionLabel = role?.toLowerCase() === 'editor' ? 'Editor' : 'Viewer'
  const displayName = ownerName || 'A CloudSpaceGo user'
  const html = generateShareEmailHtml({
    ownerName: displayName,
    recipientName: recipientName || '',
    fileName: fileName || 'Shared File',
    role: permissionLabel,
    openUrl
  })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    const errorMsg = 'RESEND_API_KEY environment variable is not configured'
    console.warn(`[ShareEmailService] ${errorMsg}`)
    return {
      success: false,
      error: errorMsg,
      openUrl
    }
  }

  const resend = new Resend(apiKey)
  const from = getSenderEmail()
  const subject = `${displayName} shared "${fileName || 'a file'}" with you on CloudSpaceGo`

  let lastError = null

  // Attempt send with up to 1 retry on failure
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await resend.emails.send({
        from,
        to: recipientEmail,
        subject,
        html
      })

      if (response?.error) {
        lastError = new Error(response.error.message || 'Resend delivery rejected')
        logSafeEmailError(`Attempt ${attempt} Resend API error`, lastError)
      } else {
        return {
          success: true,
          messageId: response?.data?.id || null,
          openUrl
        }
      }
    } catch (err) {
      lastError = err
      logSafeEmailError(`Attempt ${attempt} network exception`, err)
    }

    if (attempt < 2) {
      // Brief backoff before retry
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Failed to deliver notification email',
    openUrl
  }
}

/**
 * Dispatches the email notification for a Share record and updates its tracking fields.
 * Safe guarantee: Does not delete or invalidate the Share record if email fails.
 */
export async function dispatchShareEmailAndUpdateRecord({
  share,
  owner,
  recipient,
  file,
  appUrl
}) {
  if (!share || !recipient?.email) {
    return {
      success: false,
      error: 'Missing required share or recipient email'
    }
  }

  const ownerDisplayName = owner?.name?.trim() || owner?.email || 'A CloudSpaceGo user'
  const recipientDisplayName = recipient?.name?.trim() || ''
  const fileName = file?.name || 'Shared File'

  try {
    const result = await sendShareNotificationEmail({
      ownerName: ownerDisplayName,
      recipientEmail: recipient.email,
      recipientName: recipientDisplayName,
      fileName,
      role: share.role,
      fileId: share.fileId,
      appUrl
    })

    if (result.success) {
      share.notificationStatus = 'sent'
      share.notificationSentAt = new Date()
      share.notificationError = null
      await share.save()
    } else {
      share.notificationStatus = 'failed'
      share.notificationError = result.error || 'Delivery failed'
      await share.save()
    }

    return result
  } catch (err) {
    logSafeEmailError('Unexpected error in dispatchShareEmailAndUpdateRecord', err)
    try {
      share.notificationStatus = 'failed'
      share.notificationError = err?.message || 'Unexpected email dispatch error'
      await share.save()
    } catch (saveErr) {
      logSafeEmailError('Failed to persist share notification failure status', saveErr)
    }

    return {
      success: false,
      error: err?.message || 'Unexpected email error'
    }
  }
}

/**
 * Retry sending the email notification for an existing active share.
 */
export async function retryShareNotification(shareId, appUrl) {
  const share = await Share.findById(shareId)
    .populate('ownerId', 'name email')
    .populate('recipientId', 'name email')
    .populate('fileId', 'name')

  if (!share) {
    return { success: false, error: 'Share record not found' }
  }

  if (share.status !== 'active') {
    return { success: false, error: 'Cannot notify for inactive/revoked share' }
  }

  return dispatchShareEmailAndUpdateRecord({
    share,
    owner: share.ownerId,
    recipient: share.recipientId,
    file: share.fileId,
    appUrl
  })
}
