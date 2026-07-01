/** Visual assets for course subjects — Unsplash (free to use). */
const SUBJECT_IMAGES: Record<string, string> = {
  programming: 'https://images.unsplash.com/photo-1461749680684-dccba630e2f6?w=800&q=80',
  coding: 'https://images.unsplash.com/photo-1461749680684-dccba630e2f6?w=800&q=80',
  'web development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
  'data science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  cybersecurity: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
  networking: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a0?w=800&q=80',
  'cloud computing': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  'artificial intelligence': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
  ai: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
  'mobile development': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
  database: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
  devops: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'

export function getCourseImage(subject: string, courseName = ''): string {
  const haystack = `${subject} ${courseName}`.toLowerCase()
  for (const [key, url] of Object.entries(SUBJECT_IMAGES)) {
    if (haystack.includes(key)) return url
  }
  return DEFAULT_IMAGE
}

export const FEATURED_VIDEOS = [
  {
    id: 'intro-programming',
    title: 'Introduction to Programming',
    description: 'Learn the fundamentals of coding and computational thinking.',
    youtubeId: 'zOjov-2OZ0E',
    subject: 'Programming',
  },
  {
    id: 'web-basics',
    title: 'Web Development Essentials',
    description: 'HTML, CSS, and how modern websites are built.',
    youtubeId: 'PlxWf493en4',
    subject: 'Web Development',
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics Overview',
    description: 'Turn raw data into insights with charts and dashboards.',
    youtubeId: 'ua-CiDNNj30',
    subject: 'Data Science',
  },
] as const

export const TECH_SUBJECTS = [
  'Programming',
  'Web Development',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing',
  'AI & Machine Learning',
] as const
