package com.patientcare.service;

import com.patientcare.dto.TaskDto;
import com.patientcare.exception.ResourceNotFoundException;
import com.patientcare.model.*;
import com.patientcare.repository.CarePlanRepository;
import com.patientcare.repository.TaskRepository;
import com.patientcare.repository.UserRepository;
import com.patientcare.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final CarePlanRepository carePlanRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<TaskDto.Response> getMyTasks(Task.TaskStatus status, Pageable pageable) {
        UserDetailsImpl user = getCurrentUser();
        return taskRepository.findByAssignedToId(user.getId(), status, pageable)
                .map(TaskDto.Response::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<TaskDto.Response> getTasksByCarePlan(Long carePlanId) {
        return taskRepository.findByCarePlanIdWithDetails(carePlanId)
                .stream()
                .map(TaskDto.Response::fromEntity)
                .toList();
    }

    @Transactional
    public TaskDto.Response createTask(TaskDto.CreateRequest request) {
        UserDetailsImpl currentUser = getCurrentUser();

        CarePlan carePlan = carePlanRepository.findById(request.getCarePlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Care plan not found"));

        User createdBy = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Task.TaskBuilder builder = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .notes(request.getNotes())
                .carePlan(carePlan)
                .createdBy(createdBy)
                .type(request.getType())
                .priority(request.getPriority() != null ? request.getPriority() : Task.Priority.MEDIUM)
                .status(Task.TaskStatus.PENDING)
                .dueDate(request.getDueDate());

        User assignedTo = null;
        if (request.getAssignedToId() != null) {
            assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            builder.assignedTo(assignedTo);
        }

        Task saved = taskRepository.save(builder.build());

        // Send real-time notification to assignee
        if (assignedTo != null) {
            notificationService.sendTaskAssignedNotification(saved, assignedTo);
        }

        auditService.log(AuditLog.AuditAction.CREATE, "TASK", saved.getId(),
                carePlan.getPatient() != null ? carePlan.getPatient().getId() : null,
                "Created task: " + saved.getTitle());

        return TaskDto.Response.fromEntity(saved);
    }

    @Transactional
    public TaskDto.Response updateTask(Long id, TaskDto.UpdateRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getNotes() != null) task.setNotes(request.getNotes());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getType() != null) task.setType(request.getType());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
            if (request.getStatus() == Task.TaskStatus.COMPLETED) {
                task.setCompletedAt(LocalDateTime.now());
            }
        }

        if (request.getAssignedToId() != null) {
            User assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
            task.setAssignedTo(assignedTo);
            notificationService.sendTaskAssignedNotification(task, assignedTo);
        }

        Task saved = taskRepository.save(task);

        auditService.log(AuditLog.AuditAction.UPDATE, "TASK", id,
                task.getCarePlan().getPatient() != null ? task.getCarePlan().getPatient().getId() : null,
                "Updated task: " + saved.getTitle() + " → status: " + saved.getStatus());

        return TaskDto.Response.fromEntity(saved);
    }

    private UserDetailsImpl getCurrentUser() {
        return (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
