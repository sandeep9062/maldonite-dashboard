"use client";

import React, { useState, useCallback, useEffect } from "react"; // Added useEffect for cleanup
import {
  useGetTestimonialsQuery,
  useAddTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
} from "@/services/testimonialsApi";
import {
  Card, // Still keeping Card for potential other uses, though not for main testimonial display
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Trash2, PlusCircle, XCircle, UploadCloud } from "lucide-react";

// Import table components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define the form data structure, including separate fields for new files and current URLs
type TestimonialForm = {
  id?: string;
  name: string;
  designation?: string;
  company?: string;
  message: string;
  rating?: number;
  location?: string;
  imageFile: File | null;      // For a new image file to be uploaded
  iconFile: File | null;        // For a new icon file to be uploaded
  currentImageUrl?: string;    // To display the existing image URL when editing
  currentIconUrl?: string;     // To display the existing icon URL when editing
  imagePreview?: string;       // To display the preview of newly selected image file
  iconPreview?: string;        // To display the preview of newly selected icon file
};

export default function TestimonialsPage() {
  const { data, isLoading } = useGetTestimonialsQuery();
  const [addTestimonial, { isLoading: isAdding }] = useAddTestimonialMutation();
  const [updateTestimonial, { isLoading: isUpdating }] = useUpdateTestimonialMutation();
  const [deleteTestimonial] = useDeleteTestimonialMutation();

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<TestimonialForm>({
    name: "",
    designation: "",
    company: "",
    message: "",
    rating: 5,
    location: "",
    imageFile: null,
    iconFile: null,
    currentImageUrl: "",
    currentIconUrl: "",
    imagePreview: "", // Initialize preview states
    iconPreview: "",
  });

  const isSubmitting = isAdding || isUpdating;

  // Effect to clean up object URLs when component unmounts or previews change
  useEffect(() => {
    return () => {
      if (formData.imagePreview) URL.revokeObjectURL(formData.imagePreview);
      if (formData.iconPreview) URL.revokeObjectURL(formData.iconPreview);
    };
  }, [formData.imagePreview, formData.iconPreview]);


  // Handle changes for text input fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper to handle file selection and preview generation
  const handleFileSelect = (
    file: File | null,
    fileType: 'image' | 'icon'
  ) => {
    setFormData((prev) => {
      const newState: Partial<TestimonialForm> = {};
      // Revoke previous object URLs to prevent memory leaks
      if (fileType === 'image' && prev.imagePreview) {
        URL.revokeObjectURL(prev.imagePreview);
      } else if (fileType === 'icon' && prev.iconPreview) {
        URL.revokeObjectURL(prev.iconPreview);
      }

      if (fileType === 'image') {
        newState.imageFile = file;
        newState.imagePreview = file ? URL.createObjectURL(file) : "";
      } else { // fileType === 'icon'
        newState.iconFile = file;
        newState.iconPreview = file ? URL.createObjectURL(file) : "";
      }
      return { ...prev, ...newState };
    });
  };

  // Handle change for the image file input
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] || null, 'image');
  };

  // Handle change for the icon file input
  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] || null, 'icon');
  };

  // Generic drag event handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50'); // Add visual cue for drag over
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50'); // Remove visual cue
  }, []);

  // Handle drop for image file
  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(file, 'image');
        e.dataTransfer.clearData();
      } else {
        toast.error("Please drop an image file for the profile image.");
      }
    }
  }, [handleFileSelect]);

  // Handle drop for icon file
  const handleIconDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(file, 'icon');
        e.dataTransfer.clearData();
      } else {
        toast.error("Please drop an image file for the company icon.");
      }
    }
  }, [handleFileSelect]);


  // Handle form submission for adding or updating testimonials
  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      // Append text fields to FormData
      Object.entries(formData).forEach(([key, val]) => {
        if (key !== "imageFile" && key !== "iconFile" && key !== "currentImageUrl" && key !== "currentIconUrl" && key !== "imagePreview" && key !== "iconPreview" && val !== null && val !== undefined) {
          fd.append(key, val as any);
        }
      });

      // Handle image file upload or clear existing image
      if (formData.imageFile) {
        fd.append("image", formData.imageFile);
      } else if (formData.id && formData.currentImageUrl === "" && !formData.imageFile && formData.imagePreview === "") {
        // If it's an update, no new file is selected, current URL was explicitly cleared, and no preview is showing
        fd.append("image", ""); // Send empty string to signal clearing on backend
      }
      // If no new imageFile and currentImageUrl exists, nothing is appended for 'image',
      // which means the backend should retain the existing image URL.

      // Handle icon file upload or clear existing icon
      if (formData.iconFile) {
        fd.append("icon", formData.iconFile);
      } else if (formData.id && formData.currentIconUrl === "" && !formData.iconFile && formData.iconPreview === "") {
        // If it's an update, no new file is selected, current URL was explicitly cleared, and no preview is showing
        fd.append("icon", ""); // Send empty string to signal clearing on backend
      }
      // If no new iconFile and currentIconUrl exists, nothing is appended for 'icon',
      // which means the backend should retain the existing icon URL.


      if (formData.id) {
        await updateTestimonial({ id: formData.id, formData: fd }).unwrap();
        toast.success("Testimonial updated!");
      } else {
        await addTestimonial(fd).unwrap();
        toast.success("Testimonial added!");
      }
      // Reset form state after successful submission
      setFormData({
        name: "", designation: "", company: "", message: "", rating: 5, location: "",
        imageFile: null, iconFile: null, currentImageUrl: "", currentIconUrl: "",
        imagePreview: "", iconPreview: ""
      });
      setOpen(false); // Close the dialog
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  // Populate form data when editing an existing testimonial
  const handleEdit = (t: any) => {
    setFormData({
      id: t._id,
      name: t.name,
      designation: t.designation || "",
      company: t.company || "",
      message: t.message,
      rating: t.rating || 5,
      location: t.location || "",
      imageFile: null, // No new image file selected yet
      iconFile: null,  // No new icon file selected yet
      currentImageUrl: t.image || "", // Populate with existing image URL
      currentIconUrl: t.icon || "",   // Populate with existing icon URL
      imagePreview: "", // Clear any previous previews
      iconPreview: "",  // Clear any previous previews
    });
    setOpen(true); // Open the dialog for editing
  };

  // Handle testimonial deletion
  const handleDelete = async (id: string) => {
    try {
      await deleteTestimonial(id).unwrap();
      toast.success("Testimonial deleted!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Error deleting testimonial");
    }
  };

  return (
    <div className="h-auto bg-gray-100 p-8"> {/* Enhanced main background and padding */}
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-xl p-8"> {/* Centralized, card-like container */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200"> {/* Header with bottom border */}
          <h1 className="text-3xl font-extrabold text-gray-800">Customer Testimonials</h1> {/* More prominent title */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"> {/* Styled button */}
                <PlusCircle className="mr-2 h-5 w-6" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl h-[90vh] overflow-y-auto bg-white p-6 rounded-lg shadow-2xl"> {/* Enhanced dialog styling */}
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800 pb-3 border-b border-gray-200">
                  {formData.id ? "Edit Testimonial" : "Add New Testimonial"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4"> {/* Increased vertical spacing in form */}
                <Input
                  name="name"
                  placeholder="Customer Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" // Styled input
                />
                <Input
                  name="designation"
                  placeholder="Designation (e.g., CEO, Manager)"
                  value={formData.designation || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <Input
                  name="company"
                  placeholder="Company Name"
                  value={formData.company || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <Textarea
                  name="message"
                  placeholder="Testimonial Message"
                  value={formData.message}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px]" // Styled textarea with min-height
                />
                <Input
                  type="number"
                  name="rating"
                  placeholder="Rating (1-5)"
                  value={formData.rating || ""}
                  onChange={handleChange}
                  min="1" max="5" // Added min/max attributes for rating
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <Input
                  name="location"
                  placeholder="Location (e.g., New York, USA)"
                  value={formData.location || ""}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />

                {/* Profile Image Drag & Drop and Preview */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleImageDrop}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 ease-in-out group relative" // Enhanced drag area
                >
                  <UploadCloud className="h-12 w-12 text-gray-400 mb-3 group-hover:text-blue-600 transition-colors" />
                  <p className="text-base text-gray-600 font-medium mb-2">Drag & drop profile image here</p>
                  <p className="text-sm text-gray-500 mb-3">or click to select an image (Max 1MB)</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md cursor-pointer hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:scale-105">
                    Select Image
                  </label>

                  {/* Display Current or New Image Preview */}
                  {(formData.imagePreview || formData.currentImageUrl) && (
                    <div className="relative mt-5 p-2 bg-white rounded-full shadow-lg">
                      <img
                        src={formData.imagePreview || formData.currentImageUrl}
                        alt="Profile Preview"
                        className="h-28 w-28 rounded-full object-cover border-2 border-blue-200"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, currentImageUrl: "", imageFile: null, imagePreview: "" }))}
                        className="absolute -top-1 -right-1 text-red-500 hover:text-red-700 p-0 h-auto bg-white rounded-full shadow-md"
                      >
                        <XCircle className="h-7 w-7" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Company Icon Drag & Drop and Preview */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleIconDrop}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 ease-in-out group relative" // Enhanced drag area
                >
                  <UploadCloud className="h-12 w-12 text-gray-400 mb-3 group-hover:text-blue-600 transition-colors" />
                  <p className="text-base text-gray-600 font-medium mb-2">Drag & drop company icon here</p>
                  <p className="text-sm text-gray-500 mb-3">or click to select an icon (Max 1MB)</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleIconFileChange}
                    className="hidden"
                    id="icon-upload"
                  />
                   <label htmlFor="icon-upload" className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md cursor-pointer hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:scale-105">
                    Select Icon
                  </label>

                  {/* Display Current or New Icon Preview */}
                  {(formData.iconPreview || formData.currentIconUrl) && (
                    <div className="relative mt-5 p-2 bg-white rounded-lg shadow-lg">
                      <img
                        src={formData.iconPreview || formData.currentIconUrl}
                        alt="Icon Preview"
                        className="h-28 w-28 object-contain border-2 border-blue-200 rounded-md"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, currentIconUrl: "", iconFile: null, iconPreview: "" }))}
                        className="absolute -top-1 -right-1 text-red-500 hover:text-red-700 p-0 h-auto bg-white rounded-full shadow-md"
                      >
                        <XCircle className="h-7 w-7" />
                      </Button>
                    </div>
                  )}
                </div>

                <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : (formData.id ? "Update Testimonial" : "Add Testimonial")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-center text-lg text-gray-600 py-10">Loading testimonials... Please wait.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mt-6"> {/* Styled table container */}
            <Table>
              <TableHeader className="bg-gray-50"> {/* Styled table header */}
                <TableRow className="border-b border-gray-200">
                  <TableHead className="w-[60px] p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</TableHead>
                  <TableHead className="w-[60px] p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Icon</TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Designation</TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</TableHead>
                  <TableHead className="min-w-[250px] p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Message</TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</TableHead>
                  <TableHead className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</TableHead>
                  <TableHead className="text-right p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-100"> {/* Styled table body */}
                {data?.testimonials?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-gray-500 text-md">
                      No testimonials found. Add your first testimonial!
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.testimonials?.map((t: any) => (
                    <TableRow key={t._id} className="hover:bg-gray-50 transition-colors duration-150"> {/* Hover effect for rows */}
                      <TableCell className="p-4">
                        {t.image ? (
                          <img
                            src={t.image}
                            alt={t.name}
                            className="h-10 w-10 rounded-full object-cover shadow-sm"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">N/A</div>
                        )}
                      </TableCell>
                      <TableCell className="p-4">
                        {t.icon ? (
                          <img
                            src={t.icon}
                            alt={`${t.company} icon`}
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-gray-200 flex items-center justify-center text-xs text-gray-500">N/A</div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 p-2">{t.name}</TableCell>
                      <TableCell className="text-gray-700 p-2">{t.designation}</TableCell>
                      <TableCell className="text-gray-700 p-2">{t.company}</TableCell>
                      <TableCell className="text-sm text-gray-700 max-w-[150px] truncate p-2" title={t.message}>{t.message}</TableCell> {/* Added title for full message on hover */}
                      <TableCell className="text-yellow-500 font-semibold p-2">
                        {'⭐'.repeat(t.rating)}
                        <span className="text-gray-500 ml-1">({t.rating}/5)</span>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm p-2">{t.location}</TableCell>
                      <TableCell className="text-right p-2">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEdit(t)}
                            className="h-8 w-8 rounded-md border border-blue-400 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(t._id)}
                            className="h-8 w-8 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
