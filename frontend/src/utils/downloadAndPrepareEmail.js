import downloadPDF from './downloadPDF';

// Utility to strip HTML tags from a string
const stripHtmlTags = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '');
};

const downloadAndPrepareEmail = async ({
  formData,
  totalExperience,
  currentCompany,
  setShowAttachReminder,
}) => {
  await downloadPDF('resume-preview'); // Pass elementId if different

  const formatCell = (label, value, labelWidth = 20) => {
    const val = value ? String(value) : '';
    return `${label.padEnd(labelWidth)}: ${val}`;
  };

  const subject = encodeURIComponent(`Resume of ${formData.name || 'Candidate'}`);
  const body = encodeURIComponent(
    `Hi,

Please find attached resume of ${formData.name}.

Candidate Summary:

${formatCell('Name', formData.name)}
${formatCell('Contact Number', formData.phone)}
${formatCell('Email', formData.email)}
${formatCell('Skills', formData.skills?.join(', ').slice(0, 100))}
${formatCell('Total Experience', totalExperience + ' years')}
${formatCell('Current Company', currentCompany)}

Summary:
${stripHtmlTags(formData.summary) || ''}

Best regards,  
${formData.name || ''}`
  );

  // Show reminder
  if (typeof setShowAttachReminder === 'function') {
    setShowAttachReminder(true);
    setTimeout(() => {
      setShowAttachReminder(false);
    }, 30000);
  }

  // Open default email client
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};

export default downloadAndPrepareEmail;
