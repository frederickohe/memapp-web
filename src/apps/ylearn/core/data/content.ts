import { ylearnEnrolmentApi } from '../services'

export const getCourseContent = (courseId: string) => ylearnEnrolmentApi.getCourseContent(courseId)
