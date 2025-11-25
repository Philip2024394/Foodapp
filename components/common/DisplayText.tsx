import React from 'react';
import { useContent } from '../../context/ContentContext';

interface DisplayTextProps {
  editId: string; // This MUST match the ID from the Admin Portal
  defaultValue: string;
  as?: React.ElementType; // e.g., 'h1', 'p', 'span'
  className?: string;
}

const DisplayText: React.FC<DisplayTextProps> = ({ editId, defaultValue, as: Tag = 'span', className }) => {
  const content = useContent();
  // Use the text from the API if it exists, otherwise use the default
  const textToShow = content?.text?.[editId] || defaultValue;
  return <Tag className={className}>{textToShow}</Tag>;
};

export default DisplayText;
