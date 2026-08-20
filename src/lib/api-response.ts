import { NextResponse } from 'next/server'

export interface PaginationMeta {
  page: number
  limit: number
  total_data: number
  total_pages: number
}

export interface SuccessResponse<T> {
  success: true
  message: string
  data: T
  meta?: PaginationMeta
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown[]
  }
}

type ErrorCodes =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED_ACCESS'
  | 'FORBIDDEN_ACCESS'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_SERVER_ERROR'
  | 'TOO_MANY_REQUESTS'
  | 'ACCOUNT_LOCKED'

/**
 * Standard success response builder
 */
export function success<T>(data: T, message = 'Operasi berhasil', meta?: PaginationMeta) {
  const response: SuccessResponse<T> = { success: true, message, data }
  if (meta) response.meta = meta
  return NextResponse.json(response)
}

/**
 * Standard success response with 201 Created status
 */
export function created<T>(data: T, message = 'Data berhasil dibuat') {
  const response: SuccessResponse<T> = { success: true, message, data }
  return NextResponse.json(response, { status: 201 })
}

/**
 * Standard error response builder
 */
export function error(code: ErrorCodes, message: string, status: number, details?: unknown[]) {
  const response: ErrorResponse = {
    success: false,
    error: { code, message, details },
  }
  return NextResponse.json(response, { status })
}

/**
 * Build pagination metadata
 */
export function buildMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    page,
    limit,
    total_data: total,
    total_pages: Math.ceil(total / limit) || 1,
  }
}

/**
 * Parse pagination params from URL search params
 */
export function parsePagination(searchParams: URLSearchParams) {
  const rawPage = parseInt(searchParams.get('page') || '1', 10)
  const rawLimit = parseInt(searchParams.get('limit') || '10', 10)
  const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage)
  const limit = Math.min(100, Math.max(1, isNaN(rawLimit) ? 10 : rawLimit))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
