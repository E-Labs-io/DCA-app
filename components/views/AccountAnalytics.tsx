'use client';

import { Card, CardBody } from '@nextui-org/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

interface AccountAnalyticsProps {
  accountAddress: string;
}

export function AccountAnalytics({ accountAddress }: AccountAnalyticsProps) {
  // Mock data for now - will be replaced with real data
  const data = [
    { timestamp: '01/01', executions: 4, value: 1000 },
    { timestamp: '01/02', executions: 8, value: 1200 },
    { timestamp: '01/03', executions: 12, value: 1100 },
    { timestamp: '01/04', executions: 16, value: 1400 },
    { timestamp: '01/05', executions: 20, value: 1300 },
  ];

  return (
    <Card>
      <CardBody>
        <h4 className="text-lg font-semibold mb-4">Account Performance</h4>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="executions" 
                stroke="#22c55e" 
                name="Executions"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                name="Value ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}