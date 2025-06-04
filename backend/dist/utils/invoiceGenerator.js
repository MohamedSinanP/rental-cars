"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const generateInvoicePDF = (res, booking) => {
    var _a, _b;
    try {
        // Create a PDF document with better margins and size
        const doc = new pdfkit_1.default({
            margin: 50,
            size: 'A4',
        });
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${booking._id}.pdf`);
        // Pipe the PDF document to the response
        doc.pipe(res);
        // Define colors and styling constants - Changed primary color to teal
        const colors = {
            primary: '#0D9488', // Changed from #3366cc to teal-500
            secondary: '#666666',
            accent: '#e6e6e6',
            text: '#333333',
            light: '#f9f9f9',
        };
        // Register the NotoSans font (adjust the path as needed)
        const fontPath = path_1.default.join(__dirname, '../../assets/fonts/NotoSans-Regular.ttf');
        if (!fs_1.default.existsSync(fontPath)) {
            throw new Error(`Font file not found at ${fontPath}`);
        }
        doc.registerFont('NotoSans', fontPath);
        // Draw a colored header background
        doc.rect(0, 0, doc.page.width, 150).fill(colors.primary);
        // Add header text in white
        doc
            .fillColor('#ffffff')
            .fontSize(28)
            .font('Helvetica-Bold')
            .text('RENTAL CAR INVOICE', 50, 70);
        // Add invoice number as subheading
        doc
            .fontSize(12)
            .font('Helvetica')
            .text(`Invoice #: ${booking._id}`, 50, 105);
        // Add issue date
        doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 50, 120);
        // Reset text color for the rest of the document
        doc.fillColor(colors.text);
        // Customer and Owner Information sections - dual columns
        const startY = 180;
        // Customer Info - Left Column
        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .fillColor(colors.text) // Reset color after thank you message
            .text('CUSTOMER DETAILS', 50, startY);
        doc
            .fontSize(10)
            .font('Helvetica')
            .text(`Name: ${booking.userId.userName}`, 50, startY + 25)
            .text(`Email: ${booking.userId.email}`, 50, startY + 40)
            .text(`Phone: ${((_a = booking.userDetails) === null || _a === void 0 ? void 0 : _a.phoneNumber) || 'N/A'}`, 50, startY + 55)
            .text(`Address: ${((_b = booking.userDetails) === null || _b === void 0 ? void 0 : _b.address) || 'N/A'}`, 50, startY + 70);
        // Car Owner Info - Right Column
        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('CAR OWNER DETAILS', 300, startY);
        doc
            .fontSize(10)
            .font('Helvetica')
            .text(`Name: ${booking.ownerId.userName || 'N/A'}`, 300, startY + 25)
            .text(`Email: ${booking.ownerId.email || 'N/A'}`, 300, startY + 40);
        // Booking Details section
        const bookingY = startY + 110;
        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('BOOKING DETAILS', 50, bookingY);
        // Create a table-like structure with background
        doc.rect(50, bookingY + 25, doc.page.width - 100, 25).fill(colors.primary);
        // Table headers
        doc
            .fillColor('#ffffff')
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('DESCRIPTION', 60, bookingY + 35)
            .text('DETAILS', 350, bookingY + 35);
        // Reset color for table content
        doc.fillColor(colors.text);
        // Table rows
        let rowY = bookingY + 60;
        const addWrappedTableRow = (label, value) => {
            const rowHeight = 25;
            const maxWidth = doc.page.width - 420; // width for wrapped text
            const initialY = rowY;
            // Background for alternating rows
            if ((rowY - (bookingY + 60)) / rowHeight % 2 === 0) {
                doc.rect(50, rowY - 10, doc.page.width - 100, rowHeight).fill(colors.light);
            }
            doc
                .fillColor(colors.text)
                .fontSize(10)
                .font('Helvetica-Bold')
                .text(label, 60, rowY);
            const wrapped = doc
                .font('Helvetica')
                .text(value, 350, rowY, {
                width: maxWidth,
                continued: false,
            });
            // Update Y position for next row based on height of wrapped text
            rowY = Math.max(wrapped.y + 5, rowY + rowHeight);
        };
        const addTableRow = (label, value) => {
            // Add light background to alternate rows
            if ((rowY - (bookingY + 60)) / 25 % 2 === 0) {
                doc.rect(50, rowY - 10, doc.page.width - 100, 25).fill(colors.light);
            }
            doc
                .fillColor(colors.text)
                .fontSize(10)
                .font('Helvetica-Bold')
                .text(label, 60, rowY);
            doc.font('Helvetica').text(value, 350, rowY);
            rowY += 25;
        };
        // Add car details
        addTableRow('Car', booking.carId.carName);
        addTableRow('Car Model', booking.carId.carModel || 'N/A');
        // Add booking details
        addWrappedTableRow('Pickup Location', booking.pickupLocation);
        addWrappedTableRow('Dropoff Location', booking.dropoffLocation);
        addTableRow('Pickup Date & Time', new Date(booking.pickupDateTime).toLocaleString());
        addTableRow('Dropoff Date & Time', new Date(booking.dropoffDateTime).toLocaleString());
        addTableRow('Booking Status', booking.status || 'N/A');
        // Calculate rental duration in days
        const pickupDate = new Date(booking.pickupDateTime);
        const dropoffDate = new Date(booking.dropoffDateTime);
        const durationMs = dropoffDate.getTime() - pickupDate.getTime();
        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
        addTableRow('Rental Duration', `${durationDays} day${durationDays !== 1 ? 's' : ''}`);
        // Payment Information Section
        const paymentY = rowY + 20;
        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('PAYMENT DETAILS', 50, paymentY);
        // Add payment information box with background
        doc
            .rect(50, paymentY + 25, doc.page.width - 100, 120)
            .lineWidth(1)
            .fillAndStroke(colors.light, colors.primary);
        const paymentDetailsY = paymentY + 40;
        // Left side - payment method details
        doc
            .fontSize(8)
            .font('Helvetica-Bold')
            .fillColor(colors.text)
            .text('Payment Method:', 70, paymentDetailsY)
            .font('Helvetica')
            .text(booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1), 170, paymentDetailsY);
        doc
            .font('Helvetica-Bold')
            .text('Payment Status:', 70, paymentDetailsY + 20)
            .font('Helvetica')
            .text(booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1), 170, paymentDetailsY + 20);
        doc
            .font('Helvetica-Bold')
            .text('Payment ID:', 70, paymentDetailsY + 40)
            .font('Helvetica')
            .text(booking.paymentId, 170, paymentDetailsY + 40);
        // Right side - price breakdown
        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Price Breakdown:', 300, paymentDetailsY);
        const basePriceBeforeDiscount = booking.totalPrice / (1 - (booking.discountPercentage || 0) / 100);
        doc
            .font('NotoSans') // Use the registered NotoSans font
            .text(`Base Price:`, 300, paymentDetailsY + 20)
            .text(`\u20B9${basePriceBeforeDiscount.toFixed(2)}`, 450, paymentDetailsY + 20);
        if (booking.discountAmount || booking.discountPercentage) {
            doc
                .text(`Discount (${booking.discountPercentage || 0}%):`, 300, paymentDetailsY + 40)
                .text(`-\u20B9${(booking.discountAmount || 0).toFixed(2)}`, 450, paymentDetailsY + 40);
        }
        if (booking.isPremiumBooking) {
            doc
                .text('Premium Booking:', 300, paymentDetailsY + 60)
                .text('Yes', 450, paymentDetailsY + 60);
        }
        // Total line with bold formatting and larger font
        doc
            .fontSize(12)
            .font('NotoSans')
            .text('TOTAL AMOUNT:', 300, paymentDetailsY + 80)
            .text(`\u20B9${booking.totalPrice.toFixed(2)}`, 450, paymentDetailsY + 80);
        // Add a divider line
        const footerY = paymentY + 150;
        // Add footer
        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .fillColor(colors.text)
            .text('Thank you for choosing our car rental service.', 50, footerY, { align: 'center' });
        // Finalize the PDF
        doc.end();
    }
    catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating invoice PDF');
    }
};
exports.generateInvoicePDF = generateInvoicePDF;
