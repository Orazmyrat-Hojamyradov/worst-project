'use client'

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, Award, Activity } from 'lucide-react';

interface MultilingualField {
  en: string;
  ru: string;
  tm: string;
}

interface University {
  id: number;
  photoUrl: string | null;
  name: MultilingualField;
  description: MultilingualField;
}

const ANALYTICS_KEY = 'university_analytics';

const getAnalytics = (): Record<number, number> => {
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading analytics:', error);
    return {};
  }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

export default function UniversityAnalyticsDashboard({ universities, locale = 'en' }: { universities: University[], locale?: keyof MultilingualField }) {
  const [analytics, setAnalytics] = React.useState<Record<number, number>>({});
  const [totalClicks, setTotalClicks] = React.useState(0);
  const [topUniversities, setTopUniversities] = React.useState<any[]>([]);

  React.useEffect(() => {
    loadAnalytics();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadAnalytics();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Refresh every 2 seconds to catch same-tab updates
    const interval = setInterval(loadAnalytics, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [universities]);

  const loadAnalytics = () => {
    const analyticsData = getAnalytics();
    setAnalytics(analyticsData);
    
    // Calculate total clicks
    const total = Object.values(analyticsData).reduce((sum, clicks) => sum + clicks, 0);
    setTotalClicks(total);
    
    // Get top universities
    const sorted = Object.entries(analyticsData)
      .map(([id, clicks]) => {
        const uni = universities.find(u => u.id === parseInt(id));
        return {
          id: parseInt(id),
          name: uni ? (uni.name[locale] || uni.name.en) : `University #${id}`,
          clicks: clicks,
          percentage: total > 0 ? ((clicks / total) * 100).toFixed(1) : 0
        };
      })
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
    
    setTopUniversities(sorted);
  };

  const clearAllAnalytics = () => {
    if (window.confirm('Are you sure you want to clear all analytics data?')) {
      localStorage.removeItem(ANALYTICS_KEY);
      loadAnalytics();
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{payload[0].payload.name}</p>
          <p style={{ color: '#3b82f6' }}>Clicks: {payload[0].value}</p>
          <p style={{ color: '#6b7280', fontSize: '12px' }}>
            {payload[0].payload.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              📊 University Analytics Dashboard
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Track and analyze university engagement in real-time
            </p>
          </div>
          <button
            onClick={clearAllAnalytics}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(244,63,94,0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🗑️ Clear Analytics
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 10px 40px rgba(102,126,234,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Eye size={24} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>Total Clicks</h3>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{totalClicks.toLocaleString()}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 10px 40px rgba(240,147,251,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <TrendingUp size={24} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>Universities Tracked</h3>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{Object.keys(analytics).length}</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 10px 40px rgba(79,172,254,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Award size={24} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>Most Popular</h3>
          </div>
          <p style={{ fontSize: '20px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {topUniversities[0]?.name || 'No data yet'}
          </p>
          {topUniversities[0] && (
            <p style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
              {topUniversities[0].clicks} clicks
            </p>
          )}
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 10px 40px rgba(250,112,154,0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Activity size={24} />
            <h3 style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>Average Clicks</h3>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>
            {Object.keys(analytics).length > 0 
              ? (totalClicks / Object.keys(analytics).length).toFixed(1)
              : '0'}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Bar Chart */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
            📈 Top 10 Universities by Clicks
          </h2>
          {topUniversities.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topUniversities}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={150}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="clicks" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              height: '400px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: '16px'
            }}>
              No analytics data available. Click on universities to start tracking!
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
            🥧 Click Distribution
          </h2>
          {topUniversities.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={topUniversities.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="clicks"
                >
                  {topUniversities.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              height: '400px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: '16px'
            }}>
              No analytics data available. Click on universities to start tracking!
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
          🏆 University Leaderboard
        </h2>
        {topUniversities.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <th style={{ padding: '16px', textAlign: 'left', borderRadius: '8px 0 0 0' }}>Rank</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>University Name</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Clicks</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Percentage</th>
                  <th style={{ padding: '16px', textAlign: 'center', borderRadius: '0 8px 0 0' }}>Popularity</th>
                </tr>
              </thead>
              <tbody>
                {topUniversities.map((uni, index) => (
                  <tr 
                    key={uni.id}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background 0.2s',
                      background: index % 2 === 0 ? '#f9fafb' : 'white'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseOut={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#f9fafb' : 'white'}
                  >
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: index < 3 
                          ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' 
                          : '#e5e7eb',
                        color: index < 3 ? 'white' : '#6b7280',
                        textAlign: 'center',
                        lineHeight: '32px',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '600', color: '#1f2937' }}>{uni.name}</td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
                      {uni.clicks}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {uni.percentage}%
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{
                        width: '100%',
                        background: '#e5e7eb',
                        borderRadius: '8px',
                        height: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${uni.percentage}%`,
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                          height: '100%',
                          transition: 'width 0.5s'
                        }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '16px'
          }}>
            <Eye size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>No analytics data available yet.</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Start clicking on universities to see the magic! ✨</p>
          </div>
        )}
      </div>
    </div>
  );
}