import { ylearnEnrolmentApi } from '../services'

export const getEnrolment = (id: string) => ylearnEnrolmentApi.getEnrolment(id)
export const getUserEnrolments = () => ylearnEnrolmentApi.getUserEnrolments()
export const getCourseEnrolments = (courseId: string) => ylearnEnrolmentApi.getCourseEnrolments(courseId)
export const createDraftEnrolment = (_userId: string, courseId: string) =>
  ylearnEnrolmentApi.startEnrolment(courseId)
export const finalizeEnrolment = (id: string, paymentMethod: string, simulateFailure?: boolean) =>
  ylearnEnrolmentApi.finalizeEnrolment(id, paymentMethod, simulateFailure)
export const withdrawEnrolment = (id: string) => ylearnEnrolmentApi.withdrawEnrolment(id)
export const removeLearner = (id: string, _adminId: string, reason: string, note?: string) =>
  ylearnEnrolmentApi.removeLearner(id, reason, note)
export const userCanAccessContent = (courseId: string) =>
  ylearnEnrolmentApi.userCanAccessContent(courseId)
