import React, { useState } from 'react';
import { Layout, Card, Typography, Table, Tag, Button, Space, Progress, Descriptions, Alert } from 'antd';
import { 
  ArrowLeftOutlined, 
  QuestionCircleOutlined,
  TrophyOutlined,
  WarningOutlined
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

  // Debug logging
  console.log('=== RANKING RESULTS PAGE ===');
  console.log('Full response:', JSON.stringify(rankingData, null, 2));
  console.log('Candidates:', candidates.length);
  console.log('===========================');

  // Separate successful candidates and errors
  const successfulCandidates = candidates.filter(c => !c.error);
  const errorCandidates = candidates.filter(c => c.error);

  const handleGenerateQnA = (candidate) => {
    navigate('/interview-qna', {
      state: {
        candidateData: candidate,
        jdData: rankingData.jd_data
      }
    });
  };

  const columns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 90,
      render: (rank) => (
        <div style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: rank === 1 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' : 
                      rank === 2 ? 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)' : 
                      rank === 3 ? 'linear-gradient(135deg, #cd7f32 0%, #e5a672 100%)' : 
                      '#1d3f77',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: rank <= 3 ? '#333' : 'white',
          fontWeight: 'bold',
          fontSize: 20,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: rank <= 3 ? '3px solid white' : 'none'
        }}>
          {rank}
        </div>
      ),
    },
    {
      title: 'Candidate',
      key: 'candidate',
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 15 }}>{record.name || 'Unknown'}</Text>
          <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
            {record.email || 'No email'}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
            {record.filename}
          </div>
        </div>
      ),
    },
    {
      title: 'Overall Score',
      dataIndex: 'score',
      key: 'score',
      width: 180,
      render: (score) => {
        const scoreValue = score || 0;
        const color = scoreValue >= 70 ? '#52c41a' : 
                     scoreValue >= 50 ? '#faad14' : 
                     scoreValue >= 30 ? '#fa8c16' : '#f5222d';
        
        return (
          <div>
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text strong style={{ fontSize: 18, color }}>{scoreValue}</Text>
              <Text type="secondary" style={{ fontSize: 14 }}>/ 100</Text>
            </div>
            <Progress 
              percent={scoreValue} 
              strokeColor={color}
              showInfo={false}
              strokeWidth={10}
            />
          </div>
        );
      },
      sorter: (a, b) => (b.score || 0) - (a.score || 0),
    },
    {
      title: 'Experience',
      dataIndex: 'experience',
      key: 'experience',
      width: 130,
      render: (exp) => (
        <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>
          {exp || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Skills Match',
      dataIndex: 'skills_match',
      key: 'skills_match',
      width: 140,
      render: (match) => {
        const matchValue = match || 0;
        const color = matchValue >= 70 ? 'green' : 
                     matchValue >= 50 ? 'orange' : 
                     'red';
        
        return (
          <Tag color={color} style={{ fontSize: 14, padding: '4px 12px', fontWeight: 500 }}>
            {matchValue}% Match
          </Tag>
        );
      },
      sorter: (a, b) => (b.skills_match || 0) - (a.skills_match || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button 
          type="primary"
          size="small"
          icon={<QuestionCircleOutlined />}
          onClick={() => handleGenerateQnA(record)}
          style={{ backgroundColor: '#1d3f77' }}
        >
          Generate QnA
        </Button>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <div style={{ padding: '16px 24px', background: '#fafafa' }}>
        <Descriptions 
          bordered 
          column={2} 
          size="middle"
          labelStyle={{ fontWeight: 600, background: '#f5f5f5' }}
        >
          <Descriptions.Item label="Email" span={1}>
            <Text copyable>{record.email || 'Not provided'}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="Skills Match" span={1}>
            <Progress 
              percent={record.skills_match || 0} 
              strokeColor="#1d3f77"
              style={{ width: 200 }}
              format={(percent) => `${percent}%`}
            />
          </Descriptions.Item>

          <Descriptions.Item label="Education" span={2}>
            <Text>{record.education || 'Not specified'}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Key Skills" span={2}>
            {(() => {
              // First try parsed_data.key_skills, then fall back to top-level key_skills
              const skills = record.parsed_data?.key_skills || record.key_skills;
              
              // Handle null or undefined
              if (!skills) {
                return <Text type="secondary" italic>No specific skills extracted</Text>;
              }
              
              // Handle array
              if (Array.isArray(skills) && skills.length > 0) {
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {skills.map((skill, idx) => (
                      <Tag key={idx} color="blue" style={{ marginBottom: 4, fontSize: 13 }}>
                        {skill}
                      </Tag>
                    ))}
                  </div>
                );
              }
              
              // Handle comma-separated string (backend format)
              if (typeof skills === 'string' && skills.trim()) {
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {skills.split(',').map((skill, idx) => (
                      <Tag key={idx} color="blue" style={{ marginBottom: 4, fontSize: 13 }}>
                        {skill.trim()}
                      </Tag>
                    ))}
                  </div>
                );
              }
              
              return <Text type="secondary" italic>No skills listed</Text>;
            })()}
          </Descriptions.Item>

          <Descriptions.Item label="Gap Analysis" span={2}>
            <div style={{ 
              padding: 12, 
              background: '#fff7e6', 
              border: '1px solid #ffd591',
              borderRadius: 6 
            }}>
              <Text style={{ color: '#ad6800' }}>
                {record.gap_analysis || 'No gaps identified'}
              </Text>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Summary" span={2}>
            <div style={{ 
              padding: 12, 
              background: '#f6ffed', 
              border: '1px solid #b7eb8f',
              borderRadius: 6 
            }}>
              <Text style={{ color: '#389e0d' }}>
                {record.summary || 'No summary available'}
              </Text>
            </div>
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Header style={{
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 48px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        height: 72,
        borderBottom: '1px solid #e8ecf0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logo-incedo.png" alt="Incedo Logo" style={{ height: 40 }} />
          <Title level={4} style={{ margin: 0, color: '#1d3f77', fontWeight: 600 }}>
            Ranking Results
          </Title>
        </div>
        <Button
          size="large"
          icon={<ArrowLeftOutlined />}
          style={{
            marginLeft: 'auto',
            borderRadius: 8,
            fontWeight: 500
          }}
          onClick={() => navigate('/bulk-analysis')}
        >
          Back to Analysis
        </Button>
      </Header>

      <Content style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Summary Card */}
          <Card
            style={{
              marginBottom: 24,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
            }}
            bodyStyle={{ padding: '32px 40px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrophyOutlined style={{ fontSize: 40, color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <Title level={3} style={{ margin: 0, color: 'white' }}>
                  Analysis Complete
                </Title>
                <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)' }}>
                  {successfulCandidates.length} candidates analyzed successfully
                  {errorCandidates.length > 0 && ` • ${errorCandidates.length} errors`}
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>
                  Job Role
                </div>
                <Text strong style={{ fontSize: 18, color: 'white' }}>
                  {jdInfo.role || 'Not specified'}
                </Text>
              </div>
            </div>
          </Card>

          {/* Error Alerts */}
          {errorCandidates.length > 0 && (
            <Alert
              message="Processing Errors"
              description={
                <div>
                  <Text>The following resumes could not be processed:</Text>
                  <ul style={{ marginTop: 8, marginBottom: 0 }}>
                    {errorCandidates.map((candidate, idx) => (
                      <li key={idx}>
                        <Text strong>{candidate.filename}</Text>
                        <div style={{ marginTop: 4, fontSize: 12, color: '#ff4d4f' }}>
                          {candidate.error.includes('429') 
                            ? 'API Rate Limit Exceeded - Please try again later' 
                            : candidate.error}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              }
              type="error"
              icon={<WarningOutlined />}
              showIcon
              style={{ marginBottom: 24, borderRadius: 12 }}
            />
          )}

          {/* Results Table */}
          <Card
            style={{
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              border: '1px solid #e8ecf0'
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid #e8ecf0' }}>
              <Title level={4} style={{ margin: 0, color: '#1d3f77' }}>
                Top Candidates ({successfulCandidates.length})
              </Title>
              <Text type="secondary">Ranked by overall match score</Text>
            </div>

            <Table
              columns={columns}
              dataSource={successfulCandidates}
              rowKey={(record) => record.rank}
              expandable={{
                expandedRowRender,
                expandedRowKeys,
                onExpandedRowsChange: setExpandedRowKeys,
                expandIcon: ({ expanded, onExpand, record }) => (
                  <Button
                    type="text"
                    size="small"
                    onClick={(e) => onExpand(record, e)}
                    style={{ fontWeight: 500 }}
                  >
                    {expanded ? '− Hide Details' : '+ Show Details'}
                  </Button>
                ),
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} candidates`,
              }}
              style={{ padding: 0 }}
            />
          </Card>

          {/* Key Skills Warning */}
          {successfulCandidates.some(c => c.key_skills === null && !c.parsed_data?.key_skills) && (
            <Alert
              message="Note: Key Skills Extraction Issue"
              description='Key skills are not available in the expected format. Backend should parse and return skills properly.'
              type="warning"
              showIcon
              style={{ marginTop: 24, borderRadius: 12 }}
            />
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default RankingResults;