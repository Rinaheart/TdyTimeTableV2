
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
