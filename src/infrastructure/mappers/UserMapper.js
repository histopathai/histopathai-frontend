import { User } from '@/core/entities/User.entity.js'

export class UserMapper {
    
    /**
     * Backend DTO -> Domain Entity
     * Converts backend UserResponse to frontend User entity
     */
    static toDomain(dto) {
        if(!dto) return null

        const userData = dto.user || dto

        return User.create({
            uuid: userData.uid,
            email: userData.email,
            displayName: userData.display_name,
            role: userData.role,
            status: userData.status,
            adminApproved: userData.admin_approved,
            approvalDate: userData.approval_date,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at
        })
    }

    /**
     * Domain Entity -> Backend DTO
     * Converts frontend User entity to backend UserRequest
     */
    static toDTO(entity) {
        if(!entity) return null

        return {
            uid: entity.uid,
            email: entity.email,
            display_name: entity.displayName,
            role: entity.role,
            status: entity.status,
            admin_approved: entity.adminApproved,
            approval_date: entity.approvalDate?.toISOString() || null,
            created_at: entity.createdAt.toISOString(),
            updated_at: entity.updatedAt.toISOString()
        }
    }
    
    /**
     * Array Conversion
     */
    static toDomainList(dtoArray) {
        if (!Array.isArray(dtoArray)) return []
        return dtoArray.map(dto => this.toDomain(dto)).filter(Boolean)
    }

    /**
     * Update DTO builder 
     */
    static toUpdateDTO(updates) {
    const dto = {}
    
    if (updates.displayName !== undefined) {
      dto.display_name = updates.displayName
    }
    if (updates.status !== undefined) {
      dto.status = updates.status
    }
    if (updates.role !== undefined) {
      dto.role = updates.role
    }
    if (updates.adminApproved !== undefined) {
      dto.admin_approved = updates.adminApproved
    }
    if (updates.approvalDate !== undefined) {
      dto.approval_date = updates.approvalDate?.toISOString() || null
    }

    return dto
  }
} 