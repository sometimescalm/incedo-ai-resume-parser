import React, { useState } from 'react';
import { useRef } from 'react';
import { Input, Button, Card, Row, Col, Divider, Form, Typography, Tag, Avatar, Progress, Layout, Rate } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Title, Text } = Typography;
const { Header, Content } = Layout;

const ResumeBuilder = () => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    summary: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    work: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
  });

  const location = useLocation();
  const navigate = useNavigate();


  useEffect(() => {
    console.log("Parsed Data from Location State:", location.state?.parsedData);
    if (location.state?.parsedData) {
      const parsed = location.state.parsedData;

      console.log("Mapping Parsed Data:", parsed);


      setFormData({
        name: parsed.full_name || '',
        title: parsed.designation || '',
        summary: parsed.professional_summary || '',
        email: parsed.email_id || '',
        phone: parsed.phone || '',
        linkedin: parsed.linkedin_id || '',
        github: parsed.github_portfolio || '',
        certifications: parsed.certifications ? parsed.certifications.split(',').map(c => c.trim()) : [],
        skills: parsed.skills ? parsed.skills.split(',').map(s => s.trim()) : [],
        education: parsed.education ? [{
          school: parsed.education, degree: '', gpa: '', date: '', info: ''
        }] : [],
        work: Array.isArray(parsed.work_experience) ? parsed.work_experience.map(w => ({
          company: w.company_name || '',
          title: w.role_name || '',
          date: w.project_duration || '',
          description: w.project_description || ''
        })) : [],
        projects: []  // Keep it empty for now
      });
    }
  }, [location.state]);

  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [score, setScore] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showAttachReminder, setShowAttachReminder] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const defaultImage = "user (1).png";
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const stripHtmlTags = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const addTag = (type, inputSetter, inputValue) => {
    if (inputValue.trim() !== '') {
      setFormData((prev) => ({ ...prev, [type]: [...prev[type], inputValue.trim()] }));
      inputSetter('');
    }
  };

  const removeTag = (type, value) => {
    setFormData((prev) => ({ ...prev, [type]: prev[type].filter((item) => item !== value) }));
  };

  const addItem = (field, emptyObj) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], emptyObj] }));
  };

  const deleteItem = (field, index) => {
    const updated = [...formData[field]];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const handleNestedChange = (field, index, key, value) => {
    const updated = [...formData[field]];
    updated[index][key] = value;
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const downloadPDF = () => {
    return new Promise((resolve) => {
      const element = document.getElementById('resume-preview');

      const opt = {
        margin: [0.2, 0, 0.5, 0],
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      };

      html2pdf().from(element).set(opt).save().then(() => resolve());
    });
  };

  const getFirstJobYear = (work = []) => {
    const years = work
      .map((job) => {
        const match = job.date?.match(/\b(19|20)\d{2}\b/); // e.g., matches 2020 from "2020-2022"
        return match ? parseInt(match[0]) : null;
      })
      .filter(Boolean);
    return years.length > 0 ? Math.min(...years) : null;
  };

  const firstJobYear = getFirstJobYear(formData.work);
  const currentYear = new Date().getFullYear();
  const totalExperience = firstJobYear ? currentYear - firstJobYear : 'N/A';
  const currentCompany = formData.work?.find(w => w.date?.toLowerCase().includes("present"))?.company || 'N/A';

  const downloadAndPrepareEmail = async () => {
    await downloadPDF();

    const formatCell = (label, value, labelWidth = 20) => {
      const val = value ? String(value) : '';
      return `${label.padEnd(labelWidth)}: ${val}`;
    };

    const subject = encodeURIComponent(`Resume of ${formData.name || 'Candidate'}`);
    const body = encodeURIComponent(
      `Hi,

Please find attached resume.

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

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const calculateScore = () => {
    let total = 0;
    let tips = [];

    if (formData.name) total += 10;
    else tips.push("Add your full name.");

    if (formData.title) total += 10;
    else tips.push("Include a designation/job title.");

    if (formData.summary) {
      total += 10;
      if (formData.summary.length >= 250) total += 10;
      else tips.push("Expand your summary to at least 250 characters.");
    } else {
      tips.push("Add a professional summary.");
    }

    const skillsCount = formData.skills.length;
    if (skillsCount >= 5) total += 15;
    else if (skillsCount > 0) {
      total += 8;
      tips.push("Include at least 5 professional skills for full score.");
    } else {
      tips.push("Add at least 5 professional skills.");
    }

    if (formData.certifications.length >= 2) total += 10;
    else tips.push("Mention at least 2 certifications.");

    if (formData.education.length > 0) total += 10;
    else tips.push("Add your education background.");

    const workExperienceValid = formData.work.some(
      (w) => w.description && w.description.length > 100
    );
    if (workExperienceValid) total += 20;
    else tips.push("Add at least one work experience with a detailed description (100+ characters).");

    if (profileImage) total += 5;
    else tips.push("Upload a profile picture.");

    setScore(total);
    setSuggestions(tips);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#1d3f77', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <img src="/logo-incedo.png" alt="Incedo Logo" style={{ height: 32, marginRight: 16 }} />

        <Button
          type="link"
          style={{ color: 'white', fontWeight: 'bold', marginLeft: 'auto' }}
          onClick={() => navigate('/')}
        >
          Back To Home
        </Button>
      </Header>

      <Layout.Content style={{ padding: 24, background: '#f0f2f5' }}>
        <Row gutter={16}>
          <Col span={12}><Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Button
                  type="link"
                  icon={<span style={{ fontSize: '16px' }}>←</span>}
                  onClick={() => navigate('/upload')}
                  style={{
                    padding: 0,
                    color: '#1d3f77',
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}
                >
                  Back
                </Button>
              </div>
            }
            bordered={false}
            style={{ borderRadius: '12px', background: '#ffffff', padding: '24px' }}
          >

            <Form layout="vertical">
              <Form.Item label={<strong>Upload Profile Picture</strong>}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setProfileImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {profileImage && (
                  <div style={{ marginTop: 8, textAlign: 'left' }}>
                    <img
                      src={profileImage}
                      alt="Preview"
                      style={{ width: 80, height: 80, borderRadius: '50%' }}
                    />
                    <Button
                      danger
                      size="small"
                      style={{ marginTop: 8, display: 'block' }}
                      onClick={() => {
                        setProfileImage(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''; // Reset the input
                        }
                      }}
                    >
                      Remove Photo
                    </Button>
                  </div>
                )}
              </Form.Item>

              <Form.Item label={<strong>Full Name</strong>}>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. POONAM GUPTA"
                  size="large"
                />
              </Form.Item>
              <Form.Item label={<strong>Designation</strong>}>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Software Test Automation Engineer"
                  size="large"
                />
              </Form.Item>
              <Form.Item label={<strong>Email</strong>}>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. user@example.com"
                  size="large"
                />
              </Form.Item>
              <Form.Item label={<strong>Phone</strong>}>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91-1234567890"
                  size="large"
                />
              </Form.Item>
              <Form.Item label={<strong>LinkedIn</strong>}>
                <Input
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="LinkedIn URL"
                  size="large"
                />
              </Form.Item>
              <Form.Item label={<strong>GitHub</strong>}>
                <Input
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="GitHub URL"
                  size="large"
                />
              </Form.Item>

              <Form.Item label={<strong>Summary</strong>}>
  <ReactQuill
    value={formData.summary}
    onChange={(value) => setFormData({ ...formData, summary: value })}
    modules={{
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean'],
      ],
    }}
    formats={[
      'header', 'bold', 'italic', 'underline',
      'list', 'bullet',
    ]}
    theme="snow"
    placeholder="Brief professional summary"
  />
</Form.Item>


              <Divider orientation="left">Certifications</Divider>
              <Input
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                placeholder="Add Certification"
                onPressEnter={() => addTag('certifications', setCertInput, certInput)}
              />
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                block
                onClick={() => addTag('certifications', setCertInput, certInput)}
                style={{ marginTop: 8 }}
              >
                Add Certification
              </Button>
              <div style={{ marginTop: 8 }}>{formData.certifications.map((cert, i) => <Tag closable key={i} onClose={() => removeTag('certifications', cert)}>{cert}</Tag>)}</div>

              <Divider orientation="left">Professional Skills</Divider>
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onPressEnter={() => addTag('skills', setSkillInput, skillInput)}
                placeholder="e.g. JavaScript"
              />
              <Button
                onClick={() => addTag('skills', setSkillInput, skillInput)}
                type="dashed"
                icon={<PlusOutlined />}
                block
                style={{ marginTop: 8 }}
              >
                Add Skill
              </Button>
              <div style={{ marginTop: 8 }}>{formData.skills.map((s, i) => <Tag closable key={i} onClose={() => removeTag('skills', s)}>{s}</Tag>)}</div>

              <Divider orientation="left">Education</Divider>
              {formData.education.map((edu, index) => (
                <Card key={index} size="small" style={{ marginBottom: 16 }} type="inner">
                  <Input
                    placeholder="Institution"
                    value={edu.school}
                    onChange={(e) => handleNestedChange('education', index, 'school', e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <Input
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => handleNestedChange('education', index, 'degree', e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <Input
                    placeholder="GPA"
                    value={edu.gpa}
                    onChange={(e) => handleNestedChange('education', index, 'gpa', e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <Input
                    placeholder="Duration"
                    value={edu.date}
                    onChange={(e) => handleNestedChange('education', index, 'date', e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <Input.TextArea
                    placeholder="Additional Info"
                    value={edu.info}
                    onChange={(e) => handleNestedChange('education', index, 'info', e.target.value)}
                    rows={3}
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    block
                    style={{ marginTop: 8 }}
                    onClick={() => deleteItem('education', index)}
                  >
                    Delete
                  </Button>
                </Card>
              ))}
              <Button
                icon={<PlusOutlined />}
                onClick={() => addItem('education', { school: '', degree: '', gpa: '', date: '', info: '' })}
                type="dashed"
                block
              >
                Add Education
              </Button>

              <Divider orientation="left">Projects</Divider>
              {formData.projects.map((proj, index) => (
                <Card key={index} size="small" style={{ marginBottom: 16 }} type="inner">
                  <Input
                    placeholder="Project Name"
                    value={proj.name}
                    onChange={(e) => handleNestedChange('projects', index, 'name', e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <Input.TextArea
                    placeholder="Description"
                    value={proj.description}
                    onChange={(e) => handleNestedChange('projects', index, 'description', e.target.value)}
                    rows={3}
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    block
                    style={{ marginTop: 8 }}
                    onClick={() => deleteItem('projects', index)}
                  >
                    Delete
                  </Button>
                </Card>
              ))}

              <Button
                icon={<PlusOutlined />}
                onClick={() => addItem('projects', { name: '', description: '' })}
                type="dashed"
                block
              >
                Add Project
              </Button>


              <Divider orientation="left">Work Experience</Divider>
              {formData.work.map((job, index) => (
                <Card key={index} size="small" style={{ marginBottom: 16 }} type="inner">
                  <Input
                    placeholder="Company"
                    value={job.company}
                    onChange={(e) => handleNestedChange('work', index, 'company', e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <Input
                    placeholder="Role"
                    value={job.title}
                    onChange={(e) => handleNestedChange('work', index, 'title', e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <Input
                    placeholder="Duration"
                    value={job.date}
                    onChange={(e) => handleNestedChange('work', index, 'date', e.target.value)}
                    style={{ marginBottom: 8 }}
                  />
                  <ReactQuill
                    value={job.description}
                    onChange={(value) =>
                      handleNestedChange('work', index, 'description', value)
                    }
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['clean'],
                      ],
                    }}
                    formats={['bold', 'italic', 'underline', 'list', 'bullet']}
                    theme="snow"
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    block
                    style={{ marginTop: 8 }}
                    onClick={() => deleteItem('work', index)}
                  >
                    Delete
                  </Button>
                </Card>
              ))}
              <Button
                icon={<PlusOutlined />}
                onClick={() => addItem('work', { company: '', title: '', date: '', description: '' })}
                type="dashed"
                block
              >
                Add Job
              </Button>
            </Form>
          </Card>
          </Col>

          <Col span={12}>        <Card
            id="resume-preview"
            bordered={false}
            style={{
              minHeight: '90vh',
              background: '#fff',
              padding: 0,
              borderRadius: '12px',
              overflow: 'hidden',
              fontFamily: 'Segoe UI, sans-serif',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ flex: 1 }}>

              <div style={{ position: 'relative', height: 250, overflow: 'hidden' }}>
                <svg
                  viewBox="0 0 1000 220"
                  preserveAspectRatio="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <polygon points="280,0 1000,0 1000,400 180,400 180,80" fill="#1d3f77" />
                </svg>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                    padding: '24px 40px',
                    color: '#fff'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 10,
                      top: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      zIndex: 2
                    }}
                  >
                    <img src="/logo-incedo.png" alt="Incedo Logo" style={{ width: 100, marginBottom: 40 }} />
                    <Avatar size={120} src={profileImage || defaultImage} />
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      left: 220,
                      top: 45,
                      color: '#fff',
                      zIndex: 3
                    }}
                  >
                    <h2 style={{ margin: 0, textTransform: 'uppercase' }}>
                      {formData.name || 'POONAM GUPTA'}
                    </h2>

                    {formData.title && (
                      <p style={{ fontStyle: 'italic', color: '#dbeafe', margin: '4px 0' }}>
                        {formData.title}
                      </p>
                    )}

                    {formData.email && (
                      <p style={{ marginTop: 12, marginBottom: 4 }}>
                        <strong>Email:</strong> {formData.email}
                      </p>
                    )}

                    {formData.phone && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>Phone:</strong> {formData.phone}
                      </p>
                    )}

                    {formData.linkedin && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>LinkedIn:</strong> {formData.linkedin}
                      </p>
                    )}

                    {formData.github && (
                      <p style={{ margin: 0 }}>
                        <strong>GitHub:</strong> {formData.github}
                      </p>
                    )}

                  </div>
                </div>
              </div>

              <div style={{ display: 'flex' }}>
                <div style={{ width: '40%', padding: '24px', borderRight: '1px dashed #999' }}>

                  {formData.skills?.length > 0 && (
                    <>
                      <Title level={5}>🛠 PROFESSIONAL SKILLS:</Title>
                      <ul>{formData.skills.map((s, i) => <li key={i}>{s}</li>)}</ul>
                    </>
                  )}

                  {/* Education */}
                  {formData.education?.length > 0 && (
                    <>
                      <Title level={5}>🎓 EDUCATION:</Title>
                      {formData.education.map((e, i) => (
                        <div key={i} style={{ marginBottom: 12 }}>
                          <Text strong>{e.school}</Text><br />
                        </div>
                      ))}
                    </>
                  )}

                  {formData.certifications?.length > 0 && (
                    <>
                      <Title level={5}>📄 CERTIFICATIONS:</Title>
                      <ul>{formData.certifications.map((c, i) => <li key={i}>{c}</li>)}</ul>
                    </>
                  )}
                </div>

                <div style={{ width: '60%', padding: '24px' }}>

                  {formData.summary && (
                    <>
                      <Title level={5} style={{ borderBottom: '1px solid #ccc' }}>🧾 SUMMARY:</Title>
                      <div dangerouslySetInnerHTML={{ __html: formData.summary }} />
                    </>
                  )}

                  {/* Work Experience */}
                  {formData.work?.length > 0 && (
                    <>
                      <Title level={5} style={{ borderBottom: '1px solid #ccc' }}>🩹 WORK EXPERIENCE:</Title>
                      {formData.work.map((w, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                          <Text strong>{w.company?.toUpperCase()}</Text> - {w.title?.toUpperCase()}<br />
                          <Text type="secondary">{w.date}</Text>
                          <div dangerouslySetInnerHTML={{ __html: w.description }} />
                        </div>
                      ))}
                    </>
                  )}

                  {formData.projects?.length > 0 && (
                    <>
                      <Title level={5} style={{ borderBottom: '1px solid #ccc' }}>📌 PROJECTS:</Title>
                      {formData.projects.map((p, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                          <Text strong>{p.name}</Text>
                          <p>{p.description}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 'auto', position: 'relative', height: 60 }}>
                <svg width="100%" height="60" viewBox="0 0 800 60" preserveAspectRatio="none">
                  <polygon points="0,0 600,0 500,70 0,70" fill="#1d3f77" />
                  <text x="20" y="38" fill="#fff" fontSize="18" fontStyle="italic">
                    Proprietary and confidential
                  </text>
                </svg>

                <img
                  src="/logo-incedo.png"
                  alt="Incedo Logo"
                  style={{
                    position: 'absolute',
                    right: 20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: 28
                  }}
                />
              </div>
            </div>
          </Card>

            <div style={{ textAlign: 'center', padding: '16px' }}>
              <Button type="primary" onClick={downloadPDF} style={{ marginRight: 12, backgroundColor: "#1d3f77" }}>
                Download PDF
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  downloadAndPrepareEmail();
                  setShowAttachReminder(true);
                }}
                style={{ marginRight: 12, backgroundColor: "#1d3f77" }}
              >
                Send Email
              </Button>
              <Button
                type="primary"
                onClick={calculateScore}
                style={{ marginRight: 12, backgroundColor: "#1d3f77" }}
              >
                Check Score
              </Button>

              {showAttachReminder && (
                <div style={{ marginTop: 16 }}>
                  <Typography.Text type="danger" strong>
                    ⚠️ Don't forget to attach the downloaded PDF resume in your email.
                  </Typography.Text>
                </div>
              )}

              {score !== null && (
                <div style={{ marginTop: 24 }}>
                  <Typography.Text strong>Resume Score: {score}/100</Typography.Text>
                  <Progress
                    percent={score}
                    status="active"
                    strokeColor={
                      score < 50
                        ? '#f5222d'
                        : score < 70
                          ? '#fa8c16'
                          : score < 85
                            ? '#52c41a'
                            : '#237804'
                    }
                  />

                  {/* ⭐ Star Rating Representation */}
                  <div style={{ marginTop: 8 }}>
                    <Typography.Text>Rating:</Typography.Text>
                    <Rate
                      disabled
                      allowHalf
                      value={Math.round(score / 20 * 2) / 2} // Convert score to 0–5 scale with half-stars
                    />
                  </div>
                </div>
              )}

              {suggestions.length > 0 && (
                <div
                  style={{
                    marginTop: 32,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    backgroundColor: '#f4f7fe',
                    borderRadius: 16,
                    padding: 24,
                    border: '1px solid #dbeafe',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {/* 🤖 AI Avatar */}
                  <Avatar
                    size={48}
                    style={{
                      backgroundColor: '#e0f0ff',
                      color: '#1d3f77',
                      fontSize: 24,
                    }}
                  >
                    🧠
                  </Avatar>

                  <div style={{ flex: 1 }}>
                    <Title level={5} style={{ marginBottom: 12, color: '#1d3f77' }}>
                      Smart Suggestions to Improve Your Resume
                    </Title>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {suggestions.map((tip, index) => (
                        <div
                          key={index}
                          style={{
                            background: '#ffffff',
                            borderRadius: 10,
                            padding: '12px 16px',
                            border: '1px solid #e4eaf2',
                            fontSize: 14,
                            color: '#333',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                          }}
                        >
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );

};

export default ResumeBuilder;