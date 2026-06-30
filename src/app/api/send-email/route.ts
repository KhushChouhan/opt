import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderId,
      dateStr,
      invoiceNo,
      customerName,
      customerPhone,
      customerAddress,
      pincode,
      productName,
      formattedPrice,
      utr,
      screenshot, // base64 Data URL
    } = body;

    // Retrieve environment variables
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpTo = process.env.SMTP_TO || 'hariyanaoptical49@gmail.com';

    console.log('API /api/send-email triggered for Order:', orderId);

    // If credentials are not set, return simulated success with warning log
    if (!smtpUser || !smtpPass) {
      console.warn('SMTP credentials not configured in environment variables. Email sending is simulated.');
      return NextResponse.json({
        success: true,
        message: 'Order email processed (Simulation mode: SMTP credentials missing from .env).',
        simulated: true,
      });
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Format HTML email body matching receipt design
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c7a14e; border-radius: 8px; background-color: #0a1220; color: #d3d3d3;">
        <div style="border-bottom: 2px solid #c7a14e; padding-bottom: 15px; margin-bottom: 20px; text-align: center;">
          <h2 style="color: #c7a14e; margin: 0; font-size: 24px; letter-spacing: 1px;">HARIYANA WATCH & OPTICAL</h2>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">New Order & UPI Payment Receipt</p>
        </div>

        <h3 style="color: #c7a14e; border-bottom: 1px solid #222; padding-bottom: 5px; font-size: 14px; text-transform: uppercase; tracking: 1px;">📦 Order Information</h3>
        <table style="width: 100%; font-size: 13px; margin-bottom: 20px;">
          <tr>
            <td style="color: #666; width: 120px; padding: 4px 0;">Order ID:</td>
            <td style="color: #fff; font-weight: bold;">${orderId}</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 4px 0;">Order Date:</td>
            <td style="color: #fff;">${dateStr}</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 4px 0;">Invoice No:</td>
            <td style="color: #fff; font-family: monospace;">${invoiceNo}</td>
          </tr>
        </table>

        <h3 style="color: #c7a14e; border-bottom: 1px solid #222; padding-bottom: 5px; font-size: 14px; text-transform: uppercase; tracking: 1px;">👤 Customer Information</h3>
        <table style="width: 100%; font-size: 13px; margin-bottom: 20px;">
          <tr>
            <td style="color: #666; width: 120px; padding: 4px 0;">Name:</td>
            <td style="color: #fff; font-weight: bold;">${customerName}</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 4px 0;">Mobile:</td>
            <td style="color: #fff;">${customerPhone}</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 4px 0;">Address:</td>
            <td style="color: #fff; line-height: 1.4;">${customerAddress}, PIN: ${pincode}</td>
          </tr>
        </table>

        <h3 style="color: #c7a14e; border-bottom: 1px solid #222; padding-bottom: 5px; font-size: 14px; text-transform: uppercase; tracking: 1px;">🛍️ Product Information</h3>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #333; background-color: rgba(255,255,255,0.02);">
            <th style="text-align: left; padding: 8px; color: #888;">Product Description</th>
            <th style="text-align: center; padding: 8px; color: #888; width: 50px;">Qty</th>
            <th style="text-align: right; padding: 8px; color: #888; width: 100px;">Price</th>
          </tr>
          <tr>
            <td style="padding: 8px; color: #fff; font-weight: bold;">${productName}</td>
            <td style="text-align: center; padding: 8px; color: #fff;">1</td>
            <td style="text-align: right; padding: 8px; color: #fff; font-weight: bold;">₹${formattedPrice}</td>
          </tr>
          <tr style="border-top: 1px solid #333; font-weight: bold; background-color: rgba(255,255,255,0.02);">
            <td colspan="2" style="text-align: right; padding: 8px; color: #888; font-size: 11px; text-transform: uppercase;">Total Amount:</td>
            <td style="text-align: right; padding: 8px; color: #c7a14e; font-size: 15px;">₹${formattedPrice}</td>
          </tr>
        </table>

        <h3 style="color: #c7a14e; border-bottom: 1px solid #222; padding-bottom: 5px; font-size: 14px; text-transform: uppercase; tracking: 1px;">💰 Payment Information</h3>
        <table style="width: 100%; font-size: 13px; margin-bottom: 20px;">
          <tr>
            <td style="color: #666; width: 120px; padding: 4px 0;">Amount Paid:</td>
            <td style="color: #c7a14e; font-weight: bold;">₹${formattedPrice}</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 4px 0;">Method:</td>
            <td style="color: #fff;">UPI (Unified Payments Interface)</td>
          </tr>
          <tr>
            <td style="color: #666; padding: 4px 0;">UTR / Txn ID:</td>
            <td style="color: #fff; font-family: monospace; font-weight: bold;">${utr || 'Not Provided (Check Screenshot)'}</td>
          </tr>
        </table>

        ${screenshot ? '<p style="font-size: 12px; color: #888; margin-top: 15px;">Note: A payment screenshot was uploaded by the customer and is attached below.</p>' : ''}
      </div>
    `;

    // Process attachments
    const attachments = [];
    if (screenshot) {
      const match = screenshot.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        const contentType = match[1];
        const base64Data = match[2];
        const ext = contentType.split('/')[1] || 'png';
        attachments.push({
          filename: `payment_screenshot_${orderId}.${ext}`,
          content: Buffer.from(base64Data, 'base64'),
          contentType: contentType,
        });
      }
    }

    // Send Mail
    await transporter.sendMail({
      from: `"Hariyana Watch Orders" <${smtpUser}>`,
      to: smtpTo,
      subject: `Order Payment Receipt Confirmation - ${orderId} (${customerName})`,
      html: htmlContent,
      attachments: attachments,
    });

    console.log(`Payment Receipt Email sent successfully for ${orderId}`);
    return NextResponse.json({ success: true, message: 'Payment Receipt email sent successfully!' });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in send-email API route:', err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
