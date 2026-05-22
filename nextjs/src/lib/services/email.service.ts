interface SendPasswordResetEmailInput {
    to: string
    resetToken: string
}

function getAppUrl() {
    return (
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.APP_URL ||
        'http://localhost:3000'
    ).replace(/\/$/, '')
}

export async function sendPasswordResetEmail({
    to,
    resetToken,
}: SendPasswordResetEmailInput) {
    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.EMAIL_FROM

    if (!apiKey || !from) {
        console.warn(
            'Password reset email was not sent because RESEND_API_KEY or EMAIL_FROM is missing.'
        )
        return
    }

    const resetUrl = `${getAppUrl()}/reset-password?token=${encodeURIComponent(
        resetToken
    )}`

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to,
            subject: 'Reset your Treclone password',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
                    <h1 style="font-size: 20px;">Reset your password</h1>
                    <p>Use the button below to reset your Treclone password. This link expires in 1 hour.</p>
                    <p>
                        <a href="${resetUrl}" style="display: inline-block; background: #2f6b24; color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px;">
                            Reset password
                        </a>
                    </p>
                    <p>If you did not request this, you can ignore this email.</p>
                    <p style="font-size: 12px; color: #6b7280;">${resetUrl}</p>
                </div>
            `,
        }),
    })

    if (!response.ok) {
        const message = await response.text()
        throw new Error(`Failed to send password reset email: ${message}`)
    }
}
