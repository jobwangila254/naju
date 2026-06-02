// Vercel Serverless Function: Email notifications for new delivery requests & contact messages
// Triggered by Supabase Database Webhooks
//
// Setup:
// 1. Sign up at https://resend.com (free tier: 100 emails/day)
// 2. Add your Resend API key to Vercel: vercel env add RESEND_API_KEY
// 3. Add your notification email: vercel env add NOTIFY_EMAIL
// 4. In Supabase Dashboard → Database → Webhooks:
//    - Create webhook on `delivery_requests` for INSERT event
//    - Create webhook on `contact_messages` for INSERT event
//    - Both point to: https://your-domain.vercel.app/api/notify
//    - HTTP method: POST
//    - Headers: Content-Type: application/json

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'info@najupoultry.co.ke';
const FROM_EMAIL = process.env.FROM_EMAIL || 'naju@notifications.najupoultry.co.ke';
const SITE_URL = process.env.SITE_URL || 'https://najupoultry.co.ke';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured');
        return res.status(200).json({ ok: true, note: 'Email not sent - RESEND_API_KEY not configured' });
    }

    try {
        const body = req.body;
        const record = body.record || {};
        const table = body.table;

        let subject, html;

        if (table === 'delivery_requests') {
            subject = `New Delivery Request - ${record.customer_name || 'Unknown'}`;
            html = `
                <h2 style="color:#2E7D32;">New Delivery Request</h2>
                <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border-bottom:1px solid #ddd;">${record.customer_name}</td></tr>
                    <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Phone</td><td style="padding:8px;border-bottom:1px solid #ddd;">${record.phone}</td></tr>
                    <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Address</td><td style="padding:8px;border-bottom:1px solid #ddd;">${record.address}</td></tr>
                    <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Product Interest</td><td style="padding:8px;border-bottom:1px solid #ddd;">${record.product_interest || 'N/A'}</td></tr>
                    <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Preferred Date</td><td style="padding:8px;border-bottom:1px solid #ddd;">${record.preferred_date || 'N/A'}</td></tr>
                    <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Payment</td><td style="padding:8px;border-bottom:1px solid #ddd;">${record.payment_method || 'N/A'} ${record.mpesa_code ? '- Code: ' + record.mpesa_code : ''}</td></tr>
                </table>
                <p style="margin-top:20px;"><a href="${SITE_URL}/admin.html" style="background:#2E7D32;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">View in Admin Panel</a></p>
            `;
        } else if (table === 'contact_messages') {
            subject = `New Contact Message - ${record.name || 'Unknown'}`;
            html = `
                <h2 style="color:#2E7D32;">New Contact Message</h2>
                <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border-bottom:1px solid #ddd;">${record.name}</td></tr>
                    <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border-bottom:1px solid #ddd;">${record.email}</td></tr>
                    <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Phone</td><td style="padding:8px;border-bottom:1px solid #ddd;">${record.phone || 'N/A'}</td></tr>
                    <tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">Message</td><td style="padding:8px;border-bottom:1px solid #ddd;">${record.message}</td></tr>
                </table>
                <p style="margin-top:20px;"><a href="${SITE_URL}/admin.html" style="background:#2E7D32;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">View in Admin Panel</a></p>
            `;
        } else {
            return res.status(200).json({ ok: true, note: 'Unrecognized table' });
        }

        const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [NOTIFY_EMAIL],
                subject: subject,
                html: html
            })
        });

        const result = await emailRes.json();
        console.log('Email result:', result);

        if (!emailRes.ok) {
            console.error('Resend error:', result);
            return res.status(200).json({ ok: true, note: 'Email failed: ' + (result.message || 'Unknown') });
        }

        return res.status(200).json({ ok: true, id: result.id });
    } catch (error) {
        console.error('Notification error:', error);
        return res.status(200).json({ ok: true, note: 'Error: ' + error.message });
    }
}
