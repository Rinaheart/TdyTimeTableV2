
import React from 'react';

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const VI_DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

export const SESSION_COLORS = {
  morning: 'bg-blue-50 border-blue-200 text-blue-700',
  afternoon: 'bg-orange-50 border-orange-200 text-orange-700',
  evening: 'bg-purple-50 border-purple-200 text-purple-700'
};

export const COURSE_TYPE_COLORS = {
  LT: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  TH: 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

export const DEFAULT_THRESHOLDS = {
  daily: { warning: 8, danger: 10 },
  weekly: { warning: 25, danger: 35 }
};

// Định nghĩa thời gian tiết học chuẩn theo AboutView
// Format: [Giờ, Phút]
export const PERIOD_TIMES: Record<number, { start: [number, number], end: [number, number] }> = {
  // Sáng
  1: { start: [7, 0], end: [7, 45] },
  2: { start: [7, 55], end: [8, 40] },
  3: { start: [8, 50], end: [9, 35] },
  4: { start: [9, 45], end: [10, 30] },
  5: { start: [10, 40], end: [11, 25] }, // Dự phòng
  
  // Chiều
  6: { start: [13, 30], end: [14, 15] },
  7: { start: [14, 25], end: [15, 10] },
  8: { start: [15, 20], end: [16, 5] },
  9: { start: [16, 15], end: [17, 0] },
  
  // Tối
  10: { start: [17, 10], end: [17, 55] },
  11: { start: [18, 0], end: [18, 45] },
  12: { start: [18, 50], end: [19, 35] },
  13: { start: [19, 45], end: [20, 30] } // Dự phòng
};
