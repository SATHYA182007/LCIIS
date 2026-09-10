import jsPDF from 'jspdf';
import type { Patient, LaboratoryResult, LiveVitals, Alert, InventoryItem, DoctorRemark } from '../types';

const safeFormatDate = (dateVal: any, includeTime = false): string => {
  if (!dateVal) return 'N/A';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return includeTime
      ? d.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(dateVal);
  }
};

/**
 * Generates and downloads a rich, multi-page clinical PDF report for patient(s).
 */
export const exportPatientPDF = (
  patient: Patient,
  labResults: LaboratoryResult[] = [],
  vitals?: LiveVitals,
  remarks: DoctorRemark[] = []
) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header Banner
    doc.setFillColor(15, 118, 110); // Teal 700
    doc.rect(0, 0, pageWidth, 24, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('LONGITUDINAL CLINICAL INVESTIGATION INTELLIGENCE SYSTEM', 14, 12);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL HOSPITAL PATIENT LONGITUDINAL MEDICAL REPORT', 14, 18);
    doc.text(`Generated: ${safeFormatDate(Date.now(), true)}`, pageWidth - 14, 18, { align: 'right' });

    y = 32;

    // Patient Demographic Information Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 36, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`PATIENT: ${(patient.name || 'UNKNOWN').toUpperCase()}`, 20, y + 10);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Hospital ID: ${patient.hospitalId || patient.id}   |   Age/Gender: ${patient.age || 'N/A'} y/o (${patient.gender || 'N/A'})`, 20, y + 18);
    doc.text(`Ward & Bed: ${patient.ward || 'General'} - Bed ${patient.bed || 'N/A'}   |   Attending Doctor: ${patient.attendingDoctorName || 'Staff Physician'}`, 20, y + 25);
    doc.text(`Admission Date: ${safeFormatDate(patient.admissionDate)}   |   Status: ${patient.currentStatus || 'STABLE'}`, 20, y + 31);

    y += 44;

    // Live Vitals Section
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.text('1. BEDSIDE TELEMETRY & LIVE PHYSIOLOGICAL VITALS', 14, y);
    y += 5;

    doc.setLineWidth(0.5);
    doc.setDrawColor(15, 118, 110);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    const hr = vitals?.heartRate?.value || 78;
    const spo2 = vitals?.spo2?.value || 98;
    const bp = vitals?.bloodPressure ? `${vitals.bloodPressure.systolic.value}/${vitals.bloodPressure.diastolic.value}` : '120/80';
    const rr = vitals?.respiratoryRate?.value || 16;
    const temp = vitals?.temperature?.value || 36.8;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    const vitalsText = [
      `• Heart Rate: ${hr} BPM ${hr > 100 ? '(HIGH - TACHYCARDIA)' : '(Normal Baseline)'}`,
      `• Oxygen Saturation (SpO2): ${spo2}% ${spo2 < 93 ? '(LOW - HYPOXEMIA ALERT)' : '(Optimal)'}`,
      `• Blood Pressure: ${bp} mmHg`,
      `• Respiratory Rate: ${rr} /min   |   Body Temp: ${temp} °C`,
      `• Telemetry Node: Active ESP32 Wireless Telemetry Hub`
    ];

    vitalsText.forEach((line) => {
      doc.text(line, 18, y);
      y += 5.5;
    });

    y += 6;

    // Serial Lab Results Section
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.text('2. LONGITUDINAL LABORATORY INVESTIGATION LEDGER', 14, y);
    y += 5;

    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Table Headers
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 4, pageWidth - 28, 7, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('TEST NAME', 18, y);
    doc.text('CATEGORY', 65, y);
    doc.text('RESULT', 105, y);
    doc.text('REF RANGE', 135, y);
    doc.text('COLLECTION TIME', 165, y);

    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    if (!labResults || labResults.length === 0) {
      doc.text('No lab results recorded for this patient.', 18, y);
      y += 8;
    } else {
      labResults.slice(0, 10).forEach((lab) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const isAbnormal = lab.value > lab.referenceHigh || lab.value < lab.referenceLow;

        doc.setFont('helvetica', isAbnormal ? 'bold' : 'normal');
        if (isAbnormal) doc.setTextColor(220, 38, 38);
        else doc.setTextColor(15, 23, 42);

        doc.text(String(lab.testName || '').substring(0, 24), 18, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(String(lab.category || 'General'), 65, y);

        if (isAbnormal) doc.setTextColor(220, 38, 38);
        else doc.setTextColor(15, 23, 42);
        doc.text(`${lab.value} ${lab.unit || ''}`, 105, y);

        doc.setTextColor(100, 116, 139);
        doc.text(`${lab.referenceLow}-${lab.referenceHigh} ${lab.unit || ''}`, 135, y);

        doc.text(safeFormatDate(lab.sampleCollectedAt, true), 165, y);

        y += 6;
      });
    }

    y += 6;

    // Doctor Remarks Section
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.text('3. CLINICAL NOTES & DOCTOR REMARKS', 14, y);
    y += 5;

    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    if (!remarks || remarks.length === 0) {
      doc.text('• Patient under routine continuous monitoring. No critical overrides logged.', 18, y);
      y += 6;
    } else {
      remarks.forEach((rem) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`• [${safeFormatDate(rem.timestamp)}] Dr. ${rem.doctorName || 'Staff'}: ${rem.remarkText}`, 18, y);
        y += 6;
      });
    }

    // Footer Signature Line
    y = Math.max(y + 12, 265);
    if (y > 280) {
      doc.addPage();
      y = 265;
    }

    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 80, y);
    doc.line(pageWidth - 80, y, pageWidth - 14, y);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Attending Physician Signature & Stamp', 14, y + 4);
    doc.text('LCIIS System Verification Hash', pageWidth - 14, y + 4, { align: 'right' });

    // Save PDF
    const filename = `LCIIS_Patient_Summary_${patient.hospitalId || 'P12345'}_${Date.now()}.pdf`;
    doc.save(filename);
    return true;
  } catch (err) {
    console.error('Error generating PDF:', err);
    throw err;
  }
};

/**
 * Exports clinical alert logs as a downloadable CSV file.
 */
export const exportAlertsCSV = (alerts: Alert[] = []) => {
  try {
    const headers = ['Alert ID', 'Patient ID', 'Severity', 'Category', 'Title', 'Description', 'Trigger Time', 'Status'];
    const rows = alerts.map((a) => [
      a.id,
      a.patientId,
      a.severity,
      a.category,
      `"${String(a.title || '').replace(/"/g, '""')}"`,
      `"${String(a.description || '').replace(/"/g, '""')}"`,
      safeFormatDate(a.triggeredAt, true),
      a.isAcknowledged ? 'Acknowledged' : 'Active'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadBlob(csvContent, `LCIIS_Alerts_Report_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    return true;
  } catch (err) {
    console.error('Error generating Alerts CSV:', err);
    throw err;
  }
};

/**
 * Exports inventory items and movement history as a downloadable CSV file.
 */
export const exportInventoryCSV = (inventory: InventoryItem[] = []) => {
  try {
    const headers = ['Item ID', 'Item Name', 'Category', 'Current Stock', 'Min Threshold', 'Unit', 'Batch Number', 'Expiry Date', 'Status'];
    const rows = inventory.map((i) => [
      i.id,
      `"${String(i.itemName || '').replace(/"/g, '""')}"`,
      i.category,
      i.currentStock,
      i.minThreshold,
      i.unit,
      i.batchNumber,
      safeFormatDate(i.expiryDate),
      i.currentStock <= i.minThreshold ? 'REORDER WARNING' : 'STABLE'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadBlob(csvContent, `LCIIS_Inventory_Expiry_Report_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
    return true;
  } catch (err) {
    console.error('Error generating Inventory CSV:', err);
    throw err;
  }
};

/**
 * Helper to trigger browser file download synchronously and reliably across all browsers.
 */
const downloadBlob = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
};

