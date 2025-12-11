import React, { useState } from 'react';
import { Layout, Card, Typography, Table, Tag, Button, Space, Progress, Descriptions, Empty } from 'antd';
import { 
  ArrowLeftOutlined, 
  DownloadOutlined, 
  FileTextOutlined, 
  QuestionCircleOutlined,
  ExportOutlined 
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const RankingResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // Get data from navigation state
  const rankingData = location.state?.rankingData || {};
  const jdInfo = location.state?.jdInfo || {};
  const candidates = rankingData.candidates || [];

  const getScoreColor = (score) => {
    if (score >= 90) return '#52c41a';
    if (score >= 80) return '#73d13d';
    if (score >= 70) return '#faad14';
    if (score >= 60) return '#fa8c16';
    return '#f5222d';
  };

  const handleConvertResume = (candidate) => {
    // Navigate to resume builder with candidate data
    navigate('/resume-builder', { 
      state: { 
        parsedData: candidate.parsed_data 
      } 
    });
  };

  const handleGenerateQnA = (candidate) => {
    // Navigate to interview QnA with pre-filled candidate info
    navigate('/interview-qna', {
      state: {
        candidateData: candidate,
        jdData: rankingData.jd_data
      }
    });
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export functionality
    console.log('Exporting top 10 to Excel...');
  };

  const handleDownloadAllReports = () => {
    // TODO: Implement download all reports functionality
    console.log('Downloading all reports...');
  };

  const columns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank) => (
        <Tag color={rank <= 3 ? 'gold' : rank <= 5 ? 'blue' : 'default'} style={{ fontSize: 16, padding: '4px 12px' }}>
          #{rank}
        </Tag>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <Text strong>{name || 'Unknown'}</Text>
          {record.email && (
            <div style={{ fontSize: 12, color: '#888' }}>{record.email}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Match Score',
      dataIndex: 'score',
      key: 'score',
      width: 150,
      render: (score) => (
        <div style={{ width: 120 }}>
          <Progress 
            percent={score} 
            strokeColor={getScoreColor(score)}
            format={(percent) => `${percent}/100`}
          />
        </div>
      ),
      sorter: (a, b) => b.score - a.score,
    },
    {
      title: 'Experience',
      dataIndex: 'experience',
      key: 'experience',
      width: 120,
      render: (exp) => <Text>{exp || 'N/A'}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => handleConvertResume(record)}
            style={{ backgroundColor: '#1d3f77' }}
          >
            Convert
          </Button>
          <Button 
            size="small"
            icon={<QuestionCircleOutlined />}
            onClick={() => handleGenerateQnA(record)}
          >
            QnA
          </Button>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <Card 
        style={{ 
          backgroundColor: '#fafafa', 
          border: '1px solid #e8e8e8',
          marginBottom: 16 
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Skills Match" span={1}>
            <Progress 
              percent={record.skills_match || 0} 
              strokeColor="#1d3f77"
              style={{ width: 200 }}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Education" span={1}>
            {record.education || 'Not specified'}
          </Descriptions.Item>
          <Descriptions.Item label="Key Skills" span={2}>
            {record.key_skills && record.key_skills.length > 0 ? (
              record.key_skills.map((skill, idx) => (
                <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>
                  {skill}
                </Tag>
              ))
            ) : (
              <Text type="secondary">No skills listed</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Gap Analysis" span={2}>
            {record.gap_analysis ? (
              <Text type="warning">{record.gap_analysis}</Text>
            ) : (
              <Text type="success">No significant gaps identified</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Summary" span={2}>
            <Text>{record.summary || 'No summary available'}</Text>
          </Descriptions.Item>
        </Descriptions>
        
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Button 
            icon={<DownloadOutlined />}
            onClick={() => {
              // TODO: Implement download original resume
              console.log('Downloading resume for:', record.name);
            }}
          >
            Download Original Resume
          </Button>
        </div>
      </Card>
    );
  };

  if (!candidates || candidates.length === 0) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ backgroundColor: '#1d3f77', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <img src="/logo-incedo.png" alt="Incedo Logo" style={{ height: 32, marginRight: 16 }} />
          <Button
            type="link"
            style={{ color: 'white', fontWeight: 'bold', marginLeft: 'auto' }}
            onClick={() => navigate('/')}
          >
            Home
          </Button>
        </Header>
        <Content style={{ padding: '40px 24px', background: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Card style={{ textAlign: 'center' }}>
            <Empty description="No ranking data found. Please analyze resumes first." />
            <Button type="primary" onClick={() => navigate('/bulk-analysis')} style={{ marginTop: 16 }}>
              Analyze Resumes
            </Button>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#1d3f77', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <img src="/logo-incedo.png" alt="Incedo Logo" style={{ height: 32, marginRight: 16 }} />
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          style={{ color: 'white', fontWeight: 'bold', marginLeft: 'auto' }}
          onClick={() => navigate('/bulk-analysis')}
        >
          Back
        </Button>
        <Button
          type="link"
          style={{ color: 'white', fontWeight: 'bold' }}
          onClick={() => navigate('/')}
        >
          Home
        </Button>
      </Header>

      <Content style={{ padding: '40px 24px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Header Card */}
          <Card style={{ marginBottom: 24, borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <Title level={3} style={{ margin: 0 }}>Resume Ranking Results</Title>
                <Text type="secondary">
                  {jdInfo.role && `Role: ${jdInfo.role} | `}
                  Analyzed: <strong>{jdInfo.totalResumes || candidates.length}</strong> resumes | 
                  Top <strong>{Math.min(10, candidates.length)}</strong> candidates
                </Text>
              </div>
              <Space>
                <Button 
                  type="primary" 
                  icon={<ExportOutlined />} 
                  onClick={handleExportExcel}
                  style={{ backgroundColor: '#1d3f77' }}
                >
                  Export Top 10 as Excel
                </Button>
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={handleDownloadAllReports}
                >
                  Download All Reports
                </Button>
              </Space>
            </div>
          </Card>

          {/* Statistics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ margin: 0, color: '#1d3f77' }}>
                  {candidates.length}
                </Title>
                <Text type="secondary">Total Candidates</Text>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                  {candidates.filter(c => c.score >= 80).length}
                </Title>
                <Text type="secondary">High Match (80+)</Text>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ margin: 0, color: '#faad14' }}>
                  {candidates.filter(c => c.score >= 60 && c.score < 80).length}
                </Title>
                <Text type="secondary">Medium Match (60-79)</Text>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ margin: 0, color: '#f5222d' }}>
                  {candidates.filter(c => c.score < 60).length}
                </Title>
                <Text type="secondary">Low Match (&lt;60)</Text>
              </div>
            </Card>
          </div>

          {/* Ranking Table */}
          <Card style={{ borderRadius: 12 }}>
            <Table
              columns={columns}
              dataSource={candidates.slice(0, 10)} // Show only top 10
              rowKey={(record) => record.id || record.rank}
              expandable={{
                expandedRowRender,
                expandedRowKeys,
                onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
              }}
              pagination={false}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default RankingResults;
