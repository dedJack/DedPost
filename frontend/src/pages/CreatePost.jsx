// src/pages/CreatePost.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { createPost } from '../store/postSlice'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image, Video, ArrowLeft } from 'lucide-react'

const CreatePost = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isCreating } = useSelector((state) => state.posts)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [fileType, setFileType] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm()

  const caption = watch('caption', '')

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setFileType(file.type.startsWith('image/') ? 'image' : 'video')
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.webm'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  })

  const removeFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setFileType(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }

  const onSubmit = (data) => {
    if (!selectedFile) return

    const postData = {
      caption: data.caption,
      media: selectedFile,
    }

    dispatch(createPost(postData)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/')
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
            <p className="text-gray-600">Share your moment with the world</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Media Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Media</h2>
            
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-primary font-medium">Drop your file here</p>
                ) : (
                  <>
                    <p className="text-gray-900 font-medium mb-2">
                      Drag and drop your media here, or click to browse
                    </p>
                    <p className="text-gray-500 text-sm">
                      Supports images (JPEG, PNG, GIF, WebP) and videos (MP4, AVI, MOV, WebM)
                    </p>
                    <p className="text-gray-400 text-xs mt-1">Max file size: 10MB</p>
                  </>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  {fileType === 'image' ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-h-96 object-contain"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full max-h-96"
                    />
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
                >
                  <X size={16} />
                </button>

                <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
                  {fileType === 'image' ? <Image size={16} /> : <Video size={16} />}
                  <span>{selectedFile.name}</span>
                  <span>({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Write a Caption</h2>
            <div className="relative">
              <textarea
                {...register('caption', {
                  required: 'Caption is required',
                  minLength: {
                    value: 1,
                    message: 'Caption cannot be empty',
                  },
                  maxLength: {
                    value: 2000,
                    message: 'Caption must be less than 2000 characters',
                  },
                })}
                className="input-field resize-none"
                rows={4}
                placeholder="What's on your mind? Share your story..."
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {caption.length}/2000
              </div>
            </div>
            {errors.caption && (
              <p className="mt-2 text-sm text-red-600">{errors.caption.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!selectedFile || isCreating}
              className="btn-primary"
            >
              {isCreating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 spinner"></div>
                  <span>Publishing...</span>
                </div>
              ) : (
                'Publish Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost