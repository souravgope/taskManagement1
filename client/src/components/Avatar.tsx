import React from 'react';

interface Props {
  id?: string;
  name?: string;
  email?: string;
  size?: number;
}

// Simple hash -> color
const colors = [
  'bg-red-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-purple-500',
  'bg-teal-500',
];

const getColor = (id?: string) => {
  if (!id) return colors[0];
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = id.charCodeAt(i) + ((h << 5) - h);
  }
  const idx = Math.abs(h) % colors.length;
  return colors[idx];
};

const Avatar: React.FC<Props> = ({ id, name, email, size = 10 }) => {
  const initials = (() => {
    const source = name || email || id || '';
    const parts = source.trim().split(/\s+/);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  })();

  const color = getColor(id || name || email);

  return (
    <div className={`flex items-center space-x-3`}> 
      <div className={`${color} text-white rounded-full flex items-center justify-center`} style={{ width: size * 4, height: size * 4, fontSize: size * 1.2 }}>
        {initials}
      </div>
    </div>
  );
};

export default Avatar;
