import React, { useState } from 'react';
import 'antd/dist/reset.css';
import { Upload, Typography, Card, Button, Layout} from 'antd';
import { InboxOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { Header, Content } = Layout;


const ResumeUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const props = {
    name: 'file',
    multiple: false,
    accept: '.pdf',
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

  const handleProceed = async () => {
  if (!selectedFile) return;
  setLoading(true);

  try {
    const text = await extractTextFromPDF(selectedFile);

    if (!text || text.trim().length === 0) {
      console.log("⚠️ Empty file detected");
      alert("❌ The uploaded file appears to be empty. Please upload a valid resume.");
      return;
    }

    if (!isResumeText(text)) {
      console.log("⚠️ Non-resume file detected");
      alert("❌ This doesn't look like a resume. Please upload a valid resume file.");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    const response = await fetch('http://127.0.0.1:8000/parse_resume', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server Error:", errorText);
      alert("❌ Server error while processing the resume.");
      return;
    }

    const data = await response.json();
    if (!data || typeof data !== "object") {
      alert("❌ Received invalid response from the server.");
      return;
    }

    navigate('/resume-builder', { state: { parsedData: data } });

  } catch (error) {
    console.error("Unhandled Error:", error);
    alert("❌ Something went wrong during file validation or upload.");
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
                loading={loading}
              >
                Proceed
              </Button>
            </>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default ResumeUpload;
