import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { calculateGST } from '@/lib/gst-calculator';
import path from 'path';

// Register Noto Sans Devanagari for Hindi text
Font.register({
  family: 'NotoDevanagari',
  src: path.join(process.cwd(), 'public', 'fonts', 'NotoSansDevanagari.ttf'),
});

// Register Noto Sans Gujarati for Gujarati text
Font.register({
  family: 'NotoGujarati',
  src: path.join(process.cwd(), 'public', 'fonts', 'NotoSansGujarati.ttf'),
});

const border = '1pt solid #000';
const lightBorder = '0.5pt solid #000';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#000',
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  // ─── HEADER ───────────────────────────────────────────────────────────────
  headerWrapper: {
    border: border,
    textAlign: 'center',
    paddingTop: 6,
    paddingBottom: 6,
  },
  headerSanskrit: { fontFamily: 'NotoGujarati', fontSize: 7.5, color: '#222', marginBottom: 3 },
  companyName: { fontSize: 22, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  companyAddress: { fontSize: 7.5, marginTop: 2 },
  companyGstin: { fontSize: 9, fontFamily: 'Helvetica-Bold', marginTop: 3 },
  // ─── TAX INVOICE BAR ──────────────────────────────────────────────────────
  taxInvoiceBar: {
    borderBottom: border,
    borderLeft: border,
    borderRight: border,
    textAlign: 'center',
    paddingVertical: 4,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    textDecoration: 'underline',
  },
  // ─── TOP META ROW ─────────────────────────────────────────────────────────
  metaRow: {
    flexDirection: 'row',
    borderTop: lightBorder,
    borderLeft: border,
    borderRight: border,
  },
  metaRight: {
    flex: 1,
    borderLeft: lightBorder,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  metaLine: { flexDirection: 'row', marginBottom: 2 },
  metaLabel: { width: 75, fontFamily: 'Helvetica-Bold' },
  metaValue: { flex: 1 },
  // ─── PARTY / INVOICE DETAILS ──────────────────────────────────────────────
  partyRow: {
    flexDirection: 'row',
    borderTop: lightBorder,
    borderLeft: border,
    borderRight: border,
  },
  partyLeft: { flex: 1.2, paddingHorizontal: 6, paddingVertical: 4 },
  partyRight: { flex: 1, borderLeft: lightBorder, paddingHorizontal: 6, paddingVertical: 4 },
  partyLabel: { fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  partyName: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  challanRef: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginTop: 6,
  },
  // ─── ITEMS TABLE ──────────────────────────────────────────────────────────
  table: {
    borderLeft: border,
    borderRight: border,
    borderTop: lightBorder,
    borderBottom: border,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottom: border,
    backgroundColor: '#f5f5f5',
  },
  tableDataRow: {
    flexDirection: 'row',
    minHeight: 22,
  },
  cell: {
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRight: lightBorder,
    alignSelf: 'stretch',
  },
  cellLast: {
    paddingHorizontal: 4,
    paddingVertical: 3,
    alignSelf: 'stretch',
  },
  // column widths
  colSr:   { width: '6%' },
  colDesc: { width: '38%' },
  colHsn:  { width: '13%', textAlign: 'center' },
  colQty:  { width: '11%', textAlign: 'center' },
  colRate: { width: '12%', textAlign: 'right' },
  colAmt:  { width: '20%', textAlign: 'right' },
  headerCell: { fontFamily: 'Helvetica-Bold', fontSize: 8, textAlign: 'center' },
  // ─── SUBTOTALS ROWS (after items) ─────────────────────────────────────────
  subtotalRow: {
    flexDirection: 'row',
    borderBottom: lightBorder,
    borderLeft: border,
    borderRight: border,
  },
  subtotalLabelCell: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
    textAlign: 'right',
    borderRight: lightBorder,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
  },
  subtotalValueCell: {
    width: '20%',
    paddingHorizontal: 4,
    paddingVertical: 2,
    textAlign: 'right',
  },
  // ─── AMOUNT / TAX SECTION ─────────────────────────────────────────────────
  amountTaxRow: {
    flexDirection: 'row',
    borderLeft: border,
    borderRight: border,
    borderTop: lightBorder,
  },
  amountLeft: {
    flex: 1,
    borderRight: lightBorder,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  taxRight: {
    width: '40%',
  },
  taxLine: {
    flexDirection: 'row',
    borderBottom: lightBorder,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  taxLineLabel: { flex: 1, fontSize: 8 },
  taxLineRate: { width: 36, textAlign: 'center', fontSize: 8 },
  taxLineAmt: { width: 55, textAlign: 'right', fontSize: 8 },
  taxGrandTotal: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingVertical: 3,
    backgroundColor: '#f0f0f0',
  },
  taxGrandLabel: { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 9 },
  taxGrandAmt: { width: 55, textAlign: 'right', fontFamily: 'Helvetica-Bold', fontSize: 9 },
  // ─── BANK / REMARKS ───────────────────────────────────────────────────────
  bankRemarksRow: {
    flexDirection: 'row',
    borderLeft: border,
    borderRight: border,
    borderTop: lightBorder,
    minHeight: 60,
  },
  bankLeft: {
    flex: 1,
    borderRight: lightBorder,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  remarksRight: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  // ─── TERMS ────────────────────────────────────────────────────────────────
  termsRow: {
    borderLeft: border,
    borderRight: border,
    borderTop: lightBorder,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minHeight: 30,
  },
  // ─── SIGNATURE ROW ────────────────────────────────────────────────────────
  signatureRow: {
    flexDirection: 'row',
    borderLeft: border,
    borderRight: border,
    borderTop: lightBorder,
    borderBottom: border,
    minHeight: 50,
  },
  signLeft: {
    flex: 1,
    borderRight: lightBorder,
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'flex-end',
  },
  signRight: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  bold: { fontFamily: 'Helvetica-Bold' },
  small: { fontSize: 7.5 },
});

function fmt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtInt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InvoicePDF({ invoice, companySettings, party }: any) {
  // Server-accurate GST calculation
  const gst = calculateGST({
    items: invoice.items.map((i: any) => ({ quantity: Number(i.quantity), rate: Number(i.rate), amount: Number(i.amount) })),
    discountPercent: Number(invoice.discountPercent),
    isIntraState: invoice.isIntraState,
    cgstRate: Number(invoice.cgstRate),
    sgstRate: Number(invoice.sgstRate),
    igstRate: Number(invoice.igstRate),
  });

  const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── COMPANY HEADER ─────────────────────────────────────────────── */}
        <View style={styles.headerWrapper}>
          <Text style={styles.headerSanskrit}>|| શ્રી ગણેશાય નમઃ ||</Text>
          <Text style={styles.companyName}>{companySettings.companyName.toUpperCase()}</Text>
          <Text style={styles.companyAddress}>{companySettings.addressLine}</Text>
          <Text style={styles.companyGstin}>GST No : {companySettings.gstin}</Text>
        </View>

        {/* ── TAX INVOICE BAR ────────────────────────────────────────────── */}
        <View style={styles.taxInvoiceBar}>
          <Text>TAX INVOICE</Text>
        </View>

        {/* ── INVOICE META (No & Date) ────────────────────────────────────── */}
        <View style={styles.metaRow}>
          <View style={{ flex: 0, width: '0%' }} />
          <View style={styles.metaRight}>
            <View style={styles.metaLine}>
              <Text style={styles.metaLabel}>Invoice No :</Text>
              <Text style={[styles.metaValue, styles.bold]}>{invoice.invoiceNo}</Text>
            </View>
            <View style={styles.metaLine}>
              <Text style={styles.metaLabel}>Invoice Date :</Text>
              <Text style={[styles.metaValue, styles.bold]}>{invoiceDate}</Text>
            </View>
          </View>
        </View>

        {/* ── PARTY / PLACE OF SUPPLY ────────────────────────────────────── */}
        <View style={styles.partyRow}>
          <View style={styles.partyLeft}>
            <Text style={styles.partyLabel}>Party Name :</Text>
            <Text style={styles.partyName}>{party.name}</Text>
            {party.addressLine1 ? <Text>{party.addressLine1}</Text> : null}
            {party.addressLine2 ? <Text>{party.addressLine2}</Text> : null}
            {party.cityPin    ? <Text>{party.cityPin}</Text>    : null}
            {party.stateName  ? <Text>{party.stateName?.toUpperCase()}</Text>  : null}
          </View>
          <View style={styles.partyRight}>
            <View style={styles.metaLine}>
              <Text style={[styles.metaLabel, { width: 90 }]}>Place of Supply :</Text>
              <Text style={[styles.metaValue, styles.bold]}>{invoice.placeOfSupply}</Text>
            </View>
            <View style={styles.metaLine}>
              <Text style={[styles.metaLabel, { width: 90 }]}>PAN :</Text>
              <Text style={styles.metaValue}>{party.pan || '-'}</Text>
            </View>
            <View style={styles.metaLine}>
              <Text style={[styles.metaLabel, { width: 90 }]}>GST No :</Text>
              <Text style={styles.metaValue}>{party.gstin || '-'}</Text>
            </View>
            {invoice.challanRef ? (
              <Text style={styles.challanRef}>{invoice.challanRef}</Text>
            ) : null}
          </View>
        </View>

        {/* ── ITEMS TABLE ────────────────────────────────────────────────── */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.cell, styles.colSr]}>
              <Text style={styles.headerCell}>Sr. No.</Text>
            </View>
            <View style={[styles.cell, styles.colDesc]}>
              <Text style={styles.headerCell}>Description of Goods / Services</Text>
            </View>
            <View style={[styles.cell, styles.colHsn]}>
              <Text style={styles.headerCell}>HSN Code</Text>
            </View>
            <View style={[styles.cell, styles.colQty]}>
              <Text style={styles.headerCell}>Quantity</Text>
            </View>
            <View style={[styles.cell, styles.colRate]}>
              <Text style={styles.headerCell}>Rate</Text>
            </View>
            <View style={[styles.cellLast, styles.colAmt]}>
              <Text style={[styles.headerCell]}>Amount</Text>
            </View>
          </View>

          {/* Data rows */}
          {invoice.items.map((item: any, idx: number) => (
            <View key={idx} style={styles.tableDataRow}>
              <View style={[styles.cell, styles.colSr]}>
                <Text style={{ textAlign: 'center' }}>{item.srNo}</Text>
              </View>
              <View style={[styles.cell, styles.colDesc]}>
                <Text>{item.description}</Text>
              </View>
              <View style={[styles.cell, styles.colHsn]}>
                <Text style={{ textAlign: 'center' }}>{item.hsnCode}</Text>
              </View>
              <View style={[styles.cell, styles.colQty]}>
                <Text style={{ textAlign: 'center' }}>{Number(item.quantity).toFixed(2)}</Text>
              </View>
              <View style={[styles.cell, styles.colRate]}>
                <Text style={{ textAlign: 'right' }}>{Number(item.rate).toFixed(2)}</Text>
              </View>
              <View style={[styles.cellLast, styles.colAmt]}>
                <Text style={{ textAlign: 'right' }}>{fmt(Number(item.amount))}</Text>
              </View>
            </View>
          ))}

          {/* Empty filler rows for visual breathing room */}
          {Array.from({ length: Math.max(0, 14 - invoice.items.length) }).map((_, i) => (
            <View key={`empty-${i}`} style={[styles.tableDataRow, { minHeight: 22 }]}>
              <View style={[styles.cell, styles.colSr]}><Text> </Text></View>
              <View style={[styles.cell, styles.colDesc]}><Text> </Text></View>
              <View style={[styles.cell, styles.colHsn]}><Text> </Text></View>
              <View style={[styles.cell, styles.colQty]}><Text> </Text></View>
              <View style={[styles.cell, styles.colRate]}><Text> </Text></View>
              <View style={[styles.cellLast, styles.colAmt]}><Text> </Text></View>
            </View>
          ))}
        </View>

        {/* ── DISCOUNT ROW ───────────────────────────────────────────────── */}
        {gst.discountAmount > 0 && (
          <View style={styles.subtotalRow}>
            <View style={styles.subtotalLabelCell}>
              <Text>Discount</Text>
            </View>
            <View style={[styles.subtotalValueCell, { borderRight: lightBorder, width: '12%', textAlign: 'right', paddingHorizontal: 4, paddingVertical: 2 }]}>
              <Text style={{ textAlign: 'right' }}>{Number(invoice.discountPercent).toFixed(2)}%</Text>
            </View>
            <View style={[styles.subtotalValueCell]}>
              <Text style={{ textAlign: 'right' }}>{fmt(gst.discountAmount)}</Text>
            </View>
          </View>
        )}

        {/* ── TOTAL ROW ──────────────────────────────────────────────────── */}
        <View style={styles.subtotalRow}>
          <View style={[styles.subtotalLabelCell, { textAlign: 'right' }]}>
            <Text>Total .</Text>
          </View>
          <View style={[styles.subtotalValueCell, { borderRight: lightBorder, width: '12%' }]}>
            <Text> </Text>
          </View>
          <View style={styles.subtotalValueCell}>
            <Text style={[styles.bold, { textAlign: 'right' }]}>{fmt(gst.taxableTotal)}</Text>
          </View>
        </View>

        {/* ── AMOUNT IN WORDS + TAX TABLE ────────────────────────────────── */}
        <View style={styles.amountTaxRow}>
          <View style={styles.amountLeft}>
            <Text style={styles.bold}>Amount in Words :</Text>
            <Text style={{ marginTop: 3, fontSize: 8 }}>{invoice.amountInWords}</Text>
          </View>
          <View style={styles.taxRight}>
            {/* CGST */}
            <View style={styles.taxLine}>
              <Text style={styles.taxLineLabel}>CGST @</Text>
              <Text style={styles.taxLineRate}>{invoice.isIntraState ? Number(invoice.cgstRate).toFixed(2) : '0.00'}%</Text>
              <Text style={styles.taxLineAmt}>{invoice.isIntraState ? fmt(gst.cgstAmount) : '-'}</Text>
            </View>
            {/* SGST */}
            <View style={styles.taxLine}>
              <Text style={styles.taxLineLabel}>SGST @</Text>
              <Text style={styles.taxLineRate}>{invoice.isIntraState ? Number(invoice.sgstRate).toFixed(2) : '0.00'}%</Text>
              <Text style={styles.taxLineAmt}>{invoice.isIntraState ? fmt(gst.sgstAmount) : '-'}</Text>
            </View>
            {/* IGST */}
            <View style={styles.taxLine}>
              <Text style={styles.taxLineLabel}>IGST @</Text>
              <Text style={styles.taxLineRate}>{!invoice.isIntraState ? Number(invoice.igstRate).toFixed(2) : '0.00'}%</Text>
              <Text style={styles.taxLineAmt}>{!invoice.isIntraState ? fmt(gst.igstAmount) : '-'}</Text>
            </View>
            {/* Round Off */}
            <View style={styles.taxLine}>
              <Text style={[styles.taxLineLabel, { flex: 1 }]}>Round Off</Text>
              <Text style={styles.taxLineRate}> </Text>
              <Text style={styles.taxLineAmt}>{gst.roundOff !== 0 ? fmt(gst.roundOff) : '-'}</Text>
            </View>
            {/* Grand Total */}
            <View style={styles.taxGrandTotal}>
              <Text style={styles.taxGrandLabel}>Grand Total</Text>
              <Text style={styles.taxGrandAmt}>{fmt(gst.grandTotal)}</Text>
            </View>
          </View>
        </View>

        {/* ── BANK DETAILS / REMARKS ─────────────────────────────────────── */}
        <View style={styles.bankRemarksRow}>
          <View style={styles.bankLeft}>
            <Text style={styles.bold}>Bank Details :</Text>
            {companySettings.bankName     ? <Text style={styles.small}>Bank Name : {companySettings.bankName}</Text>     : null}
            {companySettings.bankBranch   ? <Text style={styles.small}>Branch : {companySettings.bankBranch}</Text>   : null}
            {companySettings.bankAccountNo ? <Text style={styles.small}>Bank A/C : {companySettings.bankAccountNo}</Text> : null}
            {companySettings.bankIfsc     ? <Text style={styles.small}>Bank IFSC : {companySettings.bankIfsc}</Text>   : null}
          </View>
          <View style={styles.remarksRight}>
            <Text style={styles.bold}>Remarks :</Text>
            {invoice.remarks ? <Text style={styles.small}>{invoice.remarks}</Text> : null}
          </View>
        </View>

        {/* ── TERMS & CONDITIONS ─────────────────────────────────────────── */}
        <View style={styles.termsRow}>
          <Text style={styles.bold}>Terms & Conditions :</Text>
          {(companySettings.termsConditions || '').split('\n').map((line: string, i: number) => (
            <Text key={i} style={styles.small}>{line}</Text>
          ))}
        </View>

        {/* ── SIGNATURE ROW ──────────────────────────────────────────────── */}
        <View style={styles.signatureRow}>
          <View style={styles.signLeft}>
            <Text style={styles.small}>Receiver Sign</Text>
          </View>
          <View style={styles.signRight}>
            <Text style={[styles.bold, styles.small]}>For {companySettings.companyName}</Text>
            <Text style={{ ...styles.small, marginTop: 20 }}>Authorised Signatory</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
