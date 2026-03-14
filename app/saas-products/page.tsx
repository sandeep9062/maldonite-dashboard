"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Image as ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // ✅ Added Label
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/services/productsApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge"; // ✅ Added Badge

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  category: string;
  link: string;
  tagline?: string;
  technologies: string[];
  features: string[];
  specialFeature?: string;
  version?: string;
  status?: "Active" | "Inactive";
  pricingModel?: "Free" | "Subscription" | "One-time";
  license?: string;
  support?: string;
  demoUrl?: string;
  documentationUrl?: string;
  githubRepo?: string;
  launchDate?: string;
  inquiries?: number;
  performance?: {
    views?: number;
    leads?: number;
    conversionRate?: string;
  };
}

interface NewProduct {
  name: string;
  slug: string;
  description: string;
  category: string;
  image: File | null;
  link: string;
  tagline?: string;
  technologies: string[];
  features: string[];
  specialFeature?: string;
  version?: string;
  status?: "Active" | "Inactive";
  pricingModel?: "Free" | "Subscription" | "One-time";
  license?: string;
  support?: string;
  demoUrl?: string;
  documentationUrl?: string;
  githubRepo?: string;
  launchDate?: string;
}

const initialNewProductState: NewProduct = {
  name: "",
  slug: "",
  description: "",
  category: "SaaS",
  image: null,
  link: "",
  tagline: "",
  technologies: [],
  features: [],
  specialFeature: "",
  version: "1.0",
  status: "Active",
  pricingModel: "Subscription",
  license: "Proprietary",
  support: "Email & Chat Support",
  demoUrl: "",
  documentationUrl: "",
  githubRepo: "",
  launchDate: "",
};

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function SaaSProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsQuery({ category: selectedCategory });
  const [addProduct, { isLoading: isAddingProduct }] = useAddProductMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] =
    useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeletingProduct }] =
    useDeleteProductMutation();

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(
    null
  );

  const [newProduct, setNewProduct] = useState<NewProduct>(
    initialNewProductState
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [techString, setTechString] = useState("");
  const [featuresString, setFeaturesString] = useState("");

  const isSubmitting = isAddingProduct || isUpdatingProduct;

  useEffect(() => {
    if (selectedProduct) {
      const formattedLaunchDate = selectedProduct.launchDate
        ? new Date(selectedProduct.launchDate).toISOString().split("T")[0]
        : "";

      setNewProduct({
        ...selectedProduct,
        image: null,
        technologies: selectedProduct.technologies || [],
        features: selectedProduct.features || [],
        launchDate: formattedLaunchDate,
      });
      setImagePreview(selectedProduct.image);
      setTechString(selectedProduct.technologies.join(", "));
      setFeaturesString(selectedProduct.features.join(", "));
    } else {
      resetFormState();
    }
  }, [selectedProduct]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setNewProduct((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    multiple: false,
  });

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.slug) {
      toast.error("Product name and slug are required.");
      return;
    }
    const formData = new FormData();
    formData.append("slug", newProduct.slug);

    Object.entries(newProduct).forEach(([key, value]) => {
      if (value && key !== "slug") {
        if (Array.isArray(value)) {
          formData.append(key, value.join(","));
        } else {
          formData.append(key, value);
        }
      }
    });

    try {
      await addProduct(formData).unwrap();
      toast.success("Product added successfully!");
    } catch (error) {
      console.error("Failed to add product:", error);
      toast.error("Failed to add product.");
    } finally {
      setIsAddProductModalOpen(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct || !newProduct.name || !newProduct.slug) {
      toast.error("Product name and slug are required.");
      return;
    }
    const formData = new FormData();
    formData.append("slug", newProduct.slug);

    Object.entries(newProduct).forEach(([key, value]) => {
      if (value !== null && key !== "slug") {
        if (Array.isArray(value)) {
          formData.append(key, value.join(","));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value as string);
        }
      }
    });

    if (newProduct.image === null && selectedProduct.image) {
      // If no new file is selected, we still want to keep the old image URL
      // The API endpoint should handle this case
      formData.append("image", selectedProduct.image);
    }

    try {
      await updateProduct({ id: selectedProduct._id, data: formData }).unwrap();
      toast.success("Product updated successfully!");
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Failed to update product.");
    } finally {
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete product.");
    } finally {
      setProductIdToDelete(null);
    }
  };

  const getUniqueCategories = () => {
    if (!products) return [];
    const categories = products.map((product: Product) => product.category);
    return ["All Products", ...Array.from(new Set(categories))];
  };

  const resetFormState = () => {
    setNewProduct(initialNewProductState);
    setImagePreview(null);
    setTechString("");
    setFeaturesString("");
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <main className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SaaS Products</h1>
            <p className="text-muted-foreground">
              A comprehensive overview of your SaaS products.
            </p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6 flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">
            We couldn't load your products. Please try again later.
          </p>
        </div>
      </main>
    );
  }

  const renderForm = (isEdit: boolean) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle>Core Information</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    name: e.target.value,
                    slug: slugify(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                readOnly
                className="bg-gray-100 text-gray-800"
                value={newProduct.slug}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A detailed description of the product"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., SaaS, E-commerce, AI Tool"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                placeholder="A short, catchy tagline"
                value={newProduct.tagline}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, tagline: e.target.value })
                }
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <Label>Product Image</Label>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
              >
                <input {...getInputProps()} />
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="max-h-48 mx-auto rounded-md"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-500">
                      Drag 'n' drop an image here, or click to select one
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle>Technical Specs</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="technologies">Technologies</Label>
              <Input
                id="technologies"
                placeholder="e.g., React, Node.js, Vercel (comma-separated)"
                value={techString}
                onChange={(e) => setTechString(e.target.value)}
                onBlur={() => {
                  const technologiesArray = techString
                    .split(",")
                    .map((tech) => tech.trim())
                    .filter((tech) => tech);
                  setNewProduct({
                    ...newProduct,
                    technologies: technologiesArray,
                  });
                }}
              />
            </div>
            <div>
              <Label htmlFor="features">Features</Label>
              <Input
                id="features"
                placeholder="e.g., Dark Mode, API Access, Analytics (comma-separated)"
                value={featuresString}
                onChange={(e) => setFeaturesString(e.target.value)}
                onBlur={() => {
                  const featuresArray = featuresString
                    .split(",")
                    .map((feat) => feat.trim())
                    .filter((feat) => feat);
                  setNewProduct({ ...newProduct, features: featuresArray });
                }}
              />
            </div>
            <div>
              <Label htmlFor="specialFeature">Special Feature</Label>
              <Input
                id="specialFeature"
                placeholder="A unique selling point"
                value={newProduct.specialFeature}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    specialFeature: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle>Links & URLs</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link">Product Link</Label>
              <Input
                id="link"
                placeholder="https://yourproduct.com"
                value={newProduct.link}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, link: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="demoUrl">Demo URL</Label>
              <Input
                id="demoUrl"
                placeholder="https://demo.yourproduct.com"
                value={newProduct.demoUrl}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, demoUrl: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="documentationUrl">Documentation URL</Label>
              <Input
                id="documentationUrl"
                placeholder="https://docs.yourproduct.com"
                value={newProduct.documentationUrl}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    documentationUrl: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="githubRepo">GitHub Repo</Label>
              <Input
                id="githubRepo"
                placeholder="https://github.com/your-repo"
                value={newProduct.githubRepo}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, githubRepo: e.target.value })
                }
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle>Status & Details</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                placeholder="e.g., 1.0.0"
                value={newProduct.version}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, version: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={newProduct.status}
                onValueChange={(value: "Active" | "Inactive") =>
                  setNewProduct({ ...newProduct, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pricing Model</Label>
              <Select
                value={newProduct.pricingModel}
                onValueChange={(value: "Free" | "Subscription" | "One-time") =>
                  setNewProduct({ ...newProduct, pricingModel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pricing Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Subscription">Subscription</SelectItem>
                  <SelectItem value="One-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="license">License</Label>
              <Input
                id="license"
                placeholder="e.g., Proprietary, MIT"
                value={newProduct.license}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, license: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="support">Support</Label>
              <Input
                id="support"
                placeholder="e.g., Email, Live Chat"
                value={newProduct.support}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, support: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="launchDate">Launch Date</Label>
              <Input
                id="launchDate"
                type="date"
                value={newProduct.launchDate}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, launchDate: e.target.value })
                }
              />
            </div>
          </div>
        </Card>
      </div>

      <DialogFooter className="mt-6 flex justify-end gap-2">
        <Button
          onClick={isEdit ? handleUpdateProduct : handleAddProduct}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : isEdit
            ? "Save Changes"
            : "Save Product"}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <main className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            SaaS Products
          </h1>
          <p className="text-gray-500">
            A comprehensive overview of your SaaS products.
          </p>
        </div>
        <Dialog
          open={isAddProductModalOpen}
          onOpenChange={(open) => {
            setIsAddProductModalOpen(open);
            if (!open) resetFormState();
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={resetFormState}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent
            style={{ maxWidth: "80%" }}
            className="max-h-[95vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>Add New SaaS Product</DialogTitle>
            </DialogHeader>
            {renderForm(false)}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {getUniqueCategories().map((cat) => (
          <Button
            key={cat}
            variant={
              selectedCategory === cat ||
              (cat === "All Products" && !selectedCategory)
                ? "default"
                : "outline"
            }
            onClick={() =>
              setSelectedCategory(cat === "All Products" ? undefined : cat)
            }
            className="rounded-full"
          >
            {cat}
          </Button>
        ))}
      </div>

      {products && products.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product: Product) => (
            <Card key={product._id} className="flex flex-col overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <CardHeader className="grow pt-4 pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold">
                      {product.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {product.tagline}
                    </p>
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    {product.status}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Category:</strong> {product.category}
                  </p>
                  <p>
                    <strong>Pricing:</strong> {product.pricingModel}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col">
                <div className="text-sm text-gray-500 mt-2 grow">
                  <p className="line-clamp-2">{product.description}</p>
                </div>
                <div className="flex justify-between items-center mt-4 border-t pt-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setProductIdToDelete(product._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the product from your database.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(productIdToDelete!)}
                            disabled={isDeletingProduct}
                          >
                            {isDeletingProduct ? "Deleting..." : "Continue"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsPerformanceModalOpen(true);
                    }}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" /> Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700">
            No products yet
          </h3>
          <p className="text-muted-foreground mt-2">
            Click "Add Product" to get started and showcase your first product.
          </p>
        </div>
      )}

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          style={{ maxWidth: "80%" }}
          className="max-h-[95vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Edit {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && renderForm(true)}
        </DialogContent>
      </Dialog>

      {/* Performance Modal */}
      <Dialog
        open={isPerformanceModalOpen}
        onOpenChange={setIsPerformanceModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Performance Analytics for {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <p>
              <strong>Views:</strong> {selectedProduct?.performance?.views || 0}
            </p>
            <p>
              <strong>Leads:</strong> {selectedProduct?.performance?.leads || 0}
            </p>
            <p>
              <strong>Conversion Rate:</strong>{" "}
              {selectedProduct?.performance?.conversionRate || "0%"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
