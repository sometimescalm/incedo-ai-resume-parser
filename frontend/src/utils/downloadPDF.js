import html2pdf from "html2pdf.js";

const downloadPDF = (elementId = "resume-preview", fileName = "resume.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Calculate full document height
  const body = document.body;
  const html = document.documentElement;
  const height = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );

  // Convert px → cm (1cm ≈ 35.35px)
  const heightCM = height / 35.35;

  const opt = {
    margin: 1,
    filename: fileName,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { dpi: 192, letterRendering: true, scale: 2, useCORS: true },
    jsPDF: {
      orientation: "portrait",
      unit: "cm",
      format: [heightCM, 33], // [height, width] in cm
    },
  };

  html2pdf().set(opt).from(element).save();
};

export default downloadPDF;
