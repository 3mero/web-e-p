"use client"

import { useEffect, useState, useCallback, useMemo } from "react"

// English translations
const en = {
  // Common
  files: "Files",
  newFile: "New File",
  uploadFile: "Upload File",
  save: "Save",
  saving: "Saving...",
  run: "Run",
  export: "Export",
  back: "Back",
  editor: "Editor",
  preview: "Preview",
  splitView: "Split View",

  // Project management
  createProject: "Create Project",
  projectName: "Project Name",
  description: "Description (optional)",
  createYourFirstProject: "Create Your First Project",
  noProjects: "No projects yet",
  noProjectsDescription: "Create a new project or import an existing one to get started.",

  // File management
  createNewFile: "Create New File",
  fileName: "File Name",
  fileNameDescription:
    "Include the file extension (e.g., .html, .css, .js) and folder path if needed (e.g., components/Button.js)",
  create: "Create",
  uploadFiles: "Upload Files",
  chooseFiles: "Choose Files",
  dragAndDropDescription: "Drag and drop files here, or click to select files",

  // Preview
  desktopView: "Desktop view",
  tabletView: "Tablet view",
  mobileView: "Mobile view",
  noPreview: "No preview available",
  clickRunForPreview: 'Click the "Run" button above to generate a preview',
  previewOnVercel: "Preview will automatically run when deployed to Vercel",

  // Binary files
  binaryFile: "Binary File",
  binaryFileDescription:
    "This file type cannot be edited in the text editor. You can download the project and edit this file with an appropriate application.",

  // Templates
  blankProject: "Blank Project",
  templates: "Templates",
  importZip: "Import ZIP",
  chooseTemplate: "Choose a template",
  selectTemplate: "Select a Template",

  // Errors
  error: "Error",
  fileCreationError: "Failed to create file",
  projectLoadError: "Failed to load project",

  // Success messages
  fileCreated: "File created",
  projectCreated: "Project created",
  changesSaved: "Changes saved",
}

// Arabic translations
const ar = {
  // Common
  files: "الملفات",
  newFile: "ملف جديد",
  uploadFile: "رفع ملف",
  save: "حفظ",
  saving: "جاري الحفظ...",
  run: "تشغيل",
  export: "تصدير",
  back: "رجوع",
  editor: "المحرر",
  preview: "معاينة",
  splitView: "عرض مقسم",

  // Project management
  createProject: "إنشاء مشروع",
  projectName: "اسم المشروع",
  description: "الوصف (اختياري)",
  createYourFirstProject: "إنشاء مشروعك الأول",
  noProjects: "لا توجد مشاريع بعد",
  noProjectsDescription: "قم بإنشاء مشروع جديد أو استيراد مشروع موجود للبدء.",

  // File management
  createNewFile: "إنشاء ملف جديد",
  fileName: "اسم الملف",
  fileNameDescription:
    "قم بتضمين امتداد الملف (مثل .html، .css، .js) ومسار المجلد إذا لزم الأمر (مثل components/Button.js)",
  create: "إنشاء",
  uploadFiles: "رفع ملفات",
  chooseFiles: "اختر الملفات",
  dragAndDropDescription: "اسحب وأفلت الملفات هنا، أو انقر لاختيار الملفات",

  // Preview
  desktopView: "عرض سطح المكتب",
  tabletView: "عرض الجهاز اللوحي",
  mobileView: "عرض الجوال",
  noPreview: "المعاينة غير متوفرة",
  clickRunForPreview: 'انقر على زر "تشغيل" أعلاه لإنشاء معاينة',
  previewOnVercel: "ستعمل المعاينة تلقائيًا عند رفعها إلى Vercel",

  // Binary files
  binaryFile: "ملف ثنائي",
  binaryFileDescription:
    "لا يمكن تحرير هذا النوع من الملفات في محرر النصوص. يمكنك تنزيل المشروع وتحرير هذا الملف باستخدام تطبيق مناسب.",

  // Templates
  blankProject: "مشروع فارغ",
  templates: "قوالب",
  importZip: "استيراد ZIP",
  chooseTemplate: "اختر قالبًا",
  selectTemplate: "اختر قالبًا",

  // Errors
  error: "خطأ",
  fileCreationError: "فشل في إنشاء الملف",
  projectLoadError: "فشل في تحميل المشروع",

  // Success messages
  fileCreated: "تم إنشاء الملف",
  projectCreated: "تم إنشاء المشروع",
  changesSaved: "تم حفظ التغييرات",
}

// Translation hook
export function useTranslation() {
  const [language, setLanguage] = useState<"en" | "ar">("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "en" | "ar"
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Memoize the translation function to prevent unnecessary re-renders
  const t = useCallback(
    (key: keyof typeof en): string => {
      const translations = language === "ar" ? ar : en
      return translations[key] || key
    },
    [language],
  )

  // Return memoized values
  return useMemo(() => ({ t, language }), [t, language])
}

