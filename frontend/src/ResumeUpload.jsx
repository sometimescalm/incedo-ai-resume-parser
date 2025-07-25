import React, { useState } from 'react';
import 'antd/dist/reset.css';
import { Upload, Typography, Card, Button, Layout, Steps, Spin } from 'antd';
import { InboxOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { Header, Content } = Layout;


const ResumeUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSteps, setShowSteps] = useState(false);

  const navigate = useNavigate();

  const stepItems = [
    { title: 'Analyzing your uploaded resume' },
    { title: 'Extracting text from the uploaded resume' },
    { title: 'Mapping to the Incedo template' },
    { title: 'Finalizing and redirecting' },
  ];


  const props = {
    name: 'file',
    multiple: false,
    accept: '.pdf,.docx',
    showUploadList: false,
    beforeUpload: (file) => {
      setSelectedFile(file);
      return false;
    },
  };

  const isResumeText = (text) => {
    const resumeKeywords = [
      'objective', 'experience', 'education', 'projects', 'skills',
      'certifications', 'summary', 'achievements', 'languages'
    ];
    const found = resumeKeywords.filter(kw => text.toLowerCase().includes(kw));
    return found.length >= 3;
  };

  const extractTextFromPDF = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }
          resolve(fullText);
        } catch (error) {
          console.error("PDF Extraction Error:", error);
          reject(error);
        }
      };
      reader.onerror = (e) => {
        console.error("FileReader Error:", e);
        reject("Failed to read file");
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const simulateSteps = async () => {
    for (let i = 0; i < stepItems.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 800)); // ~800ms per step
    }
  };

  const handleProceed = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setShowSteps(true);

    try {
      // Step 0: Analyzing your uploaded resume
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Step 1: Extracting text
      setCurrentStep(1);
      let text;
      if (selectedFile.name.endsWith('.pdf')) {
        text = await extractTextFromPDF(selectedFile);
      } else if (selectedFile.name.endsWith('.docx')) {
        text = await extractTextFromDocx(selectedFile);
      } else {
        alert("Unsupported file format.");
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate fixed step time

      if (!text || text.trim().length === 0) {
        alert("❌ The uploaded file appears to be empty. Please upload a valid resume.");
        return;
      }

      if (!isResumeText(text)) {
        alert("❌ This doesn't look like a resume. Please upload a valid resume file.");
        return;
      }

      // Step 2: Sending to server
      setCurrentStep(2);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://127.0.0.1:8000/parse_resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        alert("❌ Server error while processing the resume.");
        return;
      }

      const data = await response.json();
      if (!data || typeof data !== "object") {
        alert("❌ Received invalid response from the server.");
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 8000));

      // Step 3: Finalizing
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 12000));

      // Navigate to resume builder
      navigate('/resume-builder', { state: { parsedData: data } });

    } catch (error) {
      alert("❌ Something went wrong during file validation or upload.");
      console.log(error)
    } finally {
      setLoading(false);
    }
  };



  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#1d3f77', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <img src="/logo-incedo.png" alt="Incedo Logo" style={{ height: 32, marginRight: 16 }} />
      </Header>

      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f0f2f5',
          padding: 24,
          flex: 1,
        }}
      >
        <Card
          style={{
            width: 520,
            padding: 32,
            textAlign: 'center',
            borderRadius: 16,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <Title level={3} style={{ color: '#1d3f77', marginBottom: 24 }}>Upload Your Resume</Title>

          <Dragger {...props} style={{ borderRadius: 8, backgroundColor: '#fafafa' }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 48, color: '#1d3f77' }} />
            </p>
            <p className="ant-upload-text">Click or drag a PDF file to this area to upload</p>
            <Text type="secondary" style={{ fontSize: 12 }}>
              🔒 Your resume is processed locally and never leaves your browser.
            </Text>
          </Dragger>

          {selectedFile && (
            <>
              <div style={{ marginTop: 16 }}>
                <Text strong>Selected file:</Text>{' '}
                <Text code>{selectedFile.name}</Text>
              </div>

              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                style={{ marginTop: 24, backgroundColor: "#1d3f77" }}
                size="large"
                onClick={handleProceed}
              >
                Proceed
              </Button>

              {showSteps && (
                <>
                  <br />
                  <br />
                  {stepItems.map((step, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: currentStep > index ? '#52c41a' : currentStep === index ? '#1890ff' : '#d9d9d9',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          marginRight: 12,
                        }}
                      >
                        {currentStep === index ? (
                          <Spin size="small" style={{ color: '#fff' }} />
                        ) : currentStep > index ? (
                          '✓'
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span>{step.title}</span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
      </Card>
    </Content>
    </Layout >
  );
};

export default ResumeUpload;