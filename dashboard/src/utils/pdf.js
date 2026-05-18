import jsPDF from 'jspdf';

export function generateCasePDF(caseData, testimonies) {
  // eslint-disable-next-line new-cap
  const doc = jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SafeTrace — Rapport de dossier', 20, 20);

  doc.setFontSize(13);
  doc.text(`Dossier #${caseData.id}`, 20, 32);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const fields = [
    ['Nom',               caseData.person_name],
    ['Âge',              `${caseData.person_age} ans`],
    ['Sexe',              caseData.person_gender === 'M' ? 'Masculin' : 'Féminin'],
    ['Dernier lieu vu',   caseData.last_seen_location],
    ['Statut',            caseData.status],
    ['Description',       caseData.description],
    ['Signalé le',        new Date(caseData.created_at).toLocaleString('fr-FR')],
  ];

  let y = 46;
  fields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label} :`, 20, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(value ?? ''), pageWidth - 80);
    doc.text(lines, 70, y);
    y += 8 * lines.length + 2;
  });

  if (testimonies.length > 0) {
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Témoignages :', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    testimonies.forEach((t, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${t.content}`, pageWidth - 40);
      if (y + 8 * lines.length > 270) { doc.addPage(); y = 20; }
      doc.text(lines, 20, y);
      y += 8 * lines.length + 4;
    });
  }

  doc.save(`safetrace-dossier-${caseData.id}.pdf`);
}
