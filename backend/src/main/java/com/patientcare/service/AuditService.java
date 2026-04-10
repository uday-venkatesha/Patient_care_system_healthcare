package com.patientcare.service;

import com.patientcare.model.AuditLog;
import com.patientcare.repository.AuditLogRepository;
import com.patientcare.security.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * HIPAA-compliant audit trail service.
 * All patient record interactions are logged asynchronously
 * to avoid impacting clinical workflow response times.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(AuditLog.AuditAction action,
                    String resourceType,
                    Long resourceId,
                    Long patientId,
                    String details) {
        try {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
                return;
            }

            String ipAddress = extractIpAddress();
            String userAgent = extractUserAgent();

            AuditLog auditLog = AuditLog.builder()
                    .userId(userDetails.getId())
                    .username(userDetails.getUsername())
                    .userRole(userDetails.getRole())
                    .action(action)
                    .resourceType(resourceType)
                    .resourceId(resourceId)
                    .patientId(patientId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .success(true)
                    .build();

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to write audit log: {}", e.getMessage());
        }
    }

    private String extractIpAddress() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attrs.getRequest();
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        } catch (Exception e) {
            return "unknown";
        }
    }

    private String extractUserAgent() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            return attrs.getRequest().getHeader("User-Agent");
        } catch (Exception e) {
            return "unknown";
        }
    }
}
