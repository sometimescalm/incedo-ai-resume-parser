import html2pdf from "html2pdf.js";

const downloadPDF = (elementId = "resume-preview", fileName = "resume.pdf") => {
  return new Promise((resolve, reject) => {
    const element = document.getElementById(elementId);
    if (!element) {
      reject(new Error(`Element with ID "${elementId}" not found`));
      return;
    }

    const opt = {
      margin: [0.2, 0, 0.5, 0],
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
      },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};

export default downloadPDF;
