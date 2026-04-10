package com.patientcare.service;

import com.patientcare.model.Notification;
import com.patientcare.model.Task;
import com.patientcare.model.User;
import com.patientcare.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Real-time clinical alert delivery via WebSocket (STOMP).
 * Notifications are persisted to DB AND pushed via WebSocket simultaneously.
 * This ensures coordinators receive instant alerts and can retrieve
 * missed notifications after reconnecting.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;

    @Async
    @Transactional
    public void sendTaskAssignedNotification(Task task, User recipient) {
        String title = "New Task Assigned";
        String message = String.format("You have been assigned task: \"%s\" for patient %s",
                task.getTitle(),
                task.getCarePlan() != null && task.getCarePlan().getPatient() != null
                        ? task.getCarePlan().getPatient().getFullName() : "Unknown");

        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .type(Notification.NotificationType.TASK_ASSIGNED)
                .severity(task.getPriority() == Task.Priority.CRITICAL
                        ? Notification.Severity.CRITICAL : Notification.Severity.INFO)
                .taskId(task.getId())
                .carePlanId(task.getCarePlan() != null ? task.getCarePlan().getId() : null)
                .patientId(task.getCarePlan() != null && task.getCarePlan().getPatient() != null
                        ? task.getCarePlan().getPatient().getId() : null)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Push real-time notification to the specific user's queue
        pushToUser(recipient.getUsername(), saved);
    }

    @Async
    @Transactional
    public void sendCriticalAlert(String title, String message, User recipient, Long patientId) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .type(Notification.NotificationType.CRITICAL_ALERT)
                .severity(Notification.Severity.CRITICAL)
                .patientId(patientId)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Push to user-specific queue
        pushToUser(recipient.getUsername(), saved);

        // Also broadcast to department topic for care coordinators
        messagingTemplate.convertAndSend("/topic/critical-alerts", Map.of(
                "id", saved.getId(),
                "title", saved.getTitle(),
                "message", saved.getMessage(),
                "severity", saved.getSeverity().name(),
                "patientId", patientId != null ? patientId : 0,
                "timestamp", saved.getCreatedAt().toString()
        ));

        log.info("Critical alert sent: {} to user: {}", title, recipient.getUsername());
    }

    @Async
    @Transactional
    public void sendTaskOverdueAlert(Task task) {
        if (task.getAssignedTo() == null) return;

        Notification notification = Notification.builder()
                .recipient(task.getAssignedTo())
                .title("Task Overdue")
                .message(String.format("Task \"%s\" is overdue. Please update the status.", task.getTitle()))
                .type(Notification.NotificationType.TASK_OVERDUE)
                .severity(Notification.Severity.WARNING)
                .taskId(task.getId())
                .build();

        Notification saved = notificationRepository.save(notification);
        pushToUser(task.getAssignedTo().getUsername(), saved);
    }

    @Transactional
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsRead(userId);
    }

    private void pushToUser(String username, Notification notification) {
        try {
            messagingTemplate.convertAndSendToUser(
                    username,
                    "/queue/notifications",
                    Map.of(
                            "id", notification.getId(),
                            "title", notification.getTitle(),
                            "message", notification.getMessage(),
                            "type", notification.getType().name(),
                            "severity", notification.getSeverity().name(),
                            "timestamp", notification.getCreatedAt().toString(),
                            "taskId", notification.getTaskId() != null ? notification.getTaskId() : 0,
                            "patientId", notification.getPatientId() != null ? notification.getPatientId() : 0
                    )
            );
        } catch (Exception e) {
            log.warn("Failed to push WebSocket notification to user {}: {}", username, e.getMessage());
        }
    }
}
