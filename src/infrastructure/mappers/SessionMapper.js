import {Session} from '@/core/entities/Session.entity.js'

/**
 * SessionResponse
 */
export class SessionMapper {
    /**
     * Backend DTO -> Domain Entity
     */
    static toDomain(dto) {
        if(!dto) return null

        const sessionData = dto.session || dto

        return Session.create({
            sessionId: sessionData.session_id,
            userId: sessionData.user_id,
            createdAt: sessionData.created_at,
            expiresAt: sessionData.expires_at,
            lastUsedAt: sessionData.last_used_at,
            requestCount: sessionData.request_count,
            metadata: sessionData.metadata
        })
    }

    /**
     * Domain Entity -> Backend DTO
     */
    static toDTO(entity) {
        if(!entity) return null

        return {
            session_id: entity.sessionId,
            user_id: entity.userId,
            created_at: entity.createdAt.toISOString(),
            expires_at: entity.expiresAt.toISOString(),
            last_used_at:  entity.lastUsedAt.toISOString(),
            request_count: entity.requestCount,
            metadata: entity.metadata
        }
    }

    /**
     * Array Conversion
     */
    static toDomainList(dtoArray) {
        if (!Array.isArray(dtoArray)) return []
        return dtoArray.map(dto => this.toDomain(dto)).filter(Boolean)
    }       
}