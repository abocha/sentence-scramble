import React from 'react';
import Header from './Header';
import TeacherPanel from './TeacherPanel';

const TeacherApp: React.FC = () => (
  <div className="min-h-screen font-sans text-gray-800 flex flex-col items-center p-4 sm:p-6 md:p-8 bg-gray-50">
    <Header />
    <TeacherPanel />
  </div>
);

export default TeacherApp;
