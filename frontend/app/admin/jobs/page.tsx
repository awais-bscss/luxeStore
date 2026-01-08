"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Clock,
  Users,
  X,
  Loader2,
  DollarSign,
  Eye,
  Download,
  Mail,
  Phone,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Job {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience: string;
  salary?: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  isActive: boolean;
  isDeleted: boolean;
  applicationCount: number;
  createdAt: string;
}

interface Application {
  _id: string;
  job: string;
  applicantName: string;
  email: string;
  phone: string;
  coverLetter: string;
  resume: string;
  portfolio?: string;
  linkedIn?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  createdAt: string;
}

export default function AdminJobsPage() {
  const toast = useToast();
  const { user } = useSelector((state: RootState) => state.auth);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Applications state
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJobForApplications, setSelectedJobForApplications] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    experience: '',
    salary: '',
    description: '',
    responsibilities: [''],
    requirements: [''],
    benefits: [''],
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setJobs(data.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Error', 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        experience: job.experience,
        salary: job.salary || '',
        description: job.description,
        responsibilities: job.responsibilities.length > 0 ? job.responsibilities : [''],
        requirements: job.requirements.length > 0 ? job.requirements : [''],
        benefits: job.benefits.length > 0 ? job.benefits : [''],
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: '',
        department: '',
        location: '',
        type: 'full-time',
        experience: '',
        salary: '',
        description: '',
        responsibilities: [''],
        requirements: [''],
        benefits: [''],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingJob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingJob
        ? `${API_URL}/jobs/${editingJob._id}`
        : `${API_URL}/jobs`;

      const method = editingJob ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          responsibilities: formData.responsibilities.filter(r => r.trim()),
          requirements: formData.requirements.filter(r => r.trim()),
          benefits: formData.benefits.filter(b => b.trim()),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Success', editingJob ? 'Job updated successfully' : 'Job created successfully');
        fetchJobs();
        handleCloseModal();
      } else {
        toast.error('Error', data.message || 'Failed to save job');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Error', 'Failed to save job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (jobId: string) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/toggle-status`, {
        method: 'PATCH',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Success', data.message);
        fetchJobs();
      } else {
        toast.error('Error', data.message || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Error', 'Failed to toggle status');
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? All applications will also be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Success', 'Job deleted successfully');
        fetchJobs();
      } else {
        toast.error('Error', data.message || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Error', 'Failed to delete job');
    }
  };

  const addArrayField = (field: 'responsibilities' | 'requirements' | 'benefits') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

  const removeArrayField = (field: 'responsibilities' | 'requirements' | 'benefits', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const updateArrayField = (field: 'responsibilities' | 'requirements' | 'benefits', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray,
    });
  };

  const fetchApplications = async (jobId: string) => {
    setIsLoadingApplications(true);
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/applications`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setApplications(data.data.applications);
      } else {
        toast.error('Error', 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error', 'Failed to fetch applications');
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleViewApplications = (job: Job) => {
    // Navigate to dedicated applications page
    window.location.href = `/admin/jobs/${job._id}/applications`;
  };

  const handleCloseApplicationsModal = () => {
    setShowApplicationsModal(false);
    setSelectedJobForApplications(null);
    setApplications([]);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'full-time': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'part-time': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'contract': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'internship': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return colors[type] || colors['full-time'];
  };

  return (
    <div className="space-y-6 relative">
      {/* Top Loading Bar */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 z-50 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-loading-bar w-full" />
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Job Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage job postings and track applications
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {jobs.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <ToggleRight className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {jobs.filter(j => j.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {jobs.reduce((sum, job) => sum + job.applicationCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900/20">
              <ToggleLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactive</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {jobs.filter(j => !j.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
              </div>
              <div className="h-4 w-full bg-gray-50 dark:bg-gray-900/10 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-50 dark:bg-gray-900/10 rounded" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Briefcase className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Jobs Posted Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start by posting your first job opening
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {job.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                      {job.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                    {job.isActive ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {job.experience}
                    </span>
                    {job.salary && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {job.applicationCount} applications
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewApplications(job)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                    title="View Applications"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job._id)}
                    className={`p-2 rounded-lg transition-colors ${job.isActive
                      ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/30'
                      }`}
                    title={job.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {job.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleOpenModal(job)}
                    className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {job.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingJob ? 'Edit Job' : 'Post New Job'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Engineering"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="e.g., Faisalabad, Pakistan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="e.g., 3-5 years"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salary Range (Optional)
                </label>
                <input
                  type="text"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="e.g., Rs 80,000 - 120,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Describe the role and what the candidate will be doing..."
                />
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Responsibilities
                </label>
                {formData.responsibilities.map((resp, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) => updateArrayField('responsibilities', index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="Enter a responsibility"
                    />
                    {formData.responsibilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('responsibilities', index)}
                        className="px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('responsibilities')}
                  className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                >
                  + Add Responsibility
                </button>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Requirements
                </label>
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateArrayField('requirements', index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="Enter a requirement"
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('requirements', index)}
                        className="px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('requirements')}
                  className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                >
                  + Add Requirement
                </button>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Benefits
                </label>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => updateArrayField('benefits', index, e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="Enter a benefit"
                    />
                    {formData.benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('benefits', index)}
                        className="px-3 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('benefits')}
                  className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                >
                  + Add Benefit
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    editingJob ? 'Update Job' : 'Post Job'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && selectedJobForApplications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Applications for {selectedJobForApplications.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {applications.length} {applications.length === 1 ? 'application' : 'applications'} received
                </p>
              </div>
              <button
                onClick={handleCloseApplicationsModal}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {isLoadingApplications ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Applications Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No one has applied for this position yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application._id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {application.applicantName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Applied {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          application.status === 'reviewing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            application.status === 'shortlisted' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                              application.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${application.email}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                            {application.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${application.phone}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                            {application.phone}
                          </a>
                        </div>
                      </div>

                      {application.coverLetter && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Cover Letter
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`${API_URL}/download/resume?applicationId=${application._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download Resume
                        </a>
                        {application.portfolio && (
                          <a
                            href={application.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
