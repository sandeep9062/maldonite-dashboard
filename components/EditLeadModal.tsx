'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateLeadMutation } from '../services/leadApi';
import { motion } from 'framer-motion';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any | null; // the selected lead object
}

export default function EditLeadModal({ isOpen, onClose, lead }: EditLeadModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectType, setProjectType] = useState('');
  const [updateLead, { isLoading }] = useUpdateLeadMutation();

  // preload data when modal opens
  useEffect(() => {
    if (lead) {
      setName(lead.name || '');
      setEmail(lead.email || '');
      setPhone(lead.phone || '');
      setProjectType(lead.projectType || '');
    }
  }, [lead]);

  const handleSubmit = async () => {
    if (!lead?._id) return;

    await updateLead({
      id: lead._id,
      data: { name, email, phone, projectType },
    });

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
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Lead</h2>

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
            className="bg-green-600 hover:bg-green-700 text-white px-5"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
