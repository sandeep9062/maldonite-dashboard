'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAddLeadMutation } from '../services/leadApi';
import { motion } from 'framer-motion';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddLeadModal({ isOpen, onClose }: AddLeadModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectType, setProjectType] = useState('');
  const [addLead, { isLoading }] = useAddLeadMutation();

  const handleSubmit = async () => {
    await addLead({ name, email, phone, projectType });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Lead</h2>
        
        <div className="grid gap-4">
          <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input placeholder="Project Type" value={projectType} onChange={(e) => setProjectType(e.target.value)} />
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose} className="px-5">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5"
          >
            {isLoading ? 'Adding...' : 'Add Lead'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
