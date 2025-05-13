import PDFDocument from 'pdfkit';
import { Response } from 'express';
import fs from 'fs';
import path from 'path';

// Define the sales report data type
type SalesReportData = {
  totalEarnings: number;
  totalCommissionEarnings: number;
  totalOwnerEarnings: number;
  totalDiscount: number;
  totalBookings: number;
  premiumBookings: number;
  refundedBookings: number;
  averageOrderValue: number;
  totalSubsEarnings: number;
  overallTotalEarnings: number;
};

/**
 * Generate a sales report PDF with improved alignment and simplified revenue table
 *
 * @param res - Express Response object
 * @param salesData - Sales data to include in the report
 * @param reportParams - Parameters used to generate the report
 */
export const generateSalesReportPDF = (
  res: Response,
  salesData: SalesReportData,
  reportParams: {
    type: 'yearly' | 'monthly' | 'custom';
    year: number;
    month?: number;
    from?: string;
    to?: string;
  }
) => {
  try {
    // Create a PDF document with consistent margins and A4 size
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
    });

    // Set response headers with dynamic filename
    let filename;
    if (reportParams.type === 'yearly') {
      filename = `sales-report-${reportParams.year}.pdf`;
    } else if (reportParams.type === 'monthly' && reportParams.month !== undefined) {
      filename = `sales-report-${reportParams.year}-${reportParams.month}.pdf`;
    } else {
      filename = `sales-report-${reportParams.from || 'start'}-to-${reportParams.to || 'end'}.pdf`;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Define colors and styling constants
    const colors = {
      primary: '#0D9488', // teal-500
      secondary: '#1E40AF', // blue-800
      accent: '#f0fdfa', // teal-50
      text: '#333333',
      light: '#f9f9f9',
      success: '#059669', // green-600
      danger: '#DC2626', // red-600
      warning: '#D97706', // amber-600
      border: '#e5e7eb', // gray-200
    };

    // Register the NotoSans font (mandatory)
    const fontPath = path.join(__dirname, '../../assets/fonts/NotoSans-Regular.ttf');
    if (!fs.existsSync(fontPath)) {
      throw new Error(`Font file not found at ${fontPath}`);
    }
    doc.registerFont('NotoSans', fontPath);

    // Draw header background
    doc.rect(0, 0, doc.page.width, 140).fill(colors.primary);

    // Add company name
    doc
      .fillColor('#ffffff')
      .fontSize(26)
      .font('NotoSans')
      .text('CAR RENTAL ADMIN', 50, 40);

    // Add report title
    doc
      .fontSize(22)
      .text('Sales Report', 50, 75);

    // Add report period
    let periodText = '';
    if (reportParams.type === 'yearly') {
      periodText = `Yearly Report - ${reportParams.year}`;
    } else if (reportParams.type === 'monthly' && reportParams.month !== undefined) {
      const monthName = new Date(reportParams.year, reportParams.month - 1).toLocaleString('default', { month: 'long' });
      periodText = `Monthly Report - ${monthName} ${reportParams.year}`;
    } else if (reportParams.type === 'custom') {
      periodText = `Custom Period: ${reportParams.from || 'Start'} to ${reportParams.to || 'End'}`;
    } else {
      periodText = `Report - ${new Date().toLocaleDateString()}`;
    }
    doc
      .fontSize(12)
      .text(periodText, 50, 105);

    // Add generated date
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 125);

    // Reset text color
    doc.fillColor(colors.text);

    // Summary Section
    const summaryY = 170;
    doc
      .rect(50, summaryY, doc.page.width - 100, 120)
      .lineWidth(1)
      .fillAndStroke(colors.accent, colors.border);

    doc
      .fontSize(16)
      .font('NotoSans')
      .fillColor(colors.primary)
      .text('Summary', 70, summaryY + 15);

    // Metrics in two columns with increased spacing
    const col1X = 70;
    const col2X = 300;
    const metricsStartY = summaryY + 40;
    const lineSpacing = 25;

    doc
      .fontSize(12)
      .font('NotoSans')
      .fillColor(colors.text)
      .text('Total Bookings:', col1X, metricsStartY)
      .text(salesData.totalBookings.toString(), col1X + 120, metricsStartY);

    doc
      .text('Premium Bookings:', col1X, metricsStartY + lineSpacing)
      .text(salesData.premiumBookings.toString(), col1X + 120, metricsStartY + lineSpacing);

    doc
      .text('Refunded Bookings:', col1X, metricsStartY + lineSpacing * 2)
      .text(salesData.refundedBookings.toString(), col1X + 120, metricsStartY + lineSpacing * 2);

    doc
      .text('Overall Earnings:', col2X, metricsStartY)
      .fillColor(colors.success)
      .text(`₹${salesData.overallTotalEarnings.toFixed(2)}`, col2X + 120, metricsStartY);

    doc
      .fillColor(colors.text)
      .text('Average Order Value:', col2X, metricsStartY + lineSpacing)
      .text(`₹${salesData.averageOrderValue.toFixed(2)}`, col2X + 120, metricsStartY + lineSpacing);

    doc
      .text('Total Discounts:', col2X, metricsStartY + lineSpacing * 2)
      .fillColor(colors.warning)
      .text(`₹${salesData.totalDiscount.toFixed(2)}`, col2X + 120, metricsStartY + lineSpacing * 2);

    // Revenue Breakdown Section
    const revenueY = summaryY + 140;
    doc
      .fillColor(colors.text)
      .fontSize(16)
      .text('Revenue Breakdown', 50, revenueY);

    // Table header
    doc
      .rect(50, revenueY + 25, doc.page.width - 100, 30)
      .fill(colors.primary);

    doc
      .fillColor('#ffffff')
      .fontSize(12)
      .text('Revenue Source', 70, revenueY + 37)
      .text('Amount (₹)', doc.page.width - 150, revenueY + 37, { align: 'right' });

    // Table rows
    let rowY = revenueY + 65;
    const addTableRow = (label: string, amount: number, fillColor?: string) => {
      doc
        .rect(50, rowY - 10, doc.page.width - 100, 30)
        .fillAndStroke(fillColor || colors.light, colors.border);

      doc
        .fillColor(colors.text)
        .fontSize(11)
        .text(label, 70, rowY);

      doc.text(`₹${amount.toFixed(2)}`, doc.page.width - 150, rowY, { align: 'right' });

      rowY += 30;
    };

    addTableRow('Commission Earnings', salesData.totalCommissionEarnings);
    addTableRow('Subscription Earnings', salesData.totalSubsEarnings);
    addTableRow('Car Owner Earnings', salesData.totalOwnerEarnings);
    addTableRow('Total Revenue', salesData.overallTotalEarnings, colors.accent);

    // Visual Breakdown (Bar Chart)
    const chartY = rowY + 30;
    doc
      .fontSize(16)
      .text('Visual Breakdown', 50, chartY);

    const drawBarChart = (y: number) => {
      const chartWidth = doc.page.width - 100;
      const barHeight = 25;
      const barGap = 15;
      const barStartX = 50;
      const maxBarLength = chartWidth - 180; // More space for labels

      // Background
      doc
        .rect(barStartX, y, chartWidth, (barHeight + barGap) * 3 + 20)
        .fill(colors.light);

      // Calculate percentages
      const total = salesData.overallTotalEarnings || 1; // Avoid division by zero
      const commissionPercent = salesData.totalCommissionEarnings / total;
      const subsPercent = salesData.totalSubsEarnings / total;
      const ownerPercent = salesData.totalOwnerEarnings / (salesData.totalEarnings || 1);

      // Draw bars with labels
      const labels = [
        { name: 'Commission', percent: commissionPercent, color: colors.primary },
        { name: 'Subscriptions', percent: subsPercent, color: colors.secondary },
        { name: 'Owner Earnings', percent: ownerPercent, color: colors.warning },
      ];

      labels.forEach((item, index) => {
        const barY = y + 10 + index * (barHeight + barGap);
        doc
          .rect(barStartX + 140, barY, maxBarLength * item.percent, barHeight)
          .fill(item.color);

        doc
          .fillColor(colors.text)
          .fontSize(10)
          .text(`${item.name}:`, barStartX + 10, barY + 8)
          .text(`${(item.percent * 100).toFixed(1)}%`, barStartX + 100, barY + 8);
      });
    };

    drawBarChart(chartY + 30);

    // Booking Statistics Section
    const bookingsStatsY = chartY + 150;
    doc
      .fontSize(16)
      .text('Booking Statistics', 50, bookingsStatsY);

    const boxWidth = (doc.page.width - 120) / 3;
    const boxHeight = 90;
    const boxY = bookingsStatsY + 30;

    // Total Bookings Box
    doc
      .rect(50, boxY, boxWidth, boxHeight)
      .lineWidth(1)
      .fillAndStroke('#f0f9ff', '#60a5fa');

    doc
      .fontSize(12)
      .fillColor('#1e40af')
      .text('Total Bookings', 65, boxY + 20, { align: 'center', width: boxWidth - 30 })
      .fontSize(20)
      .text(salesData.totalBookings.toString(), 65, boxY + 45, { align: 'center', width: boxWidth - 30 });

    // Premium Bookings Box
    doc
      .rect(60 + boxWidth, boxY, boxWidth, boxHeight)
      .fillAndStroke('#fdf2f8', '#ec4899');

    doc
      .fontSize(12)
      .fillColor('#9d174d')
      .text('Premium Bookings', 75 + boxWidth, boxY + 20, { align: 'center', width: boxWidth - 30 })
      .fontSize(20)
      .text(salesData.premiumBookings.toString(), 75 + boxWidth, boxY + 45, { align: 'center', width: boxWidth - 30 });

    // Refunded Bookings Box
    doc
      .rect(70 + boxWidth * 2, boxY, boxWidth, boxHeight)
      .fillAndStroke('#fef2f2', '#f87171');

    doc
      .fontSize(12)
      .fillColor('#b91c1c')
      .text('Refunded Bookings', 85 + boxWidth * 2, boxY + 20, { align: 'center', width: boxWidth - 30 })
      .fontSize(20)
      .text(salesData.refundedBookings.toString(), 85 + boxWidth * 2, boxY + 45, { align: 'center', width: boxWidth - 30 });


    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error generating sales report PDF:', error);
    res.status(500).send(`Error generating sales report PDF: }`);
  }
};